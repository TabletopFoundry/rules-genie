# RulesGenie 🎲✨

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![CI](https://img.shields.io/github/actions/workflow/status/josedab/rulesgenie/ci.yml?branch=main&label=CI&logo=github)](https://github.com/josedab/rulesgenie/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js)](https://nodejs.org/)

> **Stop flipping through rulebooks. Get the ruling in seconds.**

RulesGenie is an AI-powered board game rules assistant that answers natural-language questions with citation-backed answers. It supports 35 popular board games out of the box, works entirely in demo mode without any API keys, and optionally integrates with OpenAI for production-grade responses.

---

## ✨ Features

- 🤖 **Rules Q&A** — Chat-style answers with game-aware session memory and source citations
- 📚 **Game Library** — Search and filter a curated catalog of popular board games
- ⚡ **Quick-Start Mode** — Compressed rules summaries and setup guides for faster teaches
- 🔖 **Saved Answers** — Bookmark answers and revisit them on your personal dashboard
- 🎯 **Demo Mode** — Works fully without API keys using intelligent keyword-scored mock responses
- 🛡️ **Confidence Scoring** — Every answer includes a confidence level and citation status

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Next.js App Router             │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Pages   │  │   API    │  │  Middleware    │  │
│  │ (RSC +   │  │  Routes  │  │ (CSRF guard)  │  │
│  │  Client) │  │          │  │               │  │
│  └────┬─────┘  └────┬─────┘  └───────────────┘  │
│       │              │                            │
│  ┌────┴──────────────┴─────┐                      │
│  │        src/lib/         │                      │
│  │  ┌─────┐   ┌────────┐  │                      │
│  │  │ AI  │   │   DB   │  │                      │
│  │  │mock │   │ SQLite │  │                      │
│  │  │+GPT │   │(better │  │                      │
│  │  │     │   │sqlite3)│  │                      │
│  │  └─────┘   └────────┘  │                      │
│  └─────────────────────────┘                      │
└─────────────────────────────────────────────────┘
```

## 🚀 Quick Start

Get running in under 2 minutes:

```bash
# 1. Clone and install
git clone <repo-url> && cd rulesgenie
npm install

# 2. (Optional) Configure environment
cp .env.example .env

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app works immediately in demo mode.

> **💡 Tip:** Try asking _"Can I draw a face-up locomotive first?"_ on the Ask page to see citations and confidence scoring in action.

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RULESGENIE_DEMO_MODE` | `true` | Keep the app in mock mode with scripted answers |
| `OPENAI_API_KEY` | — | Your OpenAI API key for live AI responses |
| `OPENAI_MODEL` | `gpt-4o-mini` | Override the default OpenAI model |
| `RULESGENIE_DB_PATH` | `./rulesgenie.db` | Override the SQLite database location |

If no API key is present, the app automatically falls back to demo mode. No configuration required to get started.

## 🗄️ Persistence

The app stores data in SQLite. By default it uses `./rulesgenie.db`, and you can override that path with `RULESGENIE_DB_PATH`. The production Docker image points that variable at `/app/data/rulesgenie.db` so data can live on a mounted volume. It stores:

- Supported game metadata (35 games in development)
- Development user personas, collections, bookmarks, sessions, and feedback
- Chat history by session
- Saved answers / bookmarks
- Answer feedback (thumbs up/down)

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/              # REST endpoints (ask, bookmarks, collection, feedback, session)
│   ├── ask/              # Rules Q&A chat page
│   ├── dashboard/        # Personal dashboard
│   ├── games/            # Game library + detail pages
│   └── quick-start/      # Quick-start explorer
├── components/           # React components (client + server)
│   └── hooks/            # Custom React hooks (useConversation, useRulesSession)
├── data/                 # Static game data and mock Q&A entries
├── lib/                  # Core business logic
│   ├── ai/               # AI engine (mock + OpenAI)
│   └── db/               # Database layer (SQLite via better-sqlite3)
└── types/                # TypeScript type definitions
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5.8](https://www.typescriptlang.org/) (strict mode) |
| UI | [React 19](https://react.dev/) + [Tailwind CSS 3](https://tailwindcss.com/) |
| Database | [SQLite](https://sqlite.org/) via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) |
| AI | [OpenAI API](https://platform.openai.com/) (optional) |
| Validation | [Zod](https://zod.dev/) on all API routes |
| Icons | [Lucide React](https://lucide.dev/) |

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without modifying files |
| `npm run validate` | Run all checks (lint + typecheck + format + build) |
| `npm run clean` | Remove build artifacts |

## 🌱 Development Seed Data

In non-production environments, RulesGenie reseeds SQLite automatically on startup with a deterministic development dataset.

- **35 board games** covering gateway, euro, co-op, party, and heavyweight titles
- **3 user personas**: a power user (`demo-user`), a casual player, and a brand-new account
- **124 seeded Q&A rows** sourced from a **100+ entry rules bank** with realistic citations, bookmarks, collections, and feedback
- **Multiple conversation sessions** with short and long histories, plus edge cases like unicode names, long questions, null optionals, and varied confidence values
- **Production-safe behavior**: the development seed routine is skipped entirely when `NODE_ENV=production`

If you want a fresh development dataset, stop the app, delete `rulesgenie.db`, and start `npm run dev` again.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on how to get started.

## 🐳 Docker

Build and run the production container:

```bash
docker build -t rulesgenie .
docker run -p 3000:3000 -v rulesgenie-data:/app/data rulesgenie
```

The container runs a standalone Next.js server with minimal footprint (~150 MB) and persists SQLite data in `/app/data`.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  <strong>RulesGenie</strong> · Built for fast mid-game rulings 🎲
</p>
