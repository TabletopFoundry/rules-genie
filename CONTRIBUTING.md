# Contributing to RulesGenie

Thank you for your interest in contributing to RulesGenie! This guide will help you get started.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.17 or later
- npm 9+

### Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/rulesgenie.git
cd rulesgenie

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Start the development server
npm run dev
```

The app runs in demo mode by default — no API keys needed.

## Development Workflow

### Branch naming

Use descriptive branch names:
- `feat/add-game-search-filter`
- `fix/bookmark-toggle-error`
- `docs/update-api-reference`

### Before submitting a PR

1. **Run the full validation suite:** `npm run validate`
   - Or run individual checks:
     - `npm run lint`
     - `npm run typecheck`
     - `npm run format`
2. **Build successfully:** `npm run build`
3. **Test your changes manually** in the browser

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add search filtering by game mechanic
fix: prevent duplicate bookmark toggle requests
docs: add API endpoint documentation
refactor: consolidate parseJson helpers into shared module
```

## Project Structure

```
src/
├── app/          # Next.js pages and API routes
├── components/   # React components
├── data/         # Static game and mock Q&A data
├── lib/          # Core business logic (AI, DB)
└── types/        # TypeScript type definitions
```

### Key conventions

- **TypeScript strict mode** is enabled — all code must be fully typed
- **Zod validation** is required on all API route inputs
- **Parameterized SQL** — never interpolate user input into SQL strings
- **Tailwind CSS** for all styling — no CSS modules or styled-components
- **Server Components** by default; add `'use client'` only when needed

## Adding a New Game

1. Add the game data to `src/data/games.ts` following the `GameRecord` type
2. Add mock Q&A entries to `src/data/mock-qa.ts` with realistic question patterns
3. The database auto-seeds on next server restart

## Reporting Issues

- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) for bugs
- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) for new ideas
- Check existing issues before creating a new one

## Code of Conduct

Please be respectful and constructive in all interactions. We're building something fun — let's keep it that way! 🎲
