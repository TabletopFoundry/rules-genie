---
id: installation
title: Installation
sidebar_position: 2
description: Detailed installation paths for local development, Docker, and CI.
---

# Installation

Three supported installation paths. Pick the one that matches what
you're building.

## Local development

The default. Best for hacking on RulesGenie or running it on your laptop.

```bash
git clone https://github.com/TabletopFoundry/rules-genie
cd rules-genie
npm install
npm run dev
```

This:

- Installs all dependencies (Next.js 15, React 19, better-sqlite3, OpenAI SDK, Zod)
- Compiles `better-sqlite3` against your local Node ABI
- Starts the Next.js dev server on port 3000

The first request to the app initialises `./rulesgenie.db` with the
development seed (35 games, 124 example Q&A pairs, three personas).

## Docker

For production or a clean, reproducible local environment.

```bash
docker build -t rulesgenie .
docker run -p 3000:3000 -v rulesgenie-data:/app/data rulesgenie
```

The Dockerfile uses a multi-stage build:

- **deps** stage installs dependencies
- **builder** stage runs `next build` with `output: 'standalone'`
- **runner** stage ships only the standalone bundle (~150 MB final image)

A named volume keeps your SQLite database alive across container restarts.
See the [deploy guide](/docs/guides/deploy-with-docker) for compose
files, healthchecks, and reverse proxy tips.

## CI / automation

The repository runs lint, typecheck, format check, and build on every
PR via `.github/workflows/ci.yml`, across Node 18 / 20 / 22.

If you're running checks in your own pipeline:

```bash
npm ci             # exact, reproducible install
npm run validate   # lint + typecheck + format:check + build
```

`npm run validate` is the same command used by CI. Pass it locally and
your PR will pass remotely.

## Verifying the install

A healthy install responds to:

```bash
curl -s http://localhost:3000/api/health | jq .
```

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T18:23:00.000Z",
  "version": "0.1.0",
  "database": { "connected": true, "games": 35 },
  "mode": "demo",
  "uptime": 4.21
}
```

If `database.games` is `0`, the seed didn't run — restart the dev server
or delete `./rulesgenie.db` and try again.

→ Next: [Ask your first question](/docs/getting-started/first-question).
