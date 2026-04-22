# UX & DX Review 4 — RulesGenie

**Date:** 2025-07-18
**Reviewer:** Focused delta audit — only genuinely new P0/P1 issues not already documented in Reviews 1–3.
**Scope:** Code correctness, UX integrity of AI answers, search accuracy, mode transparency.

---

## Triage Note

This review intentionally does **not** re-list issues from prior reviews (UX_REVIEW.md, UX_REVIEW_2.md, UX_REVIEW_3.md). Several P0/P1 items from Review 3 have been fixed since that audit:

| Review 3 Item | Status |
|---|---|
| P0-2: `error.tsx` missing `role="alert"` / `aria-live` | ✅ Fixed (error.tsx:5) |
| P0-4: `useConversation` no JSON-parse guard | ✅ Fixed — `safeJsonParse` helper with Content-Type check (use-conversation.ts:8-18) |
| P1-3: No request cancellation in conversation hook | ✅ Fixed — `AbortController` on history fetch (use-conversation.ts:37-56) |
| P1-4: Missing database indexes | ✅ Fixed — 6 indexes added (schema.ts:92-97) |
| Review 2 P0-2: `error.tsx` leaks raw error.message | ✅ Fixed — gated behind `NODE_ENV === 'development'` (error.tsx:9) |

The issues below are **new findings** only.

---

## P0 — Must Fix

### P0-1: OpenAI failures silently fall back to demo mode with no user indication

**File:** `src/lib/ai/openai-engine.ts:86-99`
**Problem:** When the OpenAI API call fails (network error, rate limit, malformed response, Zod validation failure), the `catch` block silently returns `answerWithMock(game, question)`. The returned answer has `mode: 'demo'`, but the UI never inspects or surfaces this field. A user who has configured `OPENAI_API_KEY` and expects live AI answers will receive mock keyword-matched responses without any warning that the AI backend failed.

Worse, the chat header is hardcoded to display `"Demo mode"` regardless of actual mode (see P1-1 below), so there is no visual affordance at all to detect this.

**Impact:** Users cannot trust answer quality. A transient OpenAI outage degrades the entire product to mock mode with zero observability. In a mid-game scenario (the core use case), users may make real game decisions based on keyword-matched demo answers they believe are AI-generated.

**Fix:**
1. When `answerWithOpenAi` catches an error, return a distinct `mode: 'fallback'` (or add an `error` field) so the UI can display a warning like _"AI unavailable — showing a best-effort demo answer."_
2. Log the underlying error server-side with enough detail to diagnose (currently the `catch` block discards the error entirely — not even a `console.error`).

---

## P1 — Should Fix

### P1-1: Chat header hardcodes "Demo mode" — never reflects actual response mode

**File:** `src/components/chat-interface.tsx:144-146`
```tsx
<div className="rounded-full bg-board-gold/15 px-4 py-2 text-sm font-semibold text-board-pine">
  Demo mode {loading ? '· answering…' : 'ready'}
</div>
```
**Problem:** This badge always says "Demo mode" regardless of whether the app is running with a live OpenAI key. Each `QaRecord` returned from the API includes a `mode` field (`'demo'` or `'openai'`), but nothing in the UI reads it. Users with a configured API key see "Demo mode" permanently, which is confusing and undermines confidence.

**Fix:** Derive the displayed mode from the most recent answer's `mode` field (or from a server-provided config endpoint). Show "AI mode" / "Live" when `mode === 'openai'`, and "Demo mode" when `mode === 'demo'`.

---

### P1-2: `generic-strategy` mock entry has `gameId: 'catan'` but matches all games

**File:** `src/data/mock-qa.ts:208-217`, `src/lib/ai/mock-engine.ts:30`
**Problem:** The mock engine filters candidates with:
```ts
MOCK_QA.filter((entry) => entry.gameId === game.id || entry.id === 'generic-strategy')
```
The `generic-strategy` entry is always included regardless of which game is selected. However, this entry has `gameId: 'catan'` and its citations reference `'RulesGenie Demo Mode'` with a strategy disclaimer — not the selected game. If a user asks a strategy-adjacent question about **Wingspan** or **Gloomhaven**, they can get a response sourced from a Catan-tagged entry. The citation attribution is misleading.

**Impact:** Users see citations that don't match the game they selected. For a product whose core value proposition is _"citation-backed answers"_, cross-game citation bleed erodes trust.

**Fix:** Either:
- Remove the `gameId` field from `generic-strategy` (or set it to `null`) and ensure the mock engine doesn't attach game-specific citations to it, or
- Duplicate the generic-strategy entry per game so citations always reference the correct game context.

---

### P1-3: Library search placeholder promises "mechanic or vibe" but only searches name/description/category

**File:** `src/components/library-browser.tsx:15, 36`
**Problem:** The search input placeholder reads _"Search by game, mechanic, or vibe"_ and the `aria-label` says _"Search games by name, mechanic, or theme"_. However, the actual filter logic is:
```ts
const matchesSearch = `${game.name} ${game.description} ${game.category}`
  .toLowerCase().includes(search.toLowerCase());
```
The `mechanics`, `highlights`, and `tags` fields on `GameRecord` are not included in the search string. Searching for "deck building" or "worker placement" will only match if those exact words happen to appear in the game's `description` or `category` text — which for many games, they don't.

**Impact:** Users searching by mechanic (a natural discovery pattern for board gamers) get false negatives. The UI sets an expectation it doesn't fulfill.

**Fix:** Include `game.mechanics.join(' ')` and `game.highlights.join(' ')` in the search string:
```ts
const matchesSearch = `${game.name} ${game.description} ${game.category} ${game.mechanics.join(' ')} ${game.highlights.join(' ')}`
  .toLowerCase().includes(search.toLowerCase());
```

---

### P1-4: OpenAI prompt context has no token budget — unbounded context injection

**File:** `src/lib/ai/openai-engine.ts:36-44`
**Problem:** The system prompt packs the full `quickStart` array, full `setupGuide` array, all `mechanics`, and every `MOCK_QA` entry matching the game into a single context block with no truncation or token budget. For games with extensive reference data (e.g., Gloomhaven), this context can grow large enough to:
1. Exceed the model's context window, causing silent truncation of the conversation history or the user's question.
2. Inflate API costs per request with no cap.
3. Degrade answer quality as the model attends to too much loosely-relevant context.

**Impact:** Answer quality silently degrades for content-heavy games. No error is surfaced — the response just gets worse.

**Fix:**
- Count approximate tokens before sending (e.g., `Math.ceil(context.length / 4)` as a rough estimate).
- Truncate or summarize context sections that exceed a budget (e.g., 3000 tokens for context, leaving room for the system prompt, history, and response).
- At minimum, limit `MOCK_QA` entries to the top-N most relevant (by keyword overlap with the question) rather than including all entries for the game.

---

## Summary

Only **5 genuinely new issues** were found. The codebase has improved significantly across Reviews 1–3; many prior P0s are now fixed. The remaining issues cluster around **AI mode transparency** (P0-1, P1-1) and **search/data accuracy** (P1-2, P1-3) — areas that directly impact the product's core promise of trustworthy, citation-backed answers.

| Priority | Count | Theme |
|----------|-------|-------|
| P0 | 1 | Silent AI fallback with no user indication |
| P1 | 4 | Mode badge, cross-game citations, search accuracy, unbounded context |

The single most impactful fix is making AI failures visible to the user (P0-1 + P1-1 together). A user who configures an API key and gets silent demo-mode fallbacks will lose trust in every answer the product gives.
