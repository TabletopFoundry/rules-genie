# RulesGenie — UX & Developer Experience Audit

> **Auditor perspective:** Senior engineer encountering this codebase for the first time.  
> **Date:** June 2025  
> **Scope:** Full product UX, developer experience, PRD compliance, and polish review.

---

## 1. Executive Summary

RulesGenie is a surprisingly well-executed MVP. The visual design is polished and cohesive, the code architecture is clean and idiomatic Next.js 15 App Router, and the demo mode provides a genuine zero-config first experience. For a project at this stage, the ratio of working features to codebase size is excellent — ~14 well-structured components, 5 API routes, and a clean SQLite persistence layer deliver a complete product loop from game selection → Q&A → bookmarks → dashboard.

**However**, several significant UX gaps exist between what the PRD requires and what ships today. The most critical are: no keyboard submission in the chat (Enter key does nothing), no auto-scroll to new answers, the chat textarea is awkwardly tall for conversational use, the mobile nav collapses poorly, and accessibility falls short of the WCAG 2.1 AA commitment in the PRD. These are the kinds of issues that undermine trust at first contact — exactly the audience this product targets.

---

## 2. PRD Compliance Scorecard

| PRD Requirement | Status | Notes |
|---|---|---|
| **FR-001: Game Selection** | ✅ Implemented | Search in library, select in chat sidebar. No "unsupported game" blocking state in the Q&A flow — all games are pre-loaded, so the risk is low, but the PRD's 500ms search suggestion target is N/A (no typeahead in Q&A). |
| **FR-002: Citation-Backed Q&A** | ✅ Implemented | Mock + OpenAI paths both return citations. Citations render inline. |
| **FR-003: Edition/Expansion Awareness** | ⚠️ Partial | `editionLabel` field exists in the data model but is never surfaced in the game selector or Q&A flow. Users cannot scope answers by edition or expansion. PRD marks this Must-have. |
| **FR-004: Multi-Turn Session** | ✅ Implemented | Session stored in localStorage per game, history persisted to SQLite. No session expiry/stale-context warning (PRD says 30-min inactivity prompt). |
| **FR-005: Ambiguity/Low-Confidence** | ✅ Implemented | `StatusPill` renders grounded/low-confidence/conflicting/strategy states. Confidence % displayed. Suggestions returned but not rendered in the chat UI. |
| **FR-006: Answer Feedback** | ✅ Implemented | Thumbs up/down + reason picker. Overwrites on re-submission. |
| **FR-007: Source Ingestion** | ❌ Not implemented | No admin UI or ingestion workflow exists. PRD marks this Must-have. Acceptable for demo/alpha, but noted. |
| **NFR: WCAG 2.1 AA** | ⚠️ Partial | See accessibility section below. |
| **NFR: 320px viewport** | ⚠️ Partial | Header nav wraps but has no hamburger menu — overflows on narrow screens. |
| **NFR: Localization-ready strings** | ❌ Not started | All strings are hardcoded in JSX. |

---

## 3. Top Friction Points (Ranked by User Impact)

### P0 — Critical (Blocks core user flow)

#### 3.1 No Enter-key submission in chat
**File:** `src/components/chat-interface.tsx:192-208`  
**Problem:** The textarea has no `onKeyDown` handler. Users instinctively press Enter (or Cmd+Enter) to send a message. Nothing happens. They must mouse to the "Ask RulesGenie" button.  
**Impact:** Every single Q&A interaction requires an extra, unnatural step. For a "mid-game speed" product, this is the #1 friction point.  
**Fix:** Add `onKeyDown` handler: Enter submits (or Cmd/Ctrl+Enter for multi-line), Shift+Enter inserts newline.

#### 3.2 No auto-scroll to new answers
**File:** `src/components/chat-interface.tsx:155-184`  
**Problem:** When a new Q&A pair is added to the history, the conversation area does not scroll to show it. After 2-3 questions, the latest answer is below the fold and invisible.  
**Impact:** Users think nothing happened after asking a question. They must manually scroll down every time.  
**Fix:** Add a `useEffect` + `scrollIntoView` on `history` length change, or attach a ref to the bottom of the conversation.

#### 3.3 Chat textarea is too tall for conversational use
**File:** `src/components/chat-interface.tsx:197`  
**Problem:** `min-h-[130px]` makes the input area feel like a document editor, not a chat. Combined with the lack of Enter-key submission, the interaction model is ambiguous — is this a search box or a text editor?  
**Impact:** Wasted screen real estate on mobile; pushes conversation history off-screen.  
**Fix:** Reduce to `min-h-[48px]` with auto-resize on content, or use a single-line input with expand-on-focus.

### P0 — Critical (Accessibility)

#### 3.4 Missing focus management and keyboard navigation
**Files:** Multiple components  
**Problem:**
- No visible focus indicator on many interactive elements (buttons rely on browser defaults which are suppressed by `outline-none` on inputs).
- Example prompt buttons in the sidebar (`chat-interface.tsx:120-130`) have no `aria-label` distinguishing them.
- The game selector `<select>` in the sidebar has a `<label>` but no `id` association (it works via nesting, which is valid but fragile).
- No skip-to-content link in the layout.
- The loading state (`loading.tsx`) has no `aria-live` region, so screen readers don't announce it.
**Impact:** Fails WCAG 2.1 AA — PRD explicitly commits to this standard.  
**Fix:** Add `focus-visible:ring-2 focus-visible:ring-board-gold` to all interactive elements. Add `aria-live="polite"` to dynamic content regions. Add skip-nav link.

#### 3.5 Header navigation overflows on small screens
**File:** `src/components/site-header.tsx:21-28`  
**Problem:** The nav uses `flex-wrap` but has no hamburger/drawer pattern. On screens < 400px, the four nav links + "Demo user" badge wrap into 2-3 rows, pushing the logo off-screen and creating a ~120px tall header.  
**Impact:** PRD requires usability at 320px width. Current header consumes 30%+ of viewport at that width.  
**Fix:** Add a mobile hamburger menu (Sheet/Drawer) that collapses nav links behind a toggle below `sm` breakpoint.

---

### P1 — High (Degrades experience significantly)

#### 3.6 Suggestions from AI answers are never rendered
**File:** `src/lib/ai.ts:48-49, 58-59, 78-79` and `src/components/chat-interface.tsx:162-179`  
**Problem:** The `AiAnswer` type includes `suggestions: string[]` and both mock and OpenAI paths return them. But the chat interface never renders them. The PRD (FR-005) says low-confidence answers should show "suggested clarifying inputs."  
**Impact:** Users hitting a low-confidence answer get no guidance on how to improve their question — defeating the "honest AI" value prop.  
**Fix:** Render suggestions as clickable chips below the answer that auto-fill and submit a follow-up.

#### 3.7 No "clear session" or "new conversation" affordance
**File:** `src/components/chat-interface.tsx`  
**Problem:** Sessions are permanently tied to a game via localStorage. There is no way to start a fresh conversation for the same game. The only workaround is clearing localStorage manually.  
**Impact:** After testing or extended use, the conversation becomes long and stale. PRD mentions 30-min inactivity expiry — none exists.  
**Fix:** Add a "New session" button in the sidebar that clears the localStorage key and generates a fresh session ID.

#### 3.8 Error handling on API failures is silent in dashboard
**File:** `src/components/dashboard-client.tsx:21-39, 42-55`  
**Problem:** `toggleCollection` and `removeBookmark` both silently return on `!response.ok`. No error state, no toast, no feedback to the user.  
**Impact:** User clicks "Add game" or "Remove bookmark" and nothing happens. They have no idea why.  
**Fix:** Add error state or inline toast notification for failed mutations.

#### 3.9 Game detail page example questions don't pre-fill the chat
**File:** `src/app/games/[id]/page.tsx:96-100`  
**Problem:** Example question links navigate to `/ask?game=${game.id}` but don't include the question text. The user lands on the Q&A page and has to re-type or find the question.  
**Impact:** Breaks the "try this question" flow — the most natural conversion path from game detail to chat.  
**Fix:** Add `&q=` query param and pre-fill + auto-submit in the chat interface.

#### 3.10 `CollectionToggle` in `GameCard` doesn't sync with dashboard state
**Files:** `src/components/collection-toggle.tsx`, `src/components/dashboard-client.tsx`  
**Problem:** Toggling collection on a `GameCard` in the library fires an API call that mutates the DB, but the dashboard page won't reflect this until a full page reload. There's no shared state or cache invalidation.  
**Impact:** Users add a game on the library page, navigate to the dashboard, and don't see it. Confusing.  
**Fix:** Use `router.refresh()` on navigation, or lift collection state into a context/store, or accept the limitation and note it's demo-mode behavior.

---

### P2 — Medium (Polish and delight)

#### 3.11 No loading animation/skeleton — just static text
**File:** `src/app/loading.tsx`  
**Problem:** The global loading state is a static card with text "Setting the table…" — no spinner, pulse, or skeleton. The chat loading state (`chat-interface.tsx:180-183`) is a plain text div.  
**Impact:** The app feels frozen during loads. Users can't tell if something is happening.  
**Fix:** Add a subtle pulse/shimmer animation to loading states. Consider skeleton screens for the game library.

#### 3.12 Game covers are data-URI SVGs — no real images
**File:** `src/lib/utils.ts:42-60`  
**Problem:** Game covers are generated SVGs via `getGameCover()` encoded as data URIs. While creative for zero-dependency MVP, they look generic and don't distinguish games visually.  
**Impact:** The library grid feels repetitive. Board gamers identify games by box art — these covers provide no recognition value.  
**Fix:** For MVP, this is acceptable. For beta, source actual cover thumbnails or use higher-fidelity generative covers with game-specific imagery.

#### 3.13 Footer says "Demo mode" even when OpenAI is configured
**File:** `src/app/layout.tsx:24`  
**Problem:** The footer hardcodes "Demo mode works without API keys." This text doesn't change when the app is in OpenAI mode.  
**Impact:** Minor confusion about what mode the app is running in. The header badge also hardcodes "Demo mode ready" in `chat-interface.tsx:150-152`.  
**Fix:** Read the actual mode from the API response or a server-side flag and render conditionally.

#### 3.14 No dark mode support
**File:** `src/app/globals.css:6` — `color-scheme: light` is hardcoded.  
**Problem:** PRD notes "text must remain readable in low-light indoor settings" which is the primary use environment (game tables at night/cafés).  
**Impact:** Bright white UI may be uncomfortable for the exact use case the product targets.  
**Fix:** Add Tailwind `dark:` variants. The existing color palette (`board-pine`, `board-canvas`) maps naturally to a dark theme.

#### 3.15 Hardcoded "20 supported games" on landing page
**File:** `src/app/page.tsx:38`  
**Problem:** The stat card says `20` but this is hardcoded, not derived from the actual game count.  
**Impact:** If games are added/removed, the landing page lies. Minor but erodes trust.  
**Fix:** Pass `featuredGames.length` or `listGames().length` to the stat card.

#### 3.16 No pagination or virtual scrolling in game library
**File:** `src/components/library-browser.tsx`  
**Problem:** All 20 games render at once. Currently fine, but the PRD targets 200 games for beta.  
**Impact:** At 200 games with SVG covers, the library page will be very slow to render and consume significant memory.  
**Fix:** Add pagination (server-side preferred) or intersection-observer-based lazy loading before scaling to 200 games.

#### 3.17 `timeAgo` function produces inaccurate labels
**File:** `src/lib/utils.ts:71-80`  
**Problem:** Uses `Math.round` which means 29 minutes shows as "29m ago" (correct) but 89 minutes shows as "1h ago" when it's been nearly 1.5 hours. Days calculation is similarly imprecise.  
**Impact:** Minor, but "1d ago" for something 36 hours old feels wrong.  
**Fix:** Use `Math.floor` instead of `Math.round`, or use a library like `date-fns/formatDistanceToNow`.

---

## 4. Developer Experience Assessment

### 4.1 Onboarding & Setup — ✅ Excellent
- **Time to run:** `npm install && npm run dev` → running in ~30 seconds. Zero config required.
- **Demo mode:** Works without any API keys. This is best-in-class DX for an AI product.
- **README:** Clear, accurate, and concise. Covers all env vars and scripts.
- **.env.example:** Present and correct.

### 4.2 Code Organization — ✅ Very Good
- Clean separation: `app/` (routes), `components/` (UI), `lib/` (business logic), `data/` (seed data), `types/` (shared types).
- All components are single-purpose and reasonably sized (largest is `dashboard-client.tsx` at 190 lines).
- API routes are thin — validation with Zod, delegation to `lib/db` or `lib/ai`.
- Type safety is strong: `GameRecord`, `QaRecord`, `Citation`, etc. are well-defined.

### 4.3 Areas for Improvement

#### 4.3.1 No tests exist — P1
**Problem:** Zero test files. No test runner configured. No test script in `package.json`.  
**Impact:** Any refactor is a leap of faith. The mock Q&A matching logic (`ai.ts:19-38`) is perfect unit test material.  
**Fix:** Add Vitest + React Testing Library. Start with `ai.ts` (scoring logic), `utils.ts` (pure functions), and API route integration tests.

#### 4.3.2 No Prettier or formatting config — P2
**Problem:** Only ESLint with `next/core-web-vitals`. No Prettier config, no format script.  
**Impact:** Inconsistent formatting across contributors (e.g., some lines use single quotes, template strings vary).  
**Fix:** Add Prettier with a `.prettierrc` and `"format"` script.

#### 4.3.3 Database file committed to repo — P1
**File:** `rulesgenie.db`, `rulesgenie.db-shm`, `rulesgenie.db-wal`  
**Problem:** The SQLite database and WAL files are tracked in git. The `.gitignore` should exclude `*.db*` files.  
**Impact:** Merge conflicts, stale data in clones, potential PII leakage if real user data is stored.  
**Fix:** Add `*.db` and `*.db-*` to `.gitignore` and remove from tracking.

#### 4.3.4 `db.ts` seeds on every import — P2
**File:** `src/lib/db.ts:48-49`  
**Problem:** `initializeDatabase()` and `seedDatabase()` run unconditionally at module load. While `CREATE TABLE IF NOT EXISTS` and `ON CONFLICT` make this idempotent, it's unnecessary work on every server restart in production.  
**Impact:** Slows cold starts; confusing for developers who expect explicit migration commands.  
**Fix:** Gate seeding behind an env check or a migration script. At minimum, add a comment explaining the intentional idempotent-seed pattern.

#### 4.3.5 Large data files would benefit from extraction — P2
**Files:** `src/data/games.ts`, `src/data/mock-qa.ts`  
**Problem:** `games.ts` contains 20 full game records inline (~800 lines). `mock-qa.ts` contains all mock Q&A pairs. These are effectively static data, not code.  
**Impact:** These files are hard to review, diff, and maintain. Adding a new game means editing a 800-line TypeScript file.  
**Fix:** Consider JSON/YAML data files loaded at build time, or a seed script that populates from a separate data source.

---

## 5. Performance Assessment

| Area | Status | Notes |
|---|---|---|
| **Server components** | ✅ Good | Pages (`page.tsx`) are server components; client components are properly marked with `'use client'`. |
| **Data fetching** | ✅ Good | Synchronous SQLite reads in server components — fast and appropriate for MVP. |
| **Bundle size** | ✅ Good | Dependencies are minimal: `lucide-react`, `clsx`, `tailwind-merge`, `zod`, `openai`. No bloated component libraries. |
| **Image optimization** | ⚠️ N/A | SVG data URIs bypass Next.js Image optimization. `unoptimized` prop is set on `GameCover`. |
| **Client-side re-renders** | ⚠️ Minor | `useMemo` is used appropriately in `LibraryBrowser` and `ChatInterface`. However, `DashboardClient` creates a new `addableGames` array on every render when collection changes — acceptable at 20 games, problematic at 200. |
| **API response size** | ⚠️ Minor | `/api/session` returns full conversation history every time. For long sessions, this could become large. Consider pagination. |

---

## 6. Quick Wins (< 1 day each)

| # | Task | Priority | Effort |
|---|---|---|---|
| 1 | Add Enter-key submission to chat textarea | P0 | 30 min |
| 2 | Add auto-scroll to bottom on new answer | P0 | 30 min |
| 3 | Reduce textarea height, add auto-resize | P0 | 45 min |
| 4 | Add `aria-live="polite"` to chat conversation area | P0 | 15 min |
| 5 | Add skip-to-content link in layout | P0 | 15 min |
| 6 | Render AI suggestions as clickable follow-up chips | P1 | 1 hour |
| 7 | Add "New session" button in chat sidebar | P1 | 1 hour |
| 8 | Add error feedback (toast/inline) for failed dashboard mutations | P1 | 1 hour |
| 9 | Pass `?q=` param from game detail example questions to chat | P1 | 45 min |
| 10 | Derive "20 supported games" from actual data | P2 | 10 min |
| 11 | Add `*.db*` to `.gitignore` | P1 | 5 min |
| 12 | Add `focus-visible` ring to all buttons and links | P0 | 1 hour |

---

## 7. Medium-Term Improvements (1–5 days)

| # | Task | Priority | Effort |
|---|---|---|---|
| 1 | Mobile hamburger menu for header navigation | P0 | 2–3 hours |
| 2 | Add Vitest + initial test suite for `ai.ts` scoring, `utils.ts`, and API routes | P1 | 1–2 days |
| 3 | Dark mode with Tailwind `dark:` classes | P2 | 1–2 days |
| 4 | Session expiry: warn after 30 min inactivity, offer to continue or restart | P1 | 3–4 hours |
| 5 | Edition/expansion selector in Q&A flow (FR-003 compliance) | P1 | 1 day |
| 6 | Pagination for game library (prepare for 200-game scale) | P2 | 4–6 hours |
| 7 | Add Prettier config + format-on-save | P2 | 1 hour |
| 8 | Streaming AI responses (show answer as it generates) | P2 | 1 day |
| 9 | Toast/notification system for async feedback (bookmark saved, feedback submitted) | P2 | 3–4 hours |
| 10 | Conditional "Demo mode" / "Live mode" badge based on actual config | P2 | 2 hours |

---

## 8. Long-Term Investments (1+ sprints)

| # | Task | Priority | Notes |
|---|---|---|---|
| 1 | **Externalize all UI strings** for i18n readiness | P1 | PRD explicitly requires this. Currently ~200 hardcoded strings across components. Use `next-intl` or similar. |
| 2 | **Admin source ingestion UI** (FR-007) | P1 | PRD Must-have. Even a basic file upload + status view would close this gap. |
| 3 | **Real image assets** for game covers | P2 | Replace SVG data URIs with actual thumbnails. Requires licensing consideration. |
| 4 | **Authentication system** | P1 | Mock auth is fine for demo, but the PRD expects account-based saved history. NextAuth.js or Clerk would integrate cleanly. |
| 5 | **Rate limiting** on API routes | P1 | PRD requires this for public beta. Currently zero protection against abuse. |
| 6 | **Observability & metrics** | P1 | PRD requires logging of request ID, latency, confidence, etc. Currently no instrumentation. |
| 7 | **Vector DB + RAG pipeline** | P1 | Current architecture uses mock Q&A matching and raw prompt context. PRD envisions proper retrieval-augmented generation with embeddings. |
| 8 | **E2E test suite** (Playwright) | P2 | Cover critical flows: game selection → Q&A → bookmark → dashboard. |

---

## 9. Visual Design & Consistency Assessment

### Strengths
- **Color system is excellent.** The `board-*` palette (`pine`, `forest`, `gold`, `canvas`, `mist`, `berry`) is distinctive, cohesive, and thematically appropriate. Tailwind config is clean.
- **Border radius language is consistent.** `rounded-[28px]`, `rounded-[32px]`, `rounded-3xl` — large, friendly radii throughout.
- **Card shadow `shadow-card`** is well-tuned: warm-toned, subtle, professional.
- **Typography pairing** (Inter body + Space Grotesk headings) works well.
- **Spacing system** is consistent (`space-y-8`, `gap-6`, `p-5/p-6`).

### Issues
- **Inconsistent border-radius tokens:** Mix of `rounded-[28px]`, `rounded-[32px]`, `rounded-[36px]`, `rounded-[40px]`, `rounded-2xl`, `rounded-3xl`, `rounded-full`. These should be standardized into named design tokens (e.g., `rounded-card`, `rounded-panel`, `rounded-pill`).
- **No hover/active states on primary CTA buttons.** The `bg-board-pine` buttons have no `hover:bg-board-pine/90` or `active:scale-[0.98]` transition. They feel static.
- **Disabled button style** (`disabled:bg-slate-300`) loses all brand identity. Consider `disabled:bg-board-pine/40` instead.

---

## 10. Comparison to Best Practices

| Practice | Status | Gap |
|---|---|---|
| Zero-config dev setup | ✅ Achieved | — |
| Type safety | ✅ Strong | Minor: `Record<string, unknown>` casts in `db.ts` could be tighter with `as const` assertions or generated types. |
| Component composition | ✅ Good | — |
| Semantic HTML | ⚠️ Partial | Chat uses `<div>` soup instead of `<article>`, `<section>`, `<form>`. No `<form>` wrapping the question submission. |
| Error boundaries | ✅ Present | `error.tsx` and `not-found.tsx` both exist and are well-designed. |
| Loading states | ⚠️ Basic | Global `loading.tsx` exists but has no animation. No per-component skeletons. |
| Test infrastructure | ❌ Missing | No test runner, no test files, no CI. |
| CI/CD pipeline | ❌ Missing | No GitHub Actions or equivalent. `npm run lint` exists but is manual. |
| API validation | ✅ Good | All API routes validate with Zod schemas. |
| Security headers | ❌ Missing | No CSP, no rate limiting, no CORS config in `next.config.js`. |

---

## 11. Summary Recommendations by Priority

### P0 (Ship-blocking for beta)
1. Enter-key chat submission
2. Auto-scroll to new answers
3. Mobile-friendly header navigation
4. Accessible focus indicators on all interactive elements
5. `aria-live` regions for dynamic content
6. Reduce chat textarea height

### P1 (Should fix before user testing)
7. Render AI suggestions as follow-up chips
8. New session / clear conversation button
9. Error feedback for failed mutations
10. Edition/expansion selector (PRD FR-003)
11. Test infrastructure (Vitest)
12. Remove DB files from git tracking
13. Session expiry handling

### P2 (Quality-of-life improvements)
14. Dark mode
15. Game library pagination
16. Streaming AI responses
17. Loading animations / skeletons
18. Hover/active states on buttons
19. Standardize border-radius tokens
20. Prettier / formatting config
