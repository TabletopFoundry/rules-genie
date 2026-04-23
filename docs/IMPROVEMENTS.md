# RulesGenie — Improvement Plan

**Generated:** 2025-07-18
**Updated:** 2025-07-19
**Project:** Next.js 15 + React 19 + TypeScript 5.8 + SQLite + OpenAI
**Source lines:** ~3,100 across 35 files

---

## 1. Executive Summary

The top 5 highest-impact changes that will most improve RulesGenie's quality and adoption potential:

1. **Enhanced README with badges, architecture overview, and visual examples** — First impression drives 90% of adoption decisions.
2. **Add CONTRIBUTING.md** — Removes the #1 barrier for first-time contributors.
3. **Eliminate DRY violations** — `parseJson` and `mapQaRow` are duplicated across 3 files, creating maintenance risk.
4. **Harden API error handling** — 3 of 5 API routes lack try/catch, risking 500 errors in production.
5. **Tighten .gitignore and add .editorconfig** — Prevents database files and IDE artifacts from leaking into the repository.

---

## 2. Current State Assessment

| Dimension | Score (1-10) | Key Gap |
|-----------|--------------|---------|
| Language Modernity | 9 | Modern stack (Next 15, React 19, TS 5.8 strict); ES2022 target with `exactOptionalPropertyTypes` |
| Tooling & CI/CD | 7 | GitHub Actions CI, Dependabot, Prettier, ESLint; missing test framework and pre-commit hooks |
| Type Safety / Correctness | 9 | Strict TS with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; Zod on all API routes |
| Documentation | 7 | README with badges/architecture, CONTRIBUTING, CHANGELOG, PRD/CODE_REVIEW docs; missing API docs |
| Security Posture | 5 | CSRF middleware, parameterized SQL, prompt injection guard; no rate limiting, no auth |
| Community Health | 6 | Issue/PR templates, CONTRIBUTING, CODEOWNERS; missing good-first-issues and discussions |
| Discoverability | 5 | Badges, LICENSE, package metadata, keywords; missing social preview and demo deployment |

---

## 3. Prioritized Recommendations

### Quick Wins (< 1 day effort each)

#### QW-1: Enhanced README with badges and quick visual
- **Status:** ✅ Implemented
- **Impact:** Immediate credibility boost and discoverability

#### QW-2: Add CONTRIBUTING.md
- **Status:** ✅ Implemented
- **Impact:** Removes barrier for first-time contributors

#### QW-3: Harden .gitignore (database files are tracked)
- **Status:** ✅ Implemented
- **Impact:** Prevents accidental data leaks; `rulesgenie.db*` files should never be in source control

#### QW-4: Add .editorconfig for consistent formatting
- **Status:** ✅ Implemented
- **Impact:** Cross-IDE consistency without requiring formatter setup

#### QW-5: Add LICENSE file (MIT)
- **Status:** ✅ Implemented
- **Impact:** Required for any open-source adoption; unlocks awesome-list submissions

#### QW-6: Eliminate `parseJson` and `mapQaRow` duplication
- **Status:** ✅ Implemented
- **Impact:** 3 files (`games.ts`, `sessions.ts`, `dashboard.ts`) all define their own copies; consolidated into shared module

#### QW-7: Add try/catch to unprotected API routes
- **Status:** ✅ Implemented
- **Impact:** Prevents raw 500 errors from reaching users; consistent error response shape

#### QW-8: Add `npm run format` and Prettier config
- **Status:** ✅ Implemented
- **Impact:** Enforces consistent code style across all contributors

#### QW-9: Strengthen ESLint configuration
- **Status:** ✅ Implemented
- **Impact:** Catches more bugs at lint time; prevents console.log leaks in production

#### QW-10: Add GitHub issue and PR templates
- **Status:** ✅ Implemented
- **Impact:** Structured issue reports and consistent PR descriptions

### Medium Effort (1 day — 1 week)

#### ME-1: Add test infrastructure (Vitest)
- **Why:** Zero test coverage is the #1 risk from the CODE_REVIEW
- **Approach:** Install Vitest + testing-library; start with scoring.ts (pure logic), then API route validation
- **Reference:** The existing CODE_REVIEW.md already prescribes this

#### ME-2: Add CI/CD with GitHub Actions
- **Status:** ✅ Implemented
- **Impact:** Automated lint + typecheck + format check + build on all PRs and pushes to main

#### ME-3: Replace `require()` with dynamic `import()` in connection.ts
- **Status:** ✅ Resolved (no longer present — connection.ts uses ESM `import`)

#### ME-4: Add rate limiting to API routes
- **Why:** All mutation endpoints are unprotected
- **Approach:** Simple in-memory sliding window or use `@upstash/ratelimit`

#### ME-5: Add Dependabot configuration
- **Status:** ✅ Implemented
- **Impact:** Automated weekly dependency PRs with grouping strategy

#### ME-6: CHANGELOG.md with keep-a-changelog format
- **Status:** ✅ Implemented
- **Impact:** Clear change tracking for contributors and users

#### ME-7: CODEOWNERS file
- **Status:** ✅ Implemented
- **Impact:** Automatic code review routing on PRs

#### ME-8: Tighten TypeScript configuration
- **Status:** ✅ Implemented
- **Impact:** ES2022 target, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`

#### ME-9: Modernize next.config to TypeScript
- **Status:** ✅ Implemented
- **Impact:** Consistent TypeScript usage across entire project

#### ME-10: Health check API endpoint
- **Status:** ✅ Implemented
- **Impact:** `GET /api/health` for deployment monitoring and readiness checks

#### ME-11: Package.json metadata enrichment
- **Status:** ✅ Implemented
- **Impact:** Added description, keywords, license, author, engines, typecheck script

### Strategic Investments (> 1 week)

#### SI-1: Authentication layer
- Replace mock-auth with NextAuth.js or Clerk
- Enables real multi-user scenarios and data isolation

#### SI-2: Comprehensive test suite (≥70% coverage)
- Unit tests for all lib/ modules
- Integration tests for API routes
- Component tests for key interactive flows

#### SI-3: Documentation site
- Docusaurus or Nextra for game-addition guides, API docs, and architecture
- Host on GitHub Pages or Vercel

---

## 4. GitHub Project Health Checklist

```
Repository Basics:
[x] Descriptive README with quick start
[x] LICENSE file
[x] CONTRIBUTING.md
[x] Issue templates
[x] PR template
[x] CODEOWNERS

Automation:
[x] CI running on PRs
[ ] Automated testing
[x] Dependency updates (Dependabot)
[ ] Release automation
[ ] Security scanning

Documentation:
[ ] API docs
[ ] Examples directory
[x] Changelog
[x] Architecture docs (PRD, CODE_REVIEW)

Community:
[ ] Good first issues
[ ] Discussion forum or chat
[ ] Social preview image
[ ] Appropriate topic tags
```

---

## 5. 90-Day Roadmap to Top-Project Status

### Days 1–7: Foundation ✅ (Round 1)
- [x] Enhanced README with badges, architecture, and quick start
- [x] LICENSE, CONTRIBUTING.md
- [x] .editorconfig, Prettier config
- [x] Strengthen ESLint rules
- [x] Fix .gitignore for database files
- [x] Issue/PR templates
- [x] DRY refactor (parseJson, mapQaRow)
- [x] API route error handling hardening

### Days 8–14: CI/CD & Type Safety ✅ (Round 2)
- [x] GitHub Actions CI (lint + typecheck + format check + build)
- [x] Dependabot configuration with grouping strategy
- [x] CODEOWNERS file
- [x] CHANGELOG.md with keep-a-changelog format
- [x] Tighten tsconfig (ES2022, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noUnusedLocals/Params)
- [x] Fix all strictness-related TypeScript errors across codebase
- [x] Modernize next.config.js → next.config.ts
- [x] Package.json metadata (description, keywords, license, author, engines)
- [x] Add `npm run typecheck` script
- [x] Health check API endpoint (GET /api/health)
- [x] Session API error handling (try/catch on GET)

### Days 15–30: Core Improvements
- [ ] Install Vitest and write initial test suite (scoring, DB helpers, API validation)
- [ ] Rate limiting on API routes
- [ ] Pre-commit hooks (lint-staged + husky)

### Days 31–60: Polish & Documentation
- [ ] Architecture diagram (Mermaid in README)
- [ ] API documentation for all 5 endpoints
- [ ] Component storybook or visual test page
- [ ] Accessibility audit (axe-core integration)
- [ ] Performance optimization (React.memo on heavy components)

### Days 61–90: Community & Growth
- [ ] "Good first issue" labels with clear instructions
- [ ] Social preview image (1280×640)
- [ ] GitHub Discussions enabled
- [ ] Package.json metadata (repository, homepage, bugs)
- [ ] Demo deployment on Vercel with link in README

---

## 6. Competitive Analysis

| Feature | RulesGenie | Board Game Arena | Dized | BGG Rules Forum |
|---------|-----------|-----------------|-------|-----------------|
| AI-powered Q&A | ✅ Yes | ❌ No | ❌ No (video tutorials) | ❌ No (community) |
| Citation-backed answers | ✅ Yes | N/A | ❌ No | ⚠️ Manual |
| Works offline / demo mode | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Open source | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Quick-start guides | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| Community governance | ❌ Not yet | ❌ N/A | ❌ N/A | ✅ Yes |
| Test coverage | ❌ 0% | Unknown | Unknown | N/A |
| CI/CD pipeline | ❌ None | Unknown | Unknown | N/A |

**Key takeaway:** RulesGenie's unique strengths (AI Q&A with citations, open source, demo mode) differentiate it clearly. The gaps are entirely in project health and developer experience — which is what this improvement plan addresses.

---

## Files Changed in This Improvement

### Round 1 (Foundation)

| File | Change |
|------|--------|
| `README.md` | Complete rewrite with badges, architecture, visual sections |
| `CONTRIBUTING.md` | New file — contributor guide |
| `LICENSE` | New file — MIT license |
| `.editorconfig` | New file — cross-IDE formatting |
| `.prettierrc` | New file — Prettier configuration |
| `.prettierignore` | New file — Prettier ignore patterns |
| `.eslintrc.json` | Strengthened rules |
| `.gitignore` | Added IDE artifacts, OS files, build artifacts |
| `src/lib/db/shared.ts` | New file — consolidated `parseJson` and `mapQaRow` |
| `src/lib/db/sessions.ts` | Refactored to use shared helpers |
| `src/lib/db/dashboard.ts` | Refactored to use shared helpers |
| `src/lib/db/games.ts` | Refactored to use shared `parseJson` |
| `src/app/api/bookmarks/route.ts` | Added try/catch error handling |
| `src/app/api/collection/route.ts` | Added try/catch error handling |
| `src/app/api/feedback/route.ts` | Added try/catch error handling |
| `.github/ISSUE_TEMPLATE/bug_report.md` | New file |
| `.github/ISSUE_TEMPLATE/feature_request.md` | New file |
| `.github/PULL_REQUEST_TEMPLATE.md` | New file |
| `docs/IMPROVEMENTS.md` | This file |

### Round 2 (CI/CD & Type Safety)

| File | Change |
|------|--------|
| `.github/workflows/ci.yml` | New file — GitHub Actions CI pipeline |
| `.github/dependabot.yml` | New file — automated dependency updates |
| `.github/CODEOWNERS` | New file — code review routing |
| `CHANGELOG.md` | New file — keep-a-changelog format |
| `tsconfig.json` | Tightened with ES2022, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames` |
| `package.json` | Added description, keywords, license, author, engines, `typecheck` script |
| `next.config.ts` | New file — TypeScript config (replaced `next.config.js`) |
| `next.config.js` | Deleted — replaced by TypeScript version |
| `src/types/index.ts` | Added `| undefined` to optional properties for `exactOptionalPropertyTypes` |
| `src/components/chat-interface.tsx` | Fixed `noUncheckedIndexedAccess` and prop types |
| `src/components/site-header.tsx` | Fixed `noUncheckedIndexedAccess` in focus trap |
| `src/components/quick-start-explorer.tsx` | Fixed prop types for `exactOptionalPropertyTypes` |
| `src/lib/db/sessions.ts` | Fixed `saveFeedback` parameter type |
| `src/app/api/session/route.ts` | Added try/catch error handling |
| `src/app/api/health/route.ts` | New file — health check endpoint | |
