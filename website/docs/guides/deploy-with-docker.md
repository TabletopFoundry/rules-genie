---
id: deploy-with-docker
title: Deploy with Docker
sidebar_position: 3
description: Ship RulesGenie to production as a single ~150 MB container.
---

# Deploy with Docker

RulesGenie ships a multi-stage `Dockerfile` that produces a tiny
standalone Next.js image.

## Build

From the repository root:

```bash
docker build -t rulesgenie:latest .
```

The build uses three stages — `deps`, `builder`, `runner` — and the
final image is ~150 MB. It runs as a non-root user.

## Run (single container)

```bash
docker run -d \
  --name rulesgenie \
  -p 3000:3000 \
  -v rulesgenie-data:/app/data \
  -e RULESGENIE_DB_PATH=/app/data/rulesgenie.db \
  rulesgenie:latest
```

Key flags:

- `-v rulesgenie-data:/app/data` mounts a named volume for SQLite persistence.
- `RULESGENIE_DB_PATH` points the app at the mounted volume.
- The container does **not** seed dev data when `NODE_ENV=production`
  (which the image sets by default), so the first request starts from
  an empty DB. Ship your catalog via a startup migration.

## Run with OpenAI

```bash
docker run -d \
  --name rulesgenie \
  -p 3000:3000 \
  -v rulesgenie-data:/app/data \
  -e RULESGENIE_DB_PATH=/app/data/rulesgenie.db \
  -e RULESGENIE_DEMO_MODE=false \
  -e OPENAI_API_KEY=sk-... \
  -e OPENAI_MODEL=gpt-4o-mini \
  rulesgenie:latest
```

For real deployments, source the key from your platform's secret store
(Docker secrets, Kubernetes secrets, AWS SSM, etc.) — never bake it
into the image.

## docker-compose

```yaml title="docker-compose.yml"
services:
  rulesgenie:
    image: rulesgenie:latest
    build: .
    ports:
      - "3000:3000"
    environment:
      RULESGENIE_DEMO_MODE: "false"
      RULESGENIE_DB_PATH: /app/data/rulesgenie.db
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      OPENAI_MODEL: gpt-4o-mini
    volumes:
      - rulesgenie-data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1))"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  rulesgenie-data:
```

Bring it up:

```bash
OPENAI_API_KEY=sk-... docker compose up -d
docker compose logs -f rulesgenie
```

## Behind a reverse proxy

A minimal Caddy config terminates TLS and rate-limits `/api/ask`:

```caddy title="Caddyfile"
rules.example.com {
  encode zstd gzip
  @ask path /api/ask
  rate_limit @ask {
    zone ask_zone
    events 30
    window 1m
  }
  reverse_proxy localhost:3000
}
```

## Health checks

`GET /api/health` returns:

- **200** with `status: "healthy"` when the app and SQLite are responsive
- **503** with `status: "unhealthy"` if the database can't be opened

It includes the active mode (`demo` / `live`), game count, and uptime
seconds. Use it as the liveness probe in Kubernetes, the healthcheck
in compose, or the target of your uptime monitor.

```bash
curl -s https://rules.example.com/api/health | jq .
```

## Backups

The entire app state lives in `/app/data/rulesgenie.db`. Back it up by
copying that file while the app is briefly paused, or use SQLite's
`.backup` command for an online snapshot:

```bash
docker exec rulesgenie sqlite3 /app/data/rulesgenie.db ".backup /app/data/backup.db"
docker cp rulesgenie:/app/data/backup.db ./rulesgenie-$(date +%F).db
```
