# Changelog

All notable changes to RulesGenie will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- GitHub Actions CI workflow (lint, typecheck, format check, build)
- CI matrix testing across Node.js 18, 20, 22
- Dependabot configuration for automated dependency updates
- CHANGELOG.md with keep-a-changelog format
- CODEOWNERS file for code review routing
- Health check API endpoint (`GET /api/health`) with uptime and cache headers
- `package.json` metadata (repository, bugs, homepage, keywords, engines)
- TypeScript `next.config.ts` replacing JavaScript config
- Docker support with multi-stage `Dockerfile` and `.dockerignore`
- `.nvmrc` for consistent Node.js version across environments
- `public/robots.txt` for search engine crawling
- `public/site.webmanifest` for PWA-ready metadata
- Enhanced `.env.example` with inline documentation and grouped sections
- `npm run validate` script (lint + typecheck + format + build in one command)
- `npm run clean` script to remove build artifacts
- Enhanced ESLint rules (`eqeqeq`, `curly`, `no-throw-literal`, `prefer-template`, `object-shorthand`, `consistent-type-imports`)
- Global metadata template in layout for DRY page titles
- Next.js security hardening (`poweredByHeader: false`, `reactStrictMode: true`)
- Standalone output mode for optimized Docker deployments

### Changed

- Tightened `tsconfig.json` with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, and ES2022 target
- Added try/catch error handling to `GET /api/session` route
- Updated code to handle stricter TypeScript checks throughout
- Expanded `.gitignore` with debug logs and Docker overrides

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
