# Changelog

All notable changes to RulesGenie will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- GitHub Actions CI workflow (lint, typecheck, format check, build)
- Dependabot configuration for automated dependency updates
- CHANGELOG.md with keep-a-changelog format
- CODEOWNERS file for code review routing
- Health check API endpoint (`GET /api/health`)
- `package.json` metadata (repository, keywords, engines)
- TypeScript `next.config.ts` replacing JavaScript config

### Changed

- Tightened `tsconfig.json` with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, and ES2022 target
- Added try/catch error handling to `GET /api/session` route
- Updated code to handle stricter TypeScript checks throughout

## [0.1.0] — 2025-07-18

### Added

- Initial MVP release
- AI-powered rules Q&A with citation-backed answers
- Game library with 20 curated board games
- Quick-start mode with compressed rules summaries
- Personal dashboard with collections, bookmarks, and recent questions
- Demo mode (works without API keys)
- OpenAI integration (optional)
- SQLite persistence via better-sqlite3
- CSRF middleware protection
- README with badges, architecture diagram, and quick start
- CONTRIBUTING.md guide
- MIT LICENSE
- GitHub issue and PR templates
- `.editorconfig` and Prettier configuration
- ESLint configuration with strict rules
- Consolidated shared DB helpers (DRY refactor)
- Try/catch error handling on all mutation API routes
