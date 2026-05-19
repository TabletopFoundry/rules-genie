---
id: contributing
title: Contributing
sidebar_position: 60
description: How to set up your environment and submit a great pull request.
---

# Contributing

Contributions are welcome and appreciated. The repository ships with a
strict-but-friendly toolchain so PRs land cleanly.

## Setup

```bash
git clone https://github.com/<your-username>/rules-genie
cd rules-genie
npm install
npm run dev
```

The app runs in demo mode out of the box — no API key required.

## The PR checklist

Before opening a PR, run:

```bash
npm run validate
```

This runs the same checks CI runs (lint → typecheck → format check →
build). If it passes locally, it'll pass on GitHub.

## Branch naming

Use a short verb prefix and kebab-case scope:

- `feat/add-game-search-filter`
- `fix/bookmark-toggle-error`
- `docs/update-api-reference`
- `refactor/extract-citation-helper`

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) only:

```
feat: add search filtering by mechanic
fix: prevent duplicate bookmark toggle requests
docs: document /api/feedback endpoint
refactor: extract parseJson helper
test: cover demo-mode citation rendering
```

One topic per commit. If a PR ends up with twenty WIP commits, squash
before requesting review.

## Code conventions

These are enforced by ESLint and TypeScript — but it helps to know them
ahead of time:

- **TypeScript strict mode is on.** No `any`. No `// @ts-ignore` without
  a comment explaining why.
- **All API inputs validated with Zod.** Look at any existing route in
  `src/app/api/` as a template.
- **SQL is parameterised, always.** `better-sqlite3`'s prepared
  statements are non-negotiable.
- **Tailwind for all styling.** No CSS modules, no styled-components.
- **Server Components by default.** Add `'use client'` only when a
  component needs hooks, state, or browser APIs.
- **Consistent imports.** `import type` for type-only imports
  (`consistent-type-imports`).

## Where to add things

| You're adding… | Put it in… |
|---|---|
| A new game | `src/data/games.ts` + `src/data/mock-qa.ts` |
| A new API route | `src/app/api/<name>/route.ts` + a Zod schema in `src/lib/api-schemas.ts` |
| A new page | `src/app/<name>/page.tsx` |
| A new database column | `src/lib/db/schema.ts` + a query helper next to existing ones |
| A new AI provider | `src/lib/ai/<provider>-engine.ts` matching the existing `EngineResponse` shape |
| New documentation | `website/docs/` (this site) |

## Code of Conduct

Be respectful. Be constructive. Assume good intent.

If someone's contribution needs revision, comment on the diff with
suggestions and a rationale — not a verdict. If a discussion starts
to spiral, take it to a thread of its own and tag a maintainer.

We're building something fun. Let's keep it that way 🎲

## Reporting bugs

Open a [bug report](https://github.com/TabletopFoundry/rules-genie/issues/new?template=bug_report.md)
and include:

- Your Node version (`node --version`)
- Your OS
- Exact steps to reproduce
- What you expected vs. what happened
- Any relevant log output (redact API keys!)

## Reporting security issues

**Do not open a public issue for security vulnerabilities.** Email the
maintainer (see `package.json` `author`) or open a GitHub security
advisory. We'll acknowledge within 72 hours.
