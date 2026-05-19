---
id: sessions-and-citations
title: Sessions & citations
sidebar_position: 4
description: How RulesGenie scopes conversation memory and what's inside every citation.
---

# Sessions & citations

Two concepts you'll touch any time you build on RulesGenie.

## Sessions

A **session** is a `(sessionId, gameId)` pair. Together they uniquely
identify a conversation.

- `sessionId` is any string you provide (UUID recommended). RulesGenie
  doesn't issue them — you do.
- `gameId` is one of the catalog ids (`ticket-to-ride`, `wingspan`, …).
  Switching games starts a fresh conversation, even with the same `sessionId`.

This design has two payoffs:

1. **No auth required.** Anyone can hold a session by holding a string. The
   UI keeps the active session in `localStorage`; integrations can mint
   their own.
2. **Multiple parallel chats.** A user can ask about *Wingspan* and
   *Brass: Birmingham* simultaneously without crosstalk — different
   `gameId`, same `sessionId` if you like.

### Lifecycle

Sessions are implicit: the first `POST /api/ask` with a new pair
*creates* the session by writing the first row to `qa_pairs`. There's
no “create session” endpoint.

To replay a session:

```bash
GET /api/session?sessionId=<id>&gameId=<gid>
```

Returns every Q&A pair in insertion order. Use this to rebuild a chat
UI on page reload.

### What memory looks like

When you `POST /api/ask`, the route fetches the existing history before
calling the engine:

```ts title="src/app/api/ask/route.ts (excerpt)"
const history = getConversation(parsed.data.sessionId, parsed.data.gameId);
const answer = await answerRulesQuestion({
  gameId: parsed.data.gameId,
  question: parsed.data.question,
  history,
});
```

- The **mock engine** ignores `history` (it's deterministic per question).
- The **OpenAI engine** turns each prior turn into a `user` / `assistant`
  message pair before sending the new question.

This is why follow-ups like “what about three of them?” work — the
engine sees what the previous turn was about.

## Citations

Every answer ships with one or more citations. The shape:

```ts
type Citation = {
  source: string;   // "Wingspan Rulebook", "Errata v3", etc.
  section: string;  // "Bonus Cards", "End of Round Scoring"
  page?: number;    // optional, only for paginated PDFs
};
```

Citations are surfaced in the UI as small chips under each answer and
returned verbatim by the API in the `item.citations` array.

### Where they come from

- **Mock engine** — citations are hand-authored alongside each entry in
  `src/data/mock-qa.ts`. They're real references to real rulebook sections.
- **OpenAI engine** — the system prompt instructs the model to return
  structured citations and to lower confidence if it cannot.

### Confidence levels

| Level | When it's used |
|---|---|
| `high` | The engine found a clear, single matching rule with a verifiable citation. |
| `medium` | The engine found a likely answer but the question requires interpretation or covers an edge case. |
| `low` | The engine isn't sure. UI surfaces a “verify in the rulebook” prompt and a link to the catalog entry. |

Low-confidence answers are a feature, not a bug. They're the difference
between a tool you can trust and a chatbot that bluffs.

→ Continue with the [Guides](/docs/guides/use-openai).
