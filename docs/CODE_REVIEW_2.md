# Code Quality & Architecture Review — RulesGenie (Follow-up)

**Reviewed:** 2025-07-18
**Baseline:** CODE_REVIEW.md (2025-07-17)
**Codebase:** Next.js 15 + React 19 + TypeScript 5.8 + SQLite (better-sqlite3) + OpenAI API
**Total source lines:** ~3,517 across 38 files
**Lint status:** ✅ Zero ESLint warnings/errors · ✅ Zero TypeScript errors

---

## Progress Since CODE_REVIEW.md

The following items from the first review have been **fully addressed**:

| Original ID | Item | Status |
|---|---|---|
| P1-1 | `db.ts` god module → split into `db/` sub-modules | ✅ Done |
| P1-2 | Import-time side effects → lazy `getDb()` pattern | ✅ Done |
| P1-3 | `ai.ts` mixed concerns → split into `ai/` sub-modules | ✅ Done |
| P1-4 | `chat-interface.tsx` god component → extracted hooks + children | ✅ Done (177 → 177 lines, with `useConversation`, `useRulesSession`, `ConversationThread`, `QuestionInput` extracted) |
| P1-5 | Prompt injection risk → safety preamble + structured messages | ✅ Done |
| P1-6 | No CSRF protection → `middleware.ts` Origin verification | ✅ Done |
| P0-4 | Unvalidated LLM JSON → Zod `AiAnswerSchema.safeParse()` | ✅ Done |
| P2-3 | Magic numbers in scoring → named constants exported | ✅ Done (scoring.ts:5-9) |
| P2-5 | `parseJson` swallows errors silently → now logs with `console.warn`/`console.error` | ✅ Done |
| P2-9 | `getFeaturedGames()` fetches all → uses `LIMIT 6` in SQL | ✅ Done |
| P2-10 | `saveQaPair` re-fetches entire conversation → `WHERE qa_pairs.id = ?` | ✅ Done |
| P2-11 | Side-effect import in `layout.tsx` → removed | ✅ Done |
| P2-14 | Mobile nav lacks focus trap → implemented in `site-header.tsx` | ✅ Done |

**Not yet addressed (still valid, not re-flagged here):**
P0-1 (no tests), P0-2 (no auth), P0-3 (no rate-limiting), P2-1 (API boilerplate), P2-2 (toggle duplication), P2-4 (unsafe type assertions in DB), P2-7 (`timeAgo` NaN), P2-8 (SVG injection), P2-12 (`collectionIds` Array vs Set), P2-13 (no per-page error boundaries), P2-15 (image optimization disabled).

---

## New Findings — Issues Introduced or Surfaced by Refactoring

### P0-NEW-1 · `GAME_COLUMNS` Duplicated Across Three Modules — Divergence Risk

| Detail | |
|---|---|
| **Severity** | 🔴 P0 — Correctness risk |
| **Location** | `src/lib/db/seed.ts:7-12`, `src/lib/db/games.ts:6-11`, `src/lib/db/dashboard.ts:7-12` |
| **Impact** | The same `GAME_COLUMNS` SQL column list is copy-pasted in three separate files. If a column is added to the schema (e.g., `publisher`, `bgg_id`), only one or two files may be updated, causing silent `undefined` values from `mapGameRow()` or runtime INSERT failures in `seedDatabase()`. The schema has 18 game columns — this is exactly the kind of long, error-prone string that should have a single source of truth. |
| **Fix** | Define `GAME_COLUMNS` once in `src/lib/db/shared.ts` and import it in `seed.ts`, `games.ts`, and `dashboard.ts`: |

```ts
// shared.ts
export const GAME_COLUMNS = `
  id, name, tagline, description, player_min, player_max, play_time,
  complexity, year, category, mechanics_json, highlights_json,
  quick_start_json, setup_guide_json, example_questions_json,
  edition_label, palette_json, icon
`;
```

---

### P1-NEW-1 · `connection.ts` Uses `require()` for Module Loading — Breaks ESM + TypeScript Guarantees

| Detail | |
|---|---|
| **Severity** | 🟠 P1 — Maintainability / correctness |
| **Location** | `src/lib/db/connection.ts:44-45` |
| **Code** |

```ts
const { initializeDatabase } = require('./schema') as typeof import('./schema');
const { seedDatabase } = require('./seed') as typeof import('./seed');
```

| **Impact** | Dynamic `require()` bypasses TypeScript's module resolution and tree-shaking. The `as typeof import(...)` cast provides zero runtime safety — if the export name changes, this will throw at runtime with no compile-time warning. In Next.js 15 (which defaults to `serverExternalPackages` and RSC module graph), mixing `require` with ESM can cause subtle double-initialization or module caching issues. |
| **Fix** | Use a top-level `import` with the lazy guard pattern: |

```ts
import { initializeDatabase } from './schema';
import { seedDatabase } from './seed';

let initialized = false;

export function getDb() {
  if (!initialized) {
    initializeDatabase(db);
    seedDatabase(db);
    initialized = true;
  }
  return db;
}
```

The original concern (avoiding import-time side effects) is already solved by the `initialized` guard — `require()` adds no benefit.

---

### P1-NEW-2 · `MOCK_QA` Imported in Both `mock-engine.ts` and `openai-engine.ts` — AI Layer Couples to Static Data

| Detail | |
|---|---|
| **Severity** | 🟠 P1 — Architecture (DIP violation) |
| **Location** | `src/lib/ai/mock-engine.ts:1`, `src/lib/ai/openai-engine.ts:4`, `src/lib/ai/index.ts:1` |
| **Impact** | All three AI modules directly import `MOCK_QA` from `@/data/mock-qa` or `GAMES` from `@/data/games`. The AI layer is tightly coupled to the static data layer. Adding a second data source (e.g., user-contributed Q&A, a database-backed FAQ) requires modifying engine internals. The first review flagged `GAMES.find()` in the old monolith `ai.ts` (DIP violation); the split preserved the coupling instead of fixing it. |
| **Fix** | Inject data through function parameters: |

```ts
// index.ts — game is already resolved from GAMES; pass it down
export async function answerRulesQuestion(input: {
  game: GameRecord;         // ← pass resolved game, not gameId
  question: string;
  history: QaRecord[];
  mockQa: MockQa[];         // ← inject reference data
}) { ... }
```

This keeps the AI layer data-source agnostic and makes unit testing trivial (pass fixtures instead of importing the full catalog).

---

### P1-NEW-3 · `openai-engine.ts` Double-Checks Demo Mode After Orchestrator Already Decided

| Detail | |
|---|---|
| **Severity** | 🟠 P1 — Logic smell / broken abstraction |
| **Location** | `src/lib/ai/openai-engine.ts:41` |
| **Code** |

```ts
if (!client || process.env.RULESGENIE_DEMO_MODE === 'true') {
  return answerWithMock(game, question);
}
```

| **Impact** | `answerRulesQuestion()` in `index.ts:17-18` already checks `RULESGENIE_DEMO_MODE` and routes to `answerWithMock` when demo mode is active. The duplicate guard in `openai-engine.ts` means: (1) the strategy boundary is leaky — `answerWithOpenAi` shouldn't know about demo mode at all, (2) the condition uses `=== 'true'` while `index.ts` uses `!== 'false'` — **these are not equivalent** (e.g., an unset env var triggers demo in `index.ts` but not in `openai-engine.ts`). This inconsistency is a latent bug: if `RULESGENIE_DEMO_MODE` is undefined and no API key is set, `index.ts` correctly routes to mock, but if it somehow reaches `openai-engine.ts` with a stale/null client, it falls through to the `try` block and throws. |
| **Fix** | Remove the env-var check from `openai-engine.ts`. If no client is available, throw an error (fail-fast) rather than silently falling back — the orchestrator owns the routing: |

```ts
export async function answerWithOpenAi(...): Promise<AiAnswer> {
  const client = getOpenAiClient();
  if (!client) {
    throw new Error('OpenAI API key not configured — orchestrator should have routed to mock engine');
  }
  // ...proceed with API call
}
```

---

### P1-NEW-4 · Complexity Thresholds Still Duplicated Between `utils.ts` and `library-browser.tsx`

| Detail | |
|---|---|
| **Severity** | 🟠 P1 — Consistency / DRY violation |
| **Location** | `src/lib/utils.ts:11-13`, `src/components/library-browser.tsx:18-20` |
| **Code** |

```ts
// utils.ts
if (value < 2.2) return 'Gateway';
if (value < 3.2) return 'Midweight';

// library-browser.tsx
(complexity === 'easy' && game.complexity < 2.2) ||
(complexity === 'mid' && game.complexity >= 2.2 && game.complexity < 3.2) ||
(complexity === 'heavy' && game.complexity >= 3.2);
```

| **Impact** | The first review flagged magic numbers (P2-3), and scoring constants were extracted in `scoring.ts`. However, the **complexity thresholds** — the other half of P2-3 — remain duplicated. Changing the boundary between "Gateway" and "Midweight" requires editing two files, and a mismatch means the filter and the label disagree. |
| **Fix** | Export named constants from `utils.ts` and use them in `library-browser.tsx`: |

```ts
// utils.ts
export const COMPLEXITY_GATEWAY_MAX = 2.2;
export const COMPLEXITY_MIDWEIGHT_MAX = 3.2;

export function getComplexityLabel(value: number) {
  if (value < COMPLEXITY_GATEWAY_MAX) return 'Gateway';
  if (value < COMPLEXITY_MIDWEIGHT_MAX) return 'Midweight';
  return 'Strategy-heavy';
}
```

```ts
// library-browser.tsx
import { COMPLEXITY_GATEWAY_MAX, COMPLEXITY_MIDWEIGHT_MAX } from '@/lib/utils';
// ...
(complexity === 'easy' && game.complexity < COMPLEXITY_GATEWAY_MAX) ||
(complexity === 'mid' && game.complexity >= COMPLEXITY_GATEWAY_MAX && game.complexity < COMPLEXITY_MIDWEIGHT_MAX) ||
(complexity === 'heavy' && game.complexity >= COMPLEXITY_MIDWEIGHT_MAX);
```

---

### P1-NEW-5 · `page.tsx` (home) Still Converts Collection Set to Array for Linear Scan

| Detail | |
|---|---|
| **Severity** | 🟠 P1 — Original P2-12 not addressed + now present in `games/page.tsx` too |
| **Location** | `src/app/page.tsx:24`, `src/app/games/page.tsx:16`, `src/components/library-browser.tsx:58` |
| **Code** |

```ts
// page.tsx:24
const collectionIds = Array.from(getCollectionGameIds());
// ...
inCollection={collectionIds.includes(game.id)}

// games/page.tsx:16
const collectionIds = Array.from(getCollectionGameIds());
// library-browser.tsx:58
inCollection={initialCollectionIds.includes(game.id)}
```

| **Impact** | `getCollectionGameIds()` returns a `Set<string>`. Both pages convert it to `Array` then use `.includes()` (O(n) per game). With 6 featured games this is trivial, but the pattern trains bad habits and `library-browser.tsx` receives `string[]` as a prop, locking in the inefficiency. The game detail page (`games/[id]/page.tsx:35`) correctly uses `.has()` — so there's an inconsistency in the codebase. |
| **Fix** | Pass `Set<string>` (or convert props to accept `Set`) and use `.has()` consistently everywhere. |

---

### P1-NEW-6 · `timeAgo()` Still Does Not Guard Against Invalid Dates

| Detail | |
|---|---|
| **Severity** | 🟠 P1 — Original P2-7 not addressed |
| **Location** | `src/lib/utils.ts:71-80` |
| **Impact** | `new Date(undefined)` → `NaN` → returns `"NaNd ago"` in the UI. This was flagged in the first review with a concrete 2-line fix. It remains unaddressed. Elevating to P1 because it produces user-visible corruption if any `createdAt` field is missing or malformed. |
| **Fix** |

```ts
export function timeAgo(value: string) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'unknown';
  // ...rest unchanged
}
```

---

## Summary

| Category | Count |
|---|---|
| New P0 findings | 1 (GAME_COLUMNS divergence risk) |
| New P1 findings | 5 (require() usage, data coupling, logic inconsistency, threshold duplication, Set→Array, timeAgo) |
| Previously flagged items now fixed | 13 |
| Previously flagged items still open | 11 |

### Refactoring Priority (new items only)

| Priority | ID | Effort | Description |
|---|---|---|---|
| 1 | P0-NEW-1 | 10 min | Extract shared `GAME_COLUMNS` constant |
| 2 | P1-NEW-6 | 2 min | Add `isNaN` guard to `timeAgo()` |
| 3 | P1-NEW-4 | 10 min | Export complexity threshold constants |
| 4 | P1-NEW-5 | 15 min | Pass `Set` instead of `Array` for collection IDs |
| 5 | P1-NEW-1 | 10 min | Replace `require()` with static `import` in `connection.ts` |
| 6 | P1-NEW-3 | 10 min | Remove duplicate demo-mode guard from `openai-engine.ts` |
| 7 | P1-NEW-2 | 30 min | Inject data dependencies into AI engine functions |

### Overall Assessment Post-Refactoring

The codebase has materially improved since the first review. The god-module splits (`db/`, `ai/`), the extracted hooks, CSRF middleware, Zod validation of LLM output, focus trap, and lazy DB initialization are all well-executed. The new issues are primarily "seams" left behind by the refactoring — duplicated constants, coupling preserved through the split, and a few items from the first review that were skipped. None are blockers, but P0-NEW-1 (divergence risk from triplicated column lists) should be fixed immediately.

---

*File paths are relative to `01-rules-genie/src/` unless otherwise noted.*
