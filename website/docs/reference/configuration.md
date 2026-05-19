---
id: configuration
title: Configuration
sidebar_position: 2
description: Every environment variable RulesGenie reads.
---

# Configuration

RulesGenie reads a small number of environment variables. All of them
have safe defaults — the app boots with `npm run dev` and a blank
environment.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `RULESGENIE_DEMO_MODE` | `true` | Force the mock engine even when an OpenAI key is set. Set to `false` to enable live mode. |
| `OPENAI_API_KEY` | *(unset)* | Your OpenAI API key. Required for live mode. Without it, demo mode is forced. |
| `OPENAI_MODEL` | `gpt-4o-mini` | Which OpenAI chat model to call in live mode. |
| `RULESGENIE_DB_PATH` | `./rulesgenie.db` (local) / `/app/data/rulesgenie.db` (Docker) | Path to the SQLite database file. |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Base URL used in OpenGraph tags and sitemaps. |
| `NODE_ENV` | `development` | Standard Next.js env. **In `production`, the dev seed is skipped.** |

## `.env.example`

The repository ships an annotated `.env.example`. Copy it to `.env`:

```bash
cp .env.example .env
```

```bash title=".env.example"
# ── AI Configuration ──────────────────────────
RULESGENIE_DEMO_MODE=true
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# ── App Configuration ─────────────────────────
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
# RULESGENIE_DB_PATH=./rulesgenie.db
```

## Configuration precedence

For each setting, RulesGenie reads from (highest precedence first):

1. **Process environment** — `process.env.VAR` at request time.
2. **`.env.local`** — your machine-specific overrides (gitignored).
3. **`.env`** — committed defaults (also gitignored in this project — see `.gitignore`).
4. **Hard-coded defaults** — what the app does with no env at all.

Because reads happen at request time, you can flip `RULESGENIE_DEMO_MODE`
or rotate `OPENAI_API_KEY` without restarting in development. In
production (`next start`), a restart is required.

## Quick recipes

### Force demo mode everywhere

```bash
RULESGENIE_DEMO_MODE=true
```

### Use a custom OpenAI model

```bash
RULESGENIE_DEMO_MODE=false
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

### Run two instances against different DBs

```bash
# instance A
RULESGENIE_DB_PATH=./db-a.sqlite PORT=3000 npm run start

# instance B
RULESGENIE_DB_PATH=./db-b.sqlite PORT=3001 npm run start
```
