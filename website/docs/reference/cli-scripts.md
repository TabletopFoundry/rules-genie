---
id: cli-scripts
title: npm scripts
sidebar_position: 3
description: Every script in package.json explained.
---

# npm scripts

The scripts defined in `package.json`, with the workflows they're built for.

| Script | What it does | When to use it |
|---|---|---|
| `npm run dev` | Starts the Next.js dev server with hot reload. | Local development. |
| `npm run build` | Production build (`next build`) with standalone output. | Before shipping or running `npm run start`. |
| `npm run start` | Runs the production server against the built bundle. | Local production-mode testing. |
| `npm run lint` | Runs ESLint with the project's strict rules. | Before committing. |
| `npm run typecheck` | Runs `tsc --noEmit` against `tsconfig.json`. | Catches typing errors with no build artifacts. |
| `npm run format` | Formats `src/**` and root config files with Prettier. | Apply formatting. |
| `npm run format:check` | Same as above but fails if changes are needed. | CI / pre-commit. |
| `npm run validate` | `lint` + `typecheck` + `format:check` + `build`. | Single command pre-commit / CI gate. |
| `npm run clean` | Removes `.next` and `tsconfig.tsbuildinfo`. | When the cache gets weird. |

## `npm run validate`

This is the canonical pre-commit gate. It is identical to what runs in
CI on every PR, so if it passes locally, your PR will pass remotely.

```bash
npm run validate
```

Order of operations:

1. `next lint` — ESLint with `eqeqeq`, `curly`, `no-throw-literal`,
   `prefer-template`, `object-shorthand`, `consistent-type-imports`.
2. `tsc --noEmit` — TypeScript with `noUncheckedIndexedAccess`,
   `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`,
   ES2022 target.
3. `prettier --check` — formatting verification.
4. `next build` — full production build (catches build-only errors).

If any step fails, fix it and re-run. There's no `--no-verify`.

## CI parity

`.github/workflows/ci.yml` runs `npm ci && npm run validate` on a
matrix of Node 18, 20, and 22. Keeping `validate` green is the
fastest path to a clean PR.
