# UX Coverage Report — RulesGenie

## Summary

- **Audit setup:** reviewed `package.json`, all user-facing routes under `src/app/**/*`, the shared shell and interactive components under `src/components/**/*`, supporting helpers in `src/lib/ux.ts`, and the current regression suite in `tests/ux.test.ts`.
- **Instruction files:** no `AGENTS.md` or `CLAUDE.md` files exist inside `rules-genie/`, so this pass followed the repository state and the user brief directly.
- **Coverage snapshot:** the current product still covers the core MVP flows across home, ask, library, game detail, quick-start, dashboard, and the global shell (`src/app/page.tsx`, `src/app/ask/page.tsx`, `src/app/games/**/*`, `src/app/quick-start/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/layout.tsx`, `src/components/site-header.tsx`).
- **Baseline validation before changes:** `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` all passed in the starting state of this audit.
- **Actionable findings from this pass:** four meaningful UX gaps remain in the current codebase: ask-flow failures still dead-end without retry actions, stale shared links silently swap users into the first game, dashboard mutations lock the whole surface behind one pending state, and recovery states still lack route-aware refresh/context (`src/components/hooks/use-conversation.ts`, `src/components/conversation-thread.tsx`, `src/components/chat-interface.tsx`, `src/components/quick-start-explorer.tsx`, `src/components/dashboard-client.tsx`, `src/app/loading.tsx`, `src/app/games/[id]/page.tsx`, `src/app/games/[id]/not-found.tsx`).

## Phase 1 — Feature Inventory by domain

### 1. App shell, navigation, and recovery

- Root shell, metadata, skip link, and footer (`src/app/layout.tsx`)
- Desktop navigation and mobile drawer (`src/components/site-header.tsx`)
- Global loading, error, and 404 handling (`src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/games/[id]/not-found.tsx`)

### 2. Rules assistant

- `/ask` route with `?game=` and `?q=` deep links (`src/app/ask/page.tsx`)
- Game selection, session memory messaging, example prompts, and quick-start reminders (`src/components/chat-interface.tsx`)
- Conversation transcript, citations, confidence, bookmarks, and feedback (`src/components/conversation-thread.tsx`, `src/components/bookmark-toggle.tsx`, `src/components/feedback-controls.tsx`, `src/components/citation-list.tsx`)
- Question composer and submission shortcuts (`src/components/question-input.tsx`)
- Session persistence and ask API (`src/components/hooks/use-conversation.ts`, `src/components/hooks/use-rules-session.ts`, `src/app/api/ask/route.ts`, `src/app/api/session/route.ts`)

### 3. Discovery and game detail

- Homepage hero, feature teasers, and featured catalog (`src/app/page.tsx`, `src/components/feature-card.tsx`, `src/components/game-card.tsx`)
- Searchable/filterable library (`src/app/games/page.tsx`, `src/components/library-browser.tsx`)
- Game detail pages with mechanics, highlights, quick-start summary, example questions, and collection actions (`src/app/games/[id]/page.tsx`, `src/components/collection-toggle.tsx`)

### 4. Quick-start and teaching

- `/quick-start` route and deep-link selection (`src/app/quick-start/page.tsx`, `src/components/quick-start-explorer.tsx`)
- Cross-links back into ask/detail flows (`src/components/quick-start-explorer.tsx`, `src/app/games/[id]/page.tsx`)

### 5. Dashboard, persistence, and platform safety nets

- Dashboard profile, collection, recent questions, and saved answers (`src/app/dashboard/page.tsx`, `src/components/dashboard-client.tsx`)
- Collection/bookmark mutation endpoints (`src/app/api/collection/route.ts`, `src/app/api/bookmarks/route.ts`)
- Runtime flags plus current helper-level regression coverage (`src/lib/ux.ts`, `tests/ux.test.ts`, `src/app/api/health/route.ts`)

## Phase 2 — UI Coverage table

| Surface | Domain | Status | Concrete coverage |
| --- | --- | --- | --- |
| Global shell, skip link, footer | App shell | [COVERED] | `src/app/layout.tsx` provides the shared shell, skip link, and mode-aware footer copy. |
| Desktop and mobile navigation | App shell | [COVERED] | `src/components/site-header.tsx` exposes active-route context, a close affordance, and focus management for the drawer. |
| Global loading and general 404/error routes | App shell | [PARTIAL] | `src/app/loading.tsx`, `src/app/error.tsx`, and `src/app/not-found.tsx` provide escape hatches, but `src/app/loading.tsx` still lacks a direct refresh action. |
| Homepage entry flow | Discovery | [COVERED] | `src/app/page.tsx` links directly into `/ask` and `/games`, with live/demo mode surfaced via `src/lib/ux.ts`. |
| Library search and filters | Discovery | [COVERED] | `src/components/library-browser.tsx` exposes search, filters, active chips, result summary, and reset controls. |
| Game detail CTA flow | Discovery | [PARTIAL] | `src/app/games/[id]/page.tsx` links back into `/ask`, `/quick-start`, and collection management, but missing-game recovery still drops to a generic fallback. |
| Ask route deep links | Rules assistant | [PARTIAL] | `src/app/ask/page.tsx` and `src/components/chat-interface.tsx` accept `?game=` links, but stale game ids still silently open the first catalog title. |
| Conversation recovery | Rules assistant | [PARTIAL] | `src/components/hooks/use-conversation.ts` sets load/ask errors, yet `src/components/conversation-thread.tsx` only renders the message with no retry action. |
| Bookmarking and answer feedback | Rules assistant | [COVERED] | `src/components/bookmark-toggle.tsx` and `src/components/feedback-controls.tsx` provide visible mutation feedback in the thread. |
| Quick-start deep links | Quick-start | [PARTIAL] | `src/components/quick-start-explorer.tsx` warns when a deep link is stale, but still opens the first supported game automatically. |
| Dashboard collection and saved answers | Dashboard | [PARTIAL] | `src/components/dashboard-client.tsx` now has success/error feedback, but one shared transition state still blocks all collection and bookmark controls together. |
| Regression safety net | Platform | [PARTIAL] | `tests/ux.test.ts` covers helper logic in `src/lib/ux.ts`, but does not yet lock the new recovery flows or pending-state rules. |

## Phase 3 — UX Quality severities

| Severity | Finding | Evidence | User impact |
| --- | --- | --- | --- |
| High | Ask-flow failures still strand the player after a failed history load or answer request. | `src/components/hooks/use-conversation.ts` records history-load and answer errors, but `src/components/conversation-thread.tsx` renders only a passive alert with no retry affordance. | Mid-game players can lose momentum and must manually retype or refresh instead of recovering in place. |
| High | Invalid shared ask/quick-start links silently switch users into the first supported game. | `src/components/chat-interface.tsx` and `src/components/quick-start-explorer.tsx` both call `resolveRequestedGameId(...)`, then immediately open `games[0]` when the requested id is missing. | A stale shared link can put someone into the wrong rules context without an explicit choice, which undermines trust in the answer surface. |
| Medium | Dashboard actions still use one global pending state. | `src/components/dashboard-client.tsx` shares a single `useTransition()` state across adding a game, removing a collection entry, and removing a bookmark. | One slow request freezes unrelated controls, making the dashboard feel stuck and raising the cost of recovery if a request hangs. |
| Medium | Recovery states still miss route-aware refresh/context. | `src/app/loading.tsx` offers alternate links but no direct reload option, and `src/app/games/[id]/page.tsx` still relies on the generic `src/app/games/[id]/not-found.tsx` fallback for missing titles. | Slow or stale routes produce avoidable context loss when users most need a fast way back to the current task. |

## Phase 4 — Remediation Plan with effort

| Remediation | Effort | Target paths | Status |
| --- | --- | --- | --- |
| Add explicit retry actions for conversation history and failed answer requests. | S | `src/components/hooks/use-conversation.ts`, `src/components/conversation-thread.tsx`, `src/components/chat-interface.tsx`, `tests/ux.test.ts` | Done |
| Stop auto-selecting the first game when a shared ask/quick-start link is stale; require an explicit recovery choice. | S | `src/lib/ux.ts`, `src/components/chat-interface.tsx`, `src/components/quick-start-explorer.tsx`, `tests/ux.test.ts` | Done |
| Scope dashboard pending states per action so one mutation does not freeze the whole dashboard. | S | `src/components/dashboard-client.tsx`, `src/lib/ux.ts`, `tests/ux.test.ts` | Done |
| Strengthen route-aware recovery for slow loads and missing game detail pages. | S | `src/app/loading.tsx`, `src/app/games/[id]/page.tsx`, `src/app/games/[id]/not-found.tsx`, `src/lib/ux.ts`, `tests/ux.test.ts` | Done |

## Phase 5 — Priority Stack Rank

### Quick wins

| Rank | Item | Effort | Why it is prioritized |
| --- | --- | --- | --- |
| 1 | Add ask-flow retry actions | S | It removes the most acute dead end from the core product loop and protects mid-game usage. |
| 2 | Fix stale shared-link selection | S | It restores trust in shared entry points by preventing silent game swaps. |
| 3 | Split dashboard pending states | S | It improves perceived responsiveness across a high-value return surface without backend changes. |
| 4 | Strengthen route-aware recovery | S | It keeps players closer to their current task when a route is slow or a link is stale. |

### Full stack rank

1. Add ask-flow retry actions (`src/components/hooks/use-conversation.ts`, `src/components/conversation-thread.tsx`, `src/components/chat-interface.tsx`)
2. Fix stale shared-link selection (`src/lib/ux.ts`, `src/components/chat-interface.tsx`, `src/components/quick-start-explorer.tsx`)
3. Split dashboard pending states (`src/components/dashboard-client.tsx`, `src/lib/ux.ts`)
4. Strengthen route-aware recovery (`src/app/loading.tsx`, `src/app/games/[id]/page.tsx`, `src/app/games/[id]/not-found.tsx`)

## Implementation Status

- Added explicit retry actions for conversation history and failed answer requests, plus helper coverage for the new recovery copy (`src/components/hooks/use-conversation.ts`, `src/components/conversation-thread.tsx`, `src/components/chat-interface.tsx`, `src/lib/ux.ts`, `tests/ux.test.ts`).
- Stopped stale ask and quick-start links from silently defaulting to the first catalog title by requiring an explicit supported-game pick (`src/lib/ux.ts`, `src/components/chat-interface.tsx`, `src/components/quick-start-explorer.tsx`, `src/components/hooks/use-rules-session.ts`, `tests/ux.test.ts`).
- Scoped dashboard pending states per action so add/remove flows no longer freeze unrelated controls (`src/components/dashboard-client.tsx`, `src/lib/ux.ts`, `tests/ux.test.ts`).
- Added a route-aware refresh action to the global loading screen and contextual missing-game recovery paths that keep users inside the main ask/library/quick-start flows (`src/components/refresh-page-button.tsx`, `src/app/loading.tsx`, `src/app/games/[id]/page.tsx`, `src/app/games/[id]/not-found.tsx`, `src/lib/ux.ts`, `tests/ux.test.ts`).
- Final validation passed: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
