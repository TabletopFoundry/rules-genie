# UX & DX Review 6 — Delta Audit (Round 6)

> **Reviewer:** Automated delta audit via full source read  
> **Date:** 2025-07-19  
> **Scope:** Genuinely new P0/P1 issues not documented in UX_REVIEW 1–5, CODE_REVIEW 1–2, or IMPROVEMENTS.md  
> **Method:** Complete read of every source file, cross-referenced against all 7 prior review documents  

---

## Triage: Prior Issues Resolved Since Review 5

| Prior ID | Issue | Status |
|---|---|---|
| R5 P0-1 | Unguarded `JSON.parse` of LLM output | ✅ Fixed — separate try/catch + null check (openai-engine.ts:112-124) |
| R5 P0-2 | Dashboard `getDashboardSnapshot` assumes profile exists | ✅ Fixed — null guard + descriptive error (dashboard.ts:14-16) |
| R5 P1-1 | Dashboard `<select>` missing aria-label | ✅ Fixed — `aria-label="Choose a game to add…"` (dashboard-client.tsx:120) |
| R5 P1-2 | `min-w-[240px]` overflow on mobile | ✅ Fixed — `w-full sm:min-w-[240px]` (dashboard-client.tsx:120) |
| R5 P1-3 | Remove buttons lack distinguishing context | ✅ Fixed — contextual `aria-label` on both buttons (dashboard-client.tsx:151,197) |
| R5 P1-4 | Sidebar hidden below `xl` with no alternative | ✅ Fixed — collapse toggle with `aria-expanded`/`aria-controls` (chat-interface.tsx:92-102) |
| R5 P1-5 | `ChatInterface` returns `null` silently | ✅ Fixed — empty-state message (chat-interface.tsx:80-87) |
| R5 P1-6 | `QuickStartExplorer` returns `null` silently | ✅ Fixed — empty-state message (quick-start-explorer.tsx:13-19) |
| R5 P1-7 | Conversation answers lack heading landmarks | ✅ Fixed — `<h4 className="sr-only">` per article (conversation-thread.tsx:34) |
| R5 P1-8 | FeatureCard icon not marked decorative | ✅ Fixed — `aria-hidden="true"` on icon div (feature-card.tsx:6) |
| R5 P1-9 | Mobile nav has no backdrop overlay | ✅ Fixed — semi-transparent backdrop + click-to-close (site-header.tsx:101-106) |
| R4 P0-1 | Silent AI fallback with no user indication | ✅ Fixed — mode badge now dynamic from last answer (chat-interface.tsx:76-78), fallback warning shown (chat-interface.tsx:174-176) |
| R4 P1-1 | Chat header hardcodes "Demo mode" | ✅ Fixed — derives label from `lastMode` (chat-interface.tsx:77) |
| CR2 P0-NEW-1 | `GAME_COLUMNS` triplicated | ✅ Fixed — single source in shared.ts, imported everywhere (shared.ts:4-9, seed.ts:6, games.ts:4, dashboard.ts:5) |
| CR2 P1-NEW-1 | `require()` in connection.ts | ✅ Fixed — static `import` (connection.ts:7-8) |
| CR2 P1-NEW-3 | Duplicate demo-mode guard in openai-engine | ✅ Fixed — removed; throws if no client (openai-engine.ts:41-43) |
| CR2 P1-NEW-4 | Complexity thresholds duplicated | ✅ Fixed — exported constants from utils.ts, used in library-browser.tsx (utils.ts:10-11, library-browser.tsx:6) |
| CR2 P1-NEW-6 | `timeAgo()` no NaN guard | ✅ Fixed — `isNaN(date.getTime())` check (utils.ts:76) |
| R3 P0-1 | Mobile nav no focus trap | ✅ Fixed — full Tab-cycling focus trap (site-header.tsx:36-63) |
| R3 P0-2 | `error.tsx` missing `role="alert"` | ✅ Fixed (error.tsx:5) |
| R3 P0-3 | Unguarded `localStorage` | ✅ Fixed — try/catch with in-memory fallback (use-rules-session.ts:17-41) |
| R3 P0-4 | `useConversation` no JSON-parse guard | ✅ Fixed — `safeJsonParse` helper (use-conversation.ts:8-18) |
| R3 P0-5 | Feedback `<select>` no label | ✅ Fixed — `aria-label="Feedback reason"` + wrapping `<label>` (feedback-controls.tsx:56-57) |
| R4 P1-3 | Library search doesn't include mechanics | ✅ Fixed — search string includes `mechanics.join(' ')` + `highlights.join(' ')` (library-browser.tsx:16) |
| R4 P1-4 | OpenAI prompt unbounded context | ✅ Fixed — token budget + ranked top-N entries (openai-engine.ts:9-16, 53-73) |
| R3 P1-1 | No per-page metadata | ✅ Fixed — all pages now export `metadata` with OG + Twitter cards |

**Not re-flagged (still open from prior reviews, tracked there):**
P0: no tests, no auth, no rate-limiting · P1: `MOCK_QA` coupling (CR2 P1-NEW-2), Set→Array conversion (CR2 P1-NEW-5) · P2: `timeAgo` Math.round, footer demo text, GameCard duplicate links, no dark mode, security headers, askQuestion no AbortController, feedback auto-select reason, over-broad `aria-live`, no `aria-current` on nav, IME guard, status-pill color-only, email not UNIQUE, no per-route loading skeletons, SVG icon unescaped.

---

## P0 — Must Fix

### P0-1: OpenAI client has no request timeout — user can hang indefinitely

**File:** `src/lib/ai/openai-engine.ts:36, 81-110`  
**Issue:** `getOpenAiClient()` creates `new OpenAI({ apiKey })` with no `timeout` or `maxRetries` configuration. The OpenAI Node SDK defaults to a **10-minute timeout**. If the OpenAI API is slow, degraded, or silently dropping connections (which happens during outages), the user sees "answering…" with no progress and no way to cancel — for up to 10 minutes.

Additionally, `getOpenAiClient()` is called on every request (not cached), so there's no shared configuration point for timeout/retry policies.

For a product whose core promise is *"get the ruling in seconds"* during active gameplay, a multi-minute hang with no user feedback is a critical UX failure.

**Impact:** During an OpenAI degradation (a realistic production scenario), the entire chat feature becomes unusable with no error message, no timeout, and no recovery path. Users will assume the app is broken and close it.

**Fix:**
```ts
// Cache the client instance with proper timeout configuration
let cachedClient: OpenAI | null = null;

function getOpenAiClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 15_000,  // 15 seconds — generous for a real-time Q&A product
      maxRetries: 1      // One retry on transient failures
    });
  }
  return cachedClient;
}
```

Also consider an `AbortController` with a client-side timeout in `use-conversation.ts` so users see a meaningful error after ~20 seconds:
```ts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 20_000);
const response = await fetch('/api/ask', { ..., signal: controller.signal });
clearTimeout(timeoutId);
```

**Why P0:** The core user flow (ask a question, get a fast answer) can silently hang for minutes with zero feedback. This directly undermines the product's value proposition.

---

### P0-2: Invalid `gameId` causes FK-violation 500 instead of validation 400

**File:** `src/app/api/ask/route.ts:29`, `src/lib/db/sessions.ts:11-14`  
**Issue:** The `/api/ask` handler calls `getConversation(sessionId, gameId)` before `answerRulesQuestion(gameId, ...)`. Inside `getConversation`, `ensureSession` runs:

```ts
db.prepare(`INSERT INTO sessions (id, user_id, game_id)
  VALUES (@id, @user_id, @game_id)
  ON CONFLICT(id) DO UPDATE SET game_id = excluded.game_id, ...`)
```

If `gameId` doesn't exist in the `games` table, this violates the `FOREIGN KEY (game_id) REFERENCES games(id)` constraint. SQLite throws `SQLITE_CONSTRAINT_FOREIGNKEY`, which bubbles up to the route's generic catch block and returns:

```json
{ "error": "RulesGenie could not answer right now." }  // 500
```

The game-existence check in `answerRulesQuestion` (`GAMES.find(item => item.id === gameId)`) never executes because the DB operation fails first.

**Impact:** An invalid game ID — whether from a stale URL, a hand-crafted request, or a client bug — returns an opaque 500 error instead of a clear 400 "Unknown game." The user sees a generic failure message with no actionable guidance. Server-side, the error log shows a SQLite constraint violation, which looks like a data integrity issue rather than invalid input.

**Fix:** Validate `gameId` against known games *before* any DB operations:

```ts
// In api/ask/route.ts, after Zod validation:
const game = getGameById(parsed.data.gameId);
if (!game) {
  return NextResponse.json(
    { error: 'That game is not in the RulesGenie catalog. Pick a supported game and try again.' },
    { status: 400 }
  );
}

const history = getConversation(parsed.data.sessionId, parsed.data.gameId);
const answer = await answerRulesQuestion({ gameId: parsed.data.gameId, question: parsed.data.question, history });
```

This also applies to `/api/session` (GET), which calls `getConversation` with an unvalidated `gameId`.

**Why P0:** A realistic user scenario (bookmarked URL with a removed game, or stale browser cache) triggers an opaque server error. The FK violation masquerades as a system fault in logs, obscuring the root cause.

---

## P1 — Should Fix

### P1-1: Toggle components use raw `.json()` without Content-Type safety — inconsistent with `use-conversation.ts` fix

**Files:** `src/components/bookmark-toggle.tsx:27`, `src/components/collection-toggle.tsx:34`, `src/components/dashboard-client.tsx:35,54`  
**Issue:** Review 3 P0-4 identified that calling `response.json()` on a non-JSON response (e.g., HTML 502 from a proxy) throws an unhandled error. The fix — `safeJsonParse` with Content-Type checking — was applied only to `use-conversation.ts`. Three other client components still use raw `.json()`:

```ts
// bookmark-toggle.tsx:27
const payload = (await response.json()) as { active: boolean };

// collection-toggle.tsx:34
const payload = (await response.json()) as { active: boolean };

// dashboard-client.tsx:35
const payload = (await response.json()) as { active: boolean };
```

These calls are inside try/catch blocks, so the error IS caught and a message IS shown. But the displayed error will be `"Unexpected token '<' in JSON..."` or similar parser internals instead of a user-friendly message. This is inconsistent with the pattern established for the conversation hook.

**Fix:** Extract `safeJsonParse` to a shared utility (e.g., `src/lib/fetch-utils.ts`) and use it in all client-side fetch calls:

```ts
// src/lib/fetch-utils.ts
export async function safeJsonParse<T>(response: Response, fallbackError: string): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(fallbackError);
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(fallbackError);
  }
}
```

Then in each component:
```ts
const payload = await safeJsonParse<{ active: boolean }>(response, 'Could not save bookmark.');
```

---

### P1-2: Global `not-found.tsx` uses game-specific copy for all 404s

**File:** `src/app/not-found.tsx:8-9`  
**Issue:** The global 404 page says:

```
That game card is missing.
Head back to the supported games library and pick another title to explore.
```

This copy is game-specific, but this is the *global* 404 handler. Navigating to `/dashboard/nonexistent`, `/anything/else`, or any invalid non-game URL shows "That game card is missing" — which is confusing and makes the app look buggy.

The "Browse games" CTA link also only makes sense for game-related 404s, not for general navigation errors.

**Fix:** Make the copy generic, or add a route-specific `not-found.tsx` inside `src/app/games/[id]/`:

Option A — Generic global 404:
```tsx
<h1>Page not found.</h1>
<p>The page you're looking for doesn't exist or may have been moved.</p>
<Link href="/">Go to homepage</Link>
```

Option B — Route-specific 404 for games, generic fallback for everything else:
```
src/app/not-found.tsx         → generic "Page not found" + link to homepage
src/app/games/[id]/not-found.tsx → "That game card is missing" + link to /games
```

---

### P1-3: `db.ts` and `ai.ts` barrel files have misleading comments about module resolution

**Files:** `src/lib/db.ts:2`, `src/lib/ai.ts:2`  
**Issue:** Both files contain the comment:

```ts
// New code should import from '@/lib/db' (which resolves to db/index.ts).
```

This is incorrect. In Node.js and TypeScript module resolution, a **file** (`db.ts`) takes precedence over a **directory index** (`db/index.ts`) when resolving `@/lib/db`. The import `from '@/lib/db'` resolves to `db.ts`, not `db/index.ts`.

Currently this is harmless because `db.ts` re-exports everything from `db/index.ts`. But the misleading comment creates a risk: a contributor who reads the comment, trusts it, and deletes `db.ts` (thinking the directory barrel "takes over") would break all imports across 11 files.

**Fix:** Either:
- Delete `db.ts` and `ai.ts` and update all imports to `from '@/lib/db/index'` (cleanest), or
- Correct the comment: `// This file IS the resolution target for '@/lib/db'. It re-exports from the db/ directory.`

---

### P1-4: `/api/session` GET endpoint creates sessions as a side effect of reading

**File:** `src/app/api/session/route.ts:25`, `src/lib/db/sessions.ts:19`  
**Issue:** The GET handler calls `getConversation(sessionId, gameId)`, which internally calls `ensureSession(sessionId, gameId)`. This INSERT-on-read means:

1. **A GET request has write side effects** — violating HTTP semantics. Caches, CDNs, and prefetch mechanisms assume GET is safe and idempotent. A browser's speculative prefetch or a reverse proxy's cache-warming would silently create empty sessions in the database.

2. **Session creation happens before the user asks anything** — the client hook `useConversation` fetches history on mount (use-conversation.ts:42), which creates a session immediately when the user navigates to `/ask`. If the user browses all 6+ games without asking a question, 6+ empty sessions are created.

3. **Stale sessions accumulate with no cleanup** — there's no TTL, no cleanup job, and no limit on session count per user.

**Fix:** Split `getConversation` into read-only and write-with-session paths:

```ts
// sessions.ts
export function getConversationHistory(sessionId: string, gameId: string, userId = DEMO_USER_ID) {
  const db = getDb();
  // Read-only — don't create session
  const rows = db.prepare(`SELECT ... WHERE qa_pairs.session_id = ? AND qa_pairs.game_id = ?`)
    .all(userId, sessionId, gameId) as Record<string, unknown>[];
  return rows.map(mapQaRow);
}
```

Move `ensureSession` to `saveQaPair` only (where a write is expected). The GET endpoint then becomes truly read-only.

---

### P1-5: `getOpenAiClient()` recreated per request — prevents connection reuse and centralized config

**File:** `src/lib/ai/openai-engine.ts:32-37`  
**Issue:** Every call to `answerWithOpenAi` creates `new OpenAI({ apiKey })`. The OpenAI Node SDK constructor is lightweight, but this pattern:

1. Prevents connection pooling (each client starts with a fresh HTTP agent)
2. Makes it impossible to configure timeout/retry/logging in one place (directly related to P0-1)
3. Means env-var validation happens per-request instead of at startup, delaying error discovery

**Fix:** Cache the client at module scope (see P0-1 fix above). If dynamic env-var reload is needed (rare), expose an explicit `resetOpenAiClient()` for testing.

---

## Summary

| Priority | Count | Theme |
|----------|-------|-------|
| P0 | 2 | Request timeout + gameId validation gap |
| P1 | 5 | Fetch safety consistency, 404 copy, module comments, session side effects, client caching |

### Refactoring Priority (new items only)

| Priority | ID | Effort | Description |
|---|---|---|---|
| 1 | P0-1 | 20 min | Add timeout + maxRetries to OpenAI client; cache singleton |
| 2 | P0-2 | 15 min | Validate gameId before DB operations in `/api/ask` and `/api/session` |
| 3 | P1-1 | 30 min | Extract `safeJsonParse` to shared utility; apply in toggle components |
| 4 | P1-2 | 10 min | Make global 404 copy generic; optionally add game-specific 404 |
| 5 | P1-4 | 30 min | Split `getConversation` into read-only + write paths |
| 6 | P1-3 | 5 min | Fix misleading module-resolution comments in db.ts / ai.ts |
| 7 | P1-5 | 10 min | Cache OpenAI client (combined with P0-1) |

### Overall Assessment

The codebase has improved substantially across 6 rounds of review. The 25+ items confirmed fixed above demonstrate consistent follow-through on prior feedback. The remaining new issues cluster around two themes:

1. **Operational resilience** (P0-1, P0-2): The happy path works well, but edge cases — slow API responses, invalid game IDs — produce opaque failures. These are the gaps that surface in production under real load.

2. **Consistency of defensive patterns** (P1-1, P1-4): Good patterns exist (`safeJsonParse`, Zod validation) but aren't applied uniformly. The fix-one-leave-three pattern creates false confidence in robustness.

The two P0s are both quick fixes (<30 min each) with outsized impact on production reliability.

---

*File paths are relative to `01-rules-genie/` unless otherwise noted.*
