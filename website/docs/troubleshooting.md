---
id: troubleshooting
title: Troubleshooting & FAQ
sidebar_position: 50
description: Fixes for the issues you'll actually hit.
---

# Troubleshooting & FAQ

If you hit something not listed here, please
[open an issue](https://github.com/TabletopFoundry/rules-genie/issues/new/choose).

## Install & build

### `better-sqlite3` build fails

`better-sqlite3` is a native module. The most common causes:

- **Wrong Node version.** RulesGenie requires Node 18.17+ (see `.nvmrc`).
  Run `node --version` and check.
- **Missing build toolchain.** On macOS you need Xcode CLI tools
  (`xcode-select --install`). On Linux you need `python3`, `make`, and
  `g++`. On Windows, install windows-build-tools or use WSL.
- **ABI mismatch.** Switching Node versions invalidates the build.

Fix:

```bash
rm -rf node_modules package-lock.json
npm install
```

### `npm run build` fails with "out of memory"

Increase Node's heap:

```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Tailwind utility classes don't apply

Make sure you've not edited `tailwind.config.ts` to drop the `content`
globs — they need to include `./src/**/*.{ts,tsx}`.

## Runtime

### The app boots but `/api/health` returns `unhealthy`

Means SQLite couldn't open or query the DB. Check:

1. The path in `RULESGENIE_DB_PATH` exists and is writable.
2. The user running the app has read/write permission on that path.
3. No other process is holding an exclusive lock on the file
   (close any `sqlite3` shells you have open).

### Answers say "mode: demo" even though I set `OPENAI_API_KEY`

You also need to set `RULESGENIE_DEMO_MODE=false`. The decision rule
forces demo unless **both** conditions are met. See
[Demo vs Live](/docs/concepts/demo-vs-live).

### `POST /api/ask` returns 400 "Please select a supported game…"

Either your `gameId` isn't in the catalog (check
[Add a game](/docs/guides/add-a-game)) or your `question` is shorter
than 3 characters or longer than 500.

### `POST` requests are blocked / 403

The CSRF middleware rejects cross-origin mutations. If you're calling
the API from a different origin (a separate frontend, a CLI), set the
`Origin` header to match your app's origin:

```bash
curl -X POST \
  -H 'Origin: http://localhost:3000' \
  -H 'Content-Type: application/json' \
  -d '...' \
  http://localhost:3000/api/ask
```

### Dev data isn't seeded

Two possible causes:

- **`NODE_ENV=production`** — the seed is intentionally skipped. Unset it
  or run `npm run dev`.
- **The DB already exists.** The seed only runs on an empty database.
  Stop the server, delete `rulesgenie.db*`, and restart.

## OpenAI

### "Insufficient quota" or 429 from OpenAI

Your key has hit a billing or rate limit. Check
[platform.openai.com/usage](https://platform.openai.com/usage). The app
returns a 500 to the client and logs the underlying error server-side.

### Answers feel slower than demo mode

They will be. OpenAI calls round-trip through a hosted API; demo mode
is a local table lookup. With `gpt-4o-mini` you should still see most
answers in 1–3 seconds.

## FAQ

### Can I use a model other than OpenAI?

Yes — implement a new engine file in `src/lib/ai/` with the same
signature as `answerWithOpenAi` and swap it in `src/lib/ai/index.ts`.
See [Use OpenAI § Swapping providers](/docs/guides/use-openai#swapping-in-a-different-provider).

### Does RulesGenie store user data?

By default it stores Q&A turns, bookmarks, feedback, and collections in
the local SQLite database. There's no telemetry, no analytics, and no
network traffic except to OpenAI (only in live mode) and the public
assets served by Next.js. The `demo-user` persona used in dev is
deterministic and not tied to a real account.

### Is there auth?

Not in the current release. RulesGenie is single-user by design — the
dev personas exist for seeding realistic dashboard data. If you need
multi-tenant auth, add it at the edge (a reverse-proxy auth layer is
the lowest-friction approach) and segment data by `sessionId`.

### How do I export my data?

It's a SQLite file. `sqlite3 rulesgenie.db .dump > backup.sql` will
give you a complete plain-text export. Use `.mode csv` and
`.output bookmarks.csv` for per-table CSVs.

### Can I host this somewhere other than my own server?

Yes — anywhere that runs a long-lived Node process with a writable
filesystem. Fly.io, Railway, Render, Hetzner, your own VM — all fine.
Serverless platforms that don't support persistent disk (vanilla
Vercel functions, AWS Lambda) won't work out of the box because
SQLite needs a writable file.
