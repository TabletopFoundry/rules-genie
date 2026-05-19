# UI Coverage Audit — RulesGenie

## Summary
- **Scope reviewed:** primary Next.js product UI under `src/app/**/*`, supporting client components under `src/components/**/*`, internal routes under `src/app/api/**/*`, middleware in `src/middleware.ts`, and the separate Docusaurus docs site under `website/**/*`.
- **Packages discovered:** root app (`package.json`) and docs site (`website/package.json`). No `AGENTS.md` or `CLAUDE.md` files were present in `rules-genie`.
- **Baseline checks:** `npm run lint`, `npm run typecheck`, and `npm run build` pass. `npm run validate` currently fails on a pre-existing repo-wide Prettier check before it reaches build.
- **Coverage snapshot:** 24 features reviewed → 13 `[COVERED]`, 8 `[PARTIAL]`, 0 `[MISSING]` inside the primary app shell, and 3 `[HIDDEN]` internal or out-of-band surfaces.
- **Highest-value UX gaps:** silent deep-link fallbacks on `/ask` and `/quick-start`, low mode/session clarity in `src/components/chat-interface.tsx`, weak filter recovery in `src/components/library-browser.tsx`, limited next-step guidance in `src/components/dashboard-client.tsx`, and silent feedback capture in `src/components/feedback-controls.tsx`.

## Phase 1 — Feature Inventory

### App shell & navigation
- Global layout, sticky shell, footer, and skip link (`src/app/layout.tsx`)
- Desktop navigation and mobile drawer with focus trap (`src/components/site-header.tsx`)
- Global loading, error, and not-found recovery states (`src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/games/[id]/not-found.tsx`)

### Home & discovery
- Hero value proposition and primary CTAs (`src/app/page.tsx`)
- Feature teaser cards (`src/components/feature-card.tsx`)
- Featured catalog previews (`src/app/page.tsx`, `src/components/game-card.tsx`)
- Searchable/filterable game library (`src/app/games/page.tsx`, `src/components/library-browser.tsx`)
- Game detail profiles with mechanics, highlights, and example prompts (`src/app/games/[id]/page.tsx`)

### Rules assistant
- Ask page entry with optional `?game=` and `?q=` deep links (`src/app/ask/page.tsx`)
- Game picker, example prompts, and quick-start reminders (`src/components/chat-interface.tsx`)
- Local per-game session memory (`src/components/hooks/use-rules-session.ts`, `src/components/hooks/use-conversation.ts`)
- Conversation transcript, citations, confidence pill, follow-up suggestions, and error/loading feedback (`src/components/conversation-thread.tsx`, `src/components/citation-list.tsx`, `src/components/status-pill.tsx`)
- Question composer and submit shortcuts (`src/components/question-input.tsx`)
- Answer bookmarking and answer feedback controls (`src/components/bookmark-toggle.tsx`, `src/components/feedback-controls.tsx`)

### Quick-start & teach mode
- Quick-start route with optional `?game=` deep links (`src/app/quick-start/page.tsx`)
- Game selector, 60-second summary, setup guide, and cross-links back to ask/detail (`src/components/quick-start-explorer.tsx`)

### Dashboard & persistence
- Profile/totals summary (`src/app/dashboard/page.tsx`, `src/components/dashboard-client.tsx`)
- Collection management (`src/components/dashboard-client.tsx`, `src/components/collection-toggle.tsx`)
- Recent question history (`src/components/dashboard-client.tsx`)
- Saved answer revisit/removal flow (`src/components/dashboard-client.tsx`)

### Platform, configuration, and documentation surfaces
- Demo/live mode switching via environment and AI pipeline (`src/lib/ai/index.ts`, `.env.example`)
- Health endpoint (`src/app/api/health/route.ts`)
- CSRF protection on mutation routes (`src/middleware.ts`)
- Separate docs website (`website/src/pages/index.tsx`, `website/docs/**/*`)

## Phase 2 — UI Coverage Mapping

| # | Feature | Domain | UI Status | Notes |
|---|---|---|---|---|
| 1 | Global layout, footer, skip link | App shell | [COVERED] | `src/app/layout.tsx` provides a consistent shell, skip link, and footer copy across routes. |
| 2 | Desktop and mobile navigation | App shell | [COVERED] | `src/components/site-header.tsx` covers active links, mobile drawer open/close, and focus trapping. |
| 3 | Global loading, error, and 404 recovery | App shell | [COVERED] | `src/app/loading.tsx`, `src/app/error.tsx`, and `src/app/not-found.tsx` provide clear fallback states. |
| 4 | Homepage hero and primary CTAs | Discovery | [COVERED] | `src/app/page.tsx` sends users directly to `/ask` and `/games`. |
| 5 | Featured catalog previews | Discovery | [COVERED] | `src/app/page.tsx` + `src/components/game-card.tsx` expose rich entry points to details and the assistant. |
| 6 | Library search and filters | Discovery | [PARTIAL] | `src/components/library-browser.tsx` filters correctly, but active constraints are invisible and there is no quick reset path. |
| 7 | Game detail profiles | Discovery | [COVERED] | `src/app/games/[id]/page.tsx` includes metadata, mechanics, highlights, and deep links to ask/quick-start. |
| 8 | Quick-start route deep links | Quick-start | [PARTIAL] | `src/app/quick-start/page.tsx` accepts `?game=`, but `src/components/quick-start-explorer.tsx` does not explain or safely normalize invalid IDs in the UI. |
| 9 | Ask route deep links | Rules assistant | [PARTIAL] | `src/app/ask/page.tsx` accepts `?game=` and `?q=`, but `src/components/chat-interface.tsx` silently falls back when the game is unsupported. |
| 10 | Game picker and example prompts | Rules assistant | [COVERED] | `src/components/chat-interface.tsx` supports game switching and one-click prompts. |
| 11 | Per-game local session memory | Rules assistant | [PARTIAL] | `src/components/hooks/use-rules-session.ts` works, but `src/components/chat-interface.tsx` does not explain that history is local-per-device and per-game. |
| 12 | Conversation transcript, confidence, citations | Rules assistant | [COVERED] | `src/components/conversation-thread.tsx`, `src/components/status-pill.tsx`, and `src/components/citation-list.tsx` clearly render answer evidence. |
| 13 | Follow-up suggestions | Rules assistant | [COVERED] | `src/components/conversation-thread.tsx` exposes clickable next questions after an answer. |
| 14 | Bookmark answer flow | Rules assistant | [COVERED] | `src/components/bookmark-toggle.tsx` exposes clear saved/not-saved states and error messaging. |
| 15 | Feedback on answers | Rules assistant | [PARTIAL] | `src/components/feedback-controls.tsx` records ratings, but success is silent and the reason picker is always visible. |
| 16 | Question composer shortcuts | Rules assistant | [COVERED] | `src/components/question-input.tsx` supports Enter submit and Shift+Enter for line breaks. |
| 17 | Assistant mode visibility | Rules assistant | [PARTIAL] | `src/components/chat-interface.tsx` shows a small mode pill, but it only reflects the last answer and does not explain live vs demo vs fallback behavior. |
| 18 | Profile and totals summary | Dashboard | [COVERED] | `src/components/dashboard-client.tsx` surfaces collection, recent questions, and saved-answer counts clearly. |
| 19 | Collection management | Dashboard | [COVERED] | `src/components/dashboard-client.tsx` lets users add/remove games and jump back into the assistant. |
| 20 | Recent questions re-entry | Dashboard | [PARTIAL] | `src/components/dashboard-client.tsx` lists recent rulings, but recovery paths are limited to a single text link with little next-step guidance. |
| 21 | Saved answers revisit/removal | Dashboard | [PARTIAL] | `src/components/dashboard-client.tsx` shows bookmarks and removal, but offers weak onward navigation back into ask/quick-start flows. |
| 22 | Health endpoint | Platform | [HIDDEN] | `src/app/api/health/route.ts` exists for operators, not normal users, and has no in-app entry point. |
| 23 | CSRF guard | Platform | [HIDDEN] | `src/middleware.ts` protects mutations, but the behavior is intentionally invisible in the UI. |
| 24 | Documentation website | Documentation | [HIDDEN] | `website/src/pages/index.tsx` and `website/docs/**/*` provide a secondary docs UX that is not linked from the main product shell. |

## Phase 3 — UX Quality Assessment

**#1 — Ask deep links and invalid game fallback** `[MAJOR]`
- **Criterion:** Edge cases, Feedback
- **Problem:** `src/components/chat-interface.tsx` silently swaps an unsupported `?game=` value for the first catalog entry. Shared links can land on the wrong game while `?q=` still auto-runs against the fallback title.
- **Location:** `src/app/ask/page.tsx`, `src/components/chat-interface.tsx`

**#2 — Quick-start deep-link normalization** `[MAJOR]`
- **Criterion:** Consistency, Edge cases
- **Problem:** `src/components/quick-start-explorer.tsx` accepts `initialGameId` without visibly reconciling invalid values. That creates a mismatch between the rendered content and the controlled selector state for broken shared links.
- **Location:** `src/app/quick-start/page.tsx`, `src/components/quick-start-explorer.tsx`

**#3 — Assistant mode and local-session clarity** `[MAJOR]`
- **Criterion:** Discoverability, Feedback
- **Problem:** `src/components/chat-interface.tsx` shows only a compact pill for the last answer mode. Users are not told whether the assistant is currently ready for live mode, what fallback means, or that the conversation history is scoped to the current device and game.
- **Location:** `src/components/chat-interface.tsx`, `src/components/hooks/use-rules-session.ts`

**#4 — Library filter recovery** `[MAJOR]`
- **Criterion:** Discoverability, Feedback, Accessibility
- **Problem:** `src/components/library-browser.tsx` exposes search and two filters, but active constraints are not summarized anywhere, the result count does not explain why the list changed, and the empty state offers no one-click reset.
- **Location:** `src/components/library-browser.tsx`, `src/app/games/page.tsx`

**#5 — Dashboard next-step guidance** `[MAJOR]`
- **Criterion:** Discoverability, Consistency
- **Problem:** `src/components/dashboard-client.tsx` is rich in stored data but light on action-oriented guidance. Recent questions and saved answers do not consistently point users back into `/ask`, `/quick-start`, or `/games` with clear next steps.
- **Location:** `src/components/dashboard-client.tsx`, `src/app/dashboard/page.tsx`

**#6 — Feedback capture confirmation** `[MAJOR]`
- **Criterion:** Feedback, Accessibility
- **Problem:** `src/components/feedback-controls.tsx` leaves the reason selector onscreen even when no downvote is active and provides no positive confirmation after a rating is stored. Users can submit feedback without knowing whether the action succeeded.
- **Location:** `src/components/feedback-controls.tsx`, `src/app/api/feedback/route.ts`

## Phase 4 — Remediation Plan

**Remediation #1** `[S]`
Validate requested game IDs on `/ask` and `/quick-start`, normalize the controlled selectors, and add visible fallback notices with recovery links back to `src/app/games/page.tsx`.
- **Implementation target:** `src/components/chat-interface.tsx`, `src/components/quick-start-explorer.tsx`, `src/app/ask/page.tsx`

**Remediation #2** `[S]`
Add an explicit assistant context block on `/ask` that explains current mode (demo/live/fallback), what fallback means, and how local per-game session memory behaves.
- **Implementation target:** `src/components/chat-interface.tsx`, `src/app/ask/page.tsx`

**Remediation #3** `[S]`
Upgrade the game library filters with active-filter chips, reset actions, and a no-results recovery CTA so users can understand and undo narrowed states quickly.
- **Implementation target:** `src/components/library-browser.tsx`

**Remediation #4** `[S]`
Strengthen dashboard guidance with visible quick-action links plus clearer re-entry paths from recent questions and saved answers back into `/ask`, `/quick-start`, and `/games`.
- **Implementation target:** `src/components/dashboard-client.tsx`, `src/app/dashboard/page.tsx`

**Remediation #5** `[XS]`
Make answer feedback progressive: only ask for a reason when a downvote is active (or an existing reason exists), parse the API success payload, and show a visible confirmation after submission.
- **Implementation target:** `src/components/feedback-controls.tsx`, `src/lib/api-schemas.ts`

**Remediation #6** `[S]`
Add automated coverage for the new deep-link, mode-description, and library-filter logic so future refactors do not regress these UX fixes.
- **Implementation target:** `src/lib/ux.ts`, `tests/ux.test.ts`, `package.json`

## Phase 5 — Priority Stack Rank

### Quick Wins

| Rank | Remediation | Severity | Effort | Impact | Primary target |
|---|---|---|---|---|---|
| 1 | Validate ask/quick-start deep links and show fallback notices | [MAJOR] | [S] | Prevents wrong-game landings from shared URLs | `src/components/chat-interface.tsx`, `src/components/quick-start-explorer.tsx` |
| 2 | Upgrade library filter recovery | [MAJOR] | [S] | Restores discovery when search/filter combinations dead-end | `src/components/library-browser.tsx` |
| 3 | Clarify assistant mode and local-session behavior | [MAJOR] | [S] | Explains demo/live/fallback behavior before trust breaks | `src/components/chat-interface.tsx` |
| 4 | Improve dashboard next-step guidance | [MAJOR] | [S] | Turns passive history screens into active launch points | `src/components/dashboard-client.tsx` |
| 5 | Make feedback capture progressive and confirm success | [MAJOR] | [XS] | Removes uncertainty from the answer-rating flow | `src/components/feedback-controls.tsx` |

### Full Stack Rank

| Rank | Remediation | Severity | Effort | Why it sits here |
|---|---|---|---|---|
| 1 | Validate ask/quick-start deep links and show fallback notices | [MAJOR] | [S] | Broken shared links can misroute users into the wrong game context with no warning. |
| 2 | Upgrade library filter recovery | [MAJOR] | [S] | The library is the main discovery surface after the homepage, and its failure mode is currently silent. |
| 3 | Clarify assistant mode and local-session behavior | [MAJOR] | [S] | Trust drops quickly when users cannot tell whether live answers, fallback answers, or local history rules are active. |
| 4 | Improve dashboard next-step guidance | [MAJOR] | [S] | Dashboard value increases when stored content becomes an easy launchpad back into the core ask/teach flows. |
| 5 | Make feedback capture progressive and confirm success | [MAJOR] | [XS] | Small implementation, but it fixes an otherwise silent submission flow. |
| 6 | Add automated coverage for new UX rules | [MINOR] | [S] | Lower direct user impact, but it keeps the new routing/filter behavior from regressing. |

## Implemented vs Deferred
- **Implemented:** _Pending Phase B implementation._
- **Deferred:** _None yet._
