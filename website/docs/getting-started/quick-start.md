---
id: quick-start
title: Quick Start
sidebar_position: 1
description: Get RulesGenie running locally in under 5 minutes.
---

# Quick Start

Get RulesGenie answering questions on your machine in under five minutes.
No accounts, no API keys, no surprises.

## Prerequisites

- **Node.js 18.17+** (we test on 18, 20, and 22)
- **npm 9+**
- **Git**

Check both:

```bash
node --version   # v18.17.0 or higher
npm --version    # 9.0.0 or higher
```

## 1. Clone and install

```bash
git clone https://github.com/TabletopFoundry/rules-genie
cd rules-genie
npm install
```

The install also builds the native `better-sqlite3` binding. If that
step fails, see [Troubleshooting](/docs/troubleshooting#better-sqlite3-build-fails).

## 2. Start the dev server

```bash
npm run dev
```

You'll see:

```
▲ Next.js 15.3.2
- Local:    http://localhost:3000
- Network:  http://192.168.x.x:3000

✓ Ready in 1.2s
```

Open [http://localhost:3000](http://localhost:3000).

On first boot RulesGenie seeds a SQLite database (`./rulesgenie.db`)
with 35 games, 124 example Q&A pairs, three user personas, and a handful
of pre-populated conversation sessions. **No additional setup needed.**

## 3. Ask your first question

1. Click **Ask** in the navbar.
2. Pick a game from the dropdown — try **Ticket to Ride**.
3. Type: `Can I draw a face-up locomotive first?`
4. Hit **Ask**.

You'll get back an answer with:

- A natural-language explanation
- One or more **citations** (rulebook section / page)
- A **confidence pill** — `high`, `medium`, or `low`
- A **mode badge** showing `demo` (you haven't set an API key yet)

That's the whole loop.

## 4. (Optional) Turn on live AI

Demo mode is great, but if you want GPT-quality answers:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
RULESGENIE_DEMO_MODE=false
OPENAI_API_KEY=sk-your-key-here
```

Restart `npm run dev`. The UI doesn't change — but the **mode badge**
now reads `live` and answers come from OpenAI.

See the [Use OpenAI guide](/docs/guides/use-openai) for model selection
and cost tips.

## Next steps

- **[Your first question, step-by-step](/docs/getting-started/first-question)** — annotated walkthrough.
- **[Core Concepts](/docs/concepts/overview)** — sessions, citations, demo vs live.
- **[Add a new game](/docs/guides/add-a-game)** — extend the catalog.
- **[Deploy with Docker](/docs/guides/deploy-with-docker)** — ship it to production.
