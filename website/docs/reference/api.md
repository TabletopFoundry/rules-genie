---
id: api
title: API reference
sidebar_position: 1
description: Every HTTP endpoint exposed by RulesGenie.
---

# API reference

RulesGenie exposes six JSON endpoints under `/api/`. All responses are
JSON. All mutating endpoints expect a same-origin request — the CSRF
middleware will reject requests without a matching `Origin` or
`Referer` header.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/ask` | Ask a rules question and persist the answer. |
| `GET` | `/api/session` | Replay the conversation for a `(sessionId, gameId)`. |
| `POST` | `/api/bookmarks` | Toggle or remove a bookmark on a Q&A pair. |
| `POST` | `/api/collection` | Toggle a game into/out of your collection. |
| `POST` | `/api/feedback` | Rate an answer with `up` / `down` (and optional reason). |
| `GET` | `/api/health` | Liveness/readiness probe. |

---

## `POST /api/ask`

Ask a question. Returns the persisted Q&A pair plus suggestions.

**Request**

```json
{
  "sessionId": "string (1–100 chars)",
  "gameId":    "string (must be a known game id)",
  "question":  "string (3–500 chars)"
}
```

**Response 200**

```json
{
  "item": {
    "id": "qa_2f9c...",
    "sessionId": "...",
    "gameId": "ticket-to-ride",
    "question": "...",
    "answer": "...",
    "citations": [
      { "source": "Ticket to Ride Rulebook", "section": "Drawing Train Cards", "page": 4 }
    ],
    "confidence": "high",
    "status": "answered",
    "mode": "demo",
    "createdAt": "2025-01-15T18:23:11.045Z"
  },
  "suggestions": ["...", "..."]
}
```

**Errors**

| Status | When |
|---|---|
| `400` | Body isn't JSON, fails Zod validation, or `gameId` isn't in the catalog. |
| `500` | Unexpected server error (logged with stack trace; message redacted in response). |

**Example**

```bash
curl -s http://localhost:3000/api/ask \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"demo-1","gameId":"ticket-to-ride","question":"How many cards do I draw per turn?"}'
```

---

## `GET /api/session`

Replay a conversation in insertion order.

**Query parameters**

| Name | Required | |
|---|---|---|
| `sessionId` | yes | 1–100 chars |
| `gameId` | yes | must be a known game id |

**Response 200**

```json
{
  "items": [
    { "id": "qa_a1...", "sessionId": "...", "question": "...", "answer": "...", "...": "..." },
    { "id": "qa_b2...", "sessionId": "...", "question": "...", "answer": "...", "...": "..." }
  ]
}
```

**Example**

```bash
curl -s "http://localhost:3000/api/session?sessionId=demo-1&gameId=ticket-to-ride" | jq .
```

---

## `POST /api/bookmarks`

Toggle or remove a bookmark.

**Request**

```json
{
  "qaPairId": "qa_2f9c...",
  "action": "toggle"
}
```

`action` defaults to `"toggle"`; pass `"remove"` to delete unconditionally.

**Response 200**

```json
{ "active": true }
```

`active: true` means the answer is now bookmarked, `false` means it was
removed.

---

## `POST /api/collection`

Toggle a game in/out of the user's collection.

**Request**

```json
{ "gameId": "wingspan" }
```

**Response 200**

```json
{ "active": true }
```

---

## `POST /api/feedback`

Record a thumbs-up / thumbs-down on an answer.

**Request**

```json
{
  "sessionId": "demo-1",
  "qaPairId":  "qa_2f9c...",
  "rating":    "up",
  "reason":    "Crystal clear, thank you!"
}
```

`rating` must be `"up"` or `"down"`. `reason` is optional (≤ 500 chars).

**Response 200**

```json
{ "ok": true }
```

---

## `GET /api/health`

Liveness/readiness probe. Always cacheless (`Cache-Control: no-store`).

**Response 200**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T18:23:00.000Z",
  "version": "0.1.0",
  "database": { "connected": true, "games": 35 },
  "mode": "demo",
  "uptime": 4.21
}
```

**Response 503**

```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-15T18:23:00.000Z",
  "database": { "connected": false }
}
```

---

## CSRF protection

Every mutating route (`POST`) passes through `src/middleware.ts`, which
rejects requests whose `Origin` or `Referer` header doesn't match the
configured app origin. Browser fetches from the same origin pass
automatically; server-to-server callers must set a matching `Origin`
header.
