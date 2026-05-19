---
id: why
title: Why RulesGenie?
sidebar_position: 2
description: How RulesGenie compares to PDF rulebooks, BGG forums, and other rules assistants.
---

# Why RulesGenie?

Every board gamer has lived this moment: someone plays a card, someone
else says “wait, you can't do that mid-turn,” and now three people are
hunched over a 40-page PDF trying to find the one footnote that decides
the round.

RulesGenie exists to make that moment cost **5 seconds, not 5 minutes**.

## How it compares

| | RulesGenie | PDF rulebook | BGG forum search | Generic ChatGPT |
|---|---|---|---|---|
| **Average lookup time** | Seconds | Minutes | Minutes | Seconds |
| **Citation in the answer** | ✅ Always | n/a | Sometimes | Rare |
| **Confidence scoring** | ✅ Per answer | ❌ | ❌ | ❌ |
| **Session memory (follow-ups)** | ✅ Per game | ❌ | ❌ | Generic, not game-aware |
| **Works offline / no key** | ✅ Demo mode | ✅ | ❌ | ❌ |
| **Self-hostable** | ✅ One Docker image | n/a | ❌ | ❌ |
| **Curated game catalog** | ✅ 35 games | n/a | n/a | ❌ |
| **Open source (MIT)** | ✅ | ❌ | ❌ | ❌ |

## What makes the answers trustworthy

Three guardrails that you don't get from a generic chatbot:

1. **Citations are required.** Every answer carries the rulebook section or
   page it came from. If the engine can't cite, the response is marked
   low-confidence and surfaces a “check the rulebook” suggestion.
2. **Confidence is explicit.** Each answer ships with `high` / `medium` /
   `low` confidence so you know when to trust it and when to verify.
3. **Demo mode never lies about being AI.** When the OpenAI key isn't set,
   responses come from a deterministic keyword-scored engine and are
   labelled `mode: demo`. No hallucinations dressed up as gospel.

## What it's *not*

- It's **not** a replacement for owning the rulebook. The citations are
  there so you can verify.
- It's **not** a chatbot platform. The scope is intentionally narrow:
  board game rules, with session-scoped memory.
- It's **not** locked to OpenAI. The engine is behind a small interface
  in `src/lib/ai/` — swap in any provider you like.

→ Convinced? Jump to the **[Quick Start](/docs/getting-started/quick-start)**.
