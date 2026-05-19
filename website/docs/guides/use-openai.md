---
id: use-openai
title: Use OpenAI for live answers
sidebar_position: 1
description: Configure RulesGenie to call OpenAI instead of the mock engine.
---

# Use OpenAI for live answers

The mock engine is great for demos and tests, but for production you'll
want real model answers.

## 1. Get a key

Create an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
Restrict it to the `chat.completions` scope.

## 2. Configure `.env`

```bash
cp .env.example .env
```

Edit `.env`:

```bash
RULESGENIE_DEMO_MODE=false
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

Restart `npm run dev`. The mode badge on each answer should now read
`live`.

## 3. Pick a model

| Model | When to use it |
|---|---|
| `gpt-4o-mini` *(default)* | Best price/quality. Sufficient for 95% of rules questions. |
| `gpt-4o` | When you need the most accurate edge-case interpretation. ~10× the cost. |
| `gpt-4-turbo` | Legacy; only if you have a specific dependency on it. |

Set via `OPENAI_MODEL`. No code changes required.

## 4. Verify it's working

```bash
curl -s http://localhost:3000/api/health | jq .mode
# Should print: "live"
```

Then ask a question:

```bash
curl -s http://localhost:3000/api/ask \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"verify","gameId":"wingspan","question":"Do bonus cards score for tucked cards?"}' \
  | jq '.item.mode'
# Should print: "live"
```

## 5. Cost control tips

- **Keep `gpt-4o-mini`.** It's cheap enough that a single user asking
  hundreds of questions per month costs less than a coffee.
- **Cap question length.** The API already validates `question` at
  500 characters via Zod — keep that limit, it's a cost ceiling.
- **Cache common questions.** RulesGenie persists every Q&A to SQLite.
  You can build a “similar question” lookup on top of `qa_pairs` to
  short-circuit identical questions for the same game. (Not implemented
  by default.)
- **Rate-limit at the edge.** Put RulesGenie behind a reverse proxy
  (Caddy, nginx, Cloudflare) and rate-limit `/api/ask` per IP.

## Swapping in a different provider

The whole engine selector lives in `src/lib/ai/index.ts`:

```ts title="src/lib/ai/index.ts"
const prefersDemo =
  process.env.RULESGENIE_DEMO_MODE !== 'false' || !process.env.OPENAI_API_KEY;
if (prefersDemo) return answerWithMock(game, input.question);
return answerWithOpenAi(game, input.question, input.history);
```

To use a different model provider:

1. Implement a new engine file with the same signature as
   `answerWithOpenAi(game, question, history)` returning the standard
   `EngineResponse`.
2. Swap the call in `index.ts`.
3. Add any new env vars to `.env.example`.

Everything downstream — routes, validation, DB writes, UI — stays
exactly the same.
