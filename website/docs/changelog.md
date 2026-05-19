---
id: changelog
title: Changelog
sidebar_position: 70
description: Release notes for RulesGenie.
---

# Changelog

All notable changes to RulesGenie are documented here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- GitHub Actions CI workflow (lint, typecheck, format check, build)
- CI matrix testing across Node.js 18, 20, and 22
- Dependabot configuration for automated dependency updates
- `CHANGELOG.md` in Keep-a-Changelog format
- `CODEOWNERS` for code review routing
- Health check endpoint (`GET /api/health`) with uptime and no-store cache headers
- `package.json` metadata (repository, bugs, homepage, keywords, engines)
- TypeScript `next.config.ts` replacing the JavaScript config
- Docker support with a multi-stage `Dockerfile` and `.dockerignore`
- `.nvmrc` pinning the Node version for consistent environments
- `public/robots.txt` and `public/site.webmanifest` for crawling and PWA metadata
- `npm run validate` (lint + typecheck + format + build in one command)
- `npm run clean` to remove build artifacts
- Stricter ESLint rules: `eqeqeq`, `curly`, `no-throw-literal`,
  `prefer-template`, `object-shorthand`, `consistent-type-imports`
- Global metadata template in the root layout
- Next.js security hardening: `poweredByHeader: false`, `reactStrictMode: true`
- Standalone output mode for optimised Docker images

### Changed

- Tightened `tsconfig.json` with `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`,
  and ES2022 as the target
- Added `try`/`catch` error handling to `GET /api/session`
- Updated the codebase to satisfy stricter TypeScript checks
- Expanded `.gitignore` with debug logs and Docker overrides

## [0.1.0] — 2025-07-18

### Added

- Initial MVP release
- AI-powered rules Q&A with citation-backed answers
- Game library with 20 curated board games
- Quick-start mode with compressed rules summaries
- Personal dashboard with collections, bookmarks, and recent questions
- Demo mode (works without API keys)
- Optional OpenAI integration
- SQLite persistence via `better-sqlite3`
- CSRF middleware
- README with badges, architecture diagram, and quick start
- `CONTRIBUTING.md` guide
- MIT `LICENSE`
- GitHub issue and PR templates
- `.editorconfig` and Prettier configuration
- ESLint configuration with strict rules
- Consolidated shared DB helpers (DRY refactor)
- `try`/`catch` error handling on all mutation API routes
