---
id: persist-data
title: Persist data
sidebar_position: 4
description: Where RulesGenie stores its state and how to manage the SQLite database.
---

# Persist data

RulesGenie keeps everything in a single SQLite file. That's the entire
state of the app.

## Where the database lives

| Environment | Default path | Override |
|---|---|---|
| Local dev (`npm run dev`) | `./rulesgenie.db` | `RULESGENIE_DB_PATH` |
| Docker image | `/app/data/rulesgenie.db` | `RULESGENIE_DB_PATH` |
| Tests / scripts | wherever you point `RULESGENIE_DB_PATH` | required |

The connection is opened lazily on first access by
`src/lib/db/connection.ts`. The schema is created if missing.

## What's stored

- `games` — the static catalog (seeded from `src/data/games.ts`)
- `qa_pairs` — every Q&A turn for every session
- `bookmarks` — saved answers (scoped to the `demo-user` persona)
- `collections` — games the user has added to their collection
- `feedback` — thumbs-up / thumbs-down ratings on Q&A pairs
- `users` — three dev personas (production deployments leave this empty)

Full schema reference: [database schema](/docs/reference/database-schema).

## Backups

SQLite is a single file, but it has a write-ahead log (`-wal`) and
shared-memory file (`-shm`). For a safe online backup, use the SQLite
backup API:

```bash
sqlite3 rulesgenie.db ".backup rulesgenie-backup.db"
```

This works while the app is running and produces a consistent snapshot.

For Docker:

```bash
docker exec rulesgenie sqlite3 /app/data/rulesgenie.db \
  ".backup /app/data/backup-$(date +%F).db"
```

## Resetting dev data

To get a fresh seed:

```bash
# Stop the dev server first (Ctrl+C)
rm rulesgenie.db rulesgenie.db-shm rulesgenie.db-wal
npm run dev
```

The dev seed runs automatically on next boot. **This will not run when
`NODE_ENV=production`** — production deployments are seed-free by design.

## Choosing a different location

```bash
# .env
RULESGENIE_DB_PATH=/var/lib/rulesgenie/db.sqlite
```

The directory must exist and be writable by the process. If the file
itself doesn't exist, it will be created on first run.

## Why not Postgres?

The current scope — single-user, single-host, hobby-grade — is exactly
what SQLite is built for. If you outgrow it (multi-region, multi-writer,
> 10 GB), the database layer is isolated in `src/lib/db/` behind small
functions that would be straightforward to port.

```ts
// src/lib/db/sessions.ts (excerpt)
export function getConversation(sessionId: string, gameId: string): QaRecord[] {
  return getDb()
    .prepare('SELECT * FROM qa_pairs WHERE session_id = ? AND game_id = ? ORDER BY created_at ASC')
    .all(sessionId, gameId) as QaRecord[];
}
```

That's the entire surface area of “talking to the database” for
conversations. Swapping in `pg` or Drizzle is a contained refactor.
