---
id: intro
slug: /
title: Welcome to RulesGenie
sidebar_position: 1
description: AI-powered board game rules assistant with citation-backed answers.
---

# Welcome to RulesGenie 🎲

> **Stop flipping through rulebooks. Get the ruling in seconds.**

RulesGenie is an open-source web app that answers your board game rules
questions in plain English — with citations, confidence scoring, and
session memory. It ships with **35 curated games**, runs entirely in
**demo mode without any API keys**, and upgrades to live OpenAI answers
with a single environment variable.

## What you'll find in these docs

- **[Quick Start](/docs/getting-started/quick-start)** — A working app in under 5 minutes.
- **[Core Concepts](/docs/concepts/overview)** — The mental model behind sessions, citations, and demo vs. live mode.
- **[Guides](/docs/guides/use-openai)** — Turn on OpenAI, add a new game, deploy with Docker.
- **[Reference](/docs/reference/api)** — Every API route, environment variable, and database table.
- **[Troubleshooting](/docs/troubleshooting)** — Fixes for the issues you'll actually hit.

## Who it's for

| You are… | RulesGenie helps you… |
|---|---|
| A **player or game host** | Settle rules disputes mid-game without losing 10 minutes to PDFs. |
| A **content creator** | Spin up a citation-backed Q&A bot for any rulebook you care about. |
| A **developer** | Use it as a reference Next.js 15 + AI + SQLite stack with strict TS, Zod, CSRF, and Docker baked in. |

## The 30-second pitch

```bash
git clone https://github.com/TabletopFoundry/rules-genie
cd rules-genie
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), pick a game, ask a question.
You'll get a real answer with citations — no signup, no key, no waiting.

When you're ready to swap the mock engine for GPT-4o-mini, add one line to `.env`:

```bash
OPENAI_API_KEY=sk-...
RULESGENIE_DEMO_MODE=false
```

That's it. The UI, API surface, and database schema don't change.

→ Continue with the **[Quick Start guide](/docs/getting-started/quick-start)**.
