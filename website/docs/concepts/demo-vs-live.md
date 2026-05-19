---
id: demo-vs-live
title: Demo vs. live mode
sidebar_position: 3
description: When RulesGenie uses the mock engine vs. OpenAI, and how to switch.
---

# Demo vs. live mode

RulesGenie has two AI backends. Knowing which one will run is mostly
about two environment variables.

## The decision rule

```ts
const prefersDemo =
  process.env.RULESGENIE_DEMO_MODE !== 'false' || !process.env.OPENAI_API_KEY;
```

Read that aloud: *“We prefer demo mode unless `RULESGENIE_DEMO_MODE` is
literally the string `false` **and** an `OPENAI_API_KEY` is set.”*

| `RULESGENIE_DEMO_MODE` | `OPENAI_API_KEY` | Resulting mode |
|---|---|---|
| `true` (or unset) | unset | **demo** |
| `true` (or unset) | set | **demo** |
| `false` | unset | **demo** (safe fallback) |
| `false` | set | **live** |

The mode is reported on every response in the `mode` field and shown to
users as a badge. There is no silent fallback — if `live` fails, the
route returns an error with a clear message; it does not pretend to be
demo.

## What the mock engine actually does

`src/lib/ai/mock-engine.ts` is a keyword-scored retrieval system over
`src/data/mock-qa.ts`. For each game it:

1. Tokenises the question and the candidate Q&A entries.
2. Scores each candidate by token overlap, phrase boosts, and section weights (`src/lib/ai/scoring.ts`).
3. Returns the highest scorer with its hand-authored citation and confidence.
4. Generates contextual follow-up suggestions from the next-best matches.

This means the mock engine is **deterministic** — the same question
always returns the same answer. It's perfect for demos, screenshots,
and tests, and it never costs a cent.

## What the OpenAI engine does

`src/lib/ai/openai-engine.ts` uses the `openai` npm package to:

1. Build a system prompt with the selected game's metadata and rulebook reference.
2. Pass the conversation `history` (prior Q&A pairs in this session) as messages.
3. Request a structured response from `OPENAI_MODEL` (default `gpt-4o-mini`).
4. Parse the response into the standard `EngineResponse` shape.

You pay per request — pricing depends on the model you choose. The
default `gpt-4o-mini` is the cheap, fast option and the right starting
point.

## Switching modes

To turn on live mode:

```bash
# In .env
RULESGENIE_DEMO_MODE=false
OPENAI_API_KEY=sk-...
# Optional:
OPENAI_MODEL=gpt-4o-mini
```

Restart the server. The mode badge in the UI flips from `demo` to
`live`. No code changes required.

To go back to demo mode, either:

- Set `RULESGENIE_DEMO_MODE=true`, or
- Unset (or invalidate) `OPENAI_API_KEY`.

## Choosing per environment

A common setup:

| Environment | `RULESGENIE_DEMO_MODE` | `OPENAI_API_KEY` |
|---|---|---|
| Local dev | unset (defaults to demo) | unset |
| Preview / staging | `false` | scoped sandbox key |
| Production | `false` | production key from secret manager |
| CI / tests | `true` (force demo, fully offline) | unset |

→ Continue: [Sessions and citations](/docs/concepts/sessions-and-citations).
