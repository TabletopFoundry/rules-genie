# UX Coverage Report — RulesGenie

## Summary

- **Audit setup:** reviewed the current user-facing routes in `src/app/**/*`, shared UI in `src/components/**/*`, helper logic in `src/lib/ux.ts`, and the regression suite in `tests/ux.test.ts`.
- **Instruction files:** no `AGENTS.md` or `CLAUDE.md` files exist inside `rules-genie/`, so this pass followed the repository state and the user brief directly.
- **Baseline validation before changes:** `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` all passed before this pass started.
- **Coverage snapshot:** the MVP still covers the home, ask, library, detail, quick-start, dashboard, and recovery flows (`src/app/page.tsx`, `src/app/ask/page.tsx`, `src/app/games/**/*`, `src/app/quick-start/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/loading.tsx`, `src/app/error.tsx`).
- **Fresh findings from this pass:** four UX gaps remain in the current build: the ask surface briefly shows the wrong game's history while the selected game changes, ask/quick-start selection state is not reflected back into the URL, players cannot cancel an in-flight rules request, and the dashboard add flow dead-ends once every supported game is already saved (`src/components/chat-interface.tsx`, `src/components/hooks/use-conversation.ts`, `src/components/hooks/use-rules-session.ts`, `src/components/quick-start-explorer.tsx`, `src/components/question-input.tsx`, `src/components/dashboard-client.tsx`).

## Phase 1 — Feature inventory by domain

### 1. App shell, navigation, and recovery

- Shared layout, metadata, skip link, and footer (`src/app/layout.tsx`)
- Desktop navigation and mobile drawer (`src/components/site-header.tsx`)
- Loading, error, and 404 recovery surfaces (`src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/games/[id]/not-found.tsx`)

### 2. Rules assistant

- `/ask` route with `?game=` and `?q=` entry points (`src/app/ask/page.tsx`)
- Assistant shell, game selection, local session messaging, and example prompts (`src/components/chat-interface.tsx`)
- Conversation transcript, citations, bookmarks, and answer feedback (`src/components/conversation-thread.tsx`, `src/components/citation-list.tsx`, `src/components/bookmark-toggle.tsx`, `src/components/feedback-controls.tsx`)
- Composer, submit shortcut, and loading state (`src/components/question-input.tsx`)
- Session hydration and ask/history requests (`src/components/hooks/use-conversation.ts`, `src/components/hooks/use-rules-session.ts`, `src/app/api/ask/route.ts`, `src/app/api/session/route.ts`)

### 3. Discovery and game detail

- Home hero, feature cards, and featured titles (`src/app/page.tsx`, `src/components/feature-card.tsx`, `src/components/game-card.tsx`)
- Searchable library with collection entry points (`src/app/games/page.tsx`, `src/components/library-browser.tsx`, `src/components/collection-toggle.tsx`)
- Game detail surfaces with quick-start and ask CTAs (`src/app/games/[id]/page.tsx`)

### 4. Quick-start and teaching

- `/quick-start` route and shared-link selection (`src/app/quick-start/page.tsx`, `src/components/quick-start-explorer.tsx`)
- Teaching summary, setup guide, and cross-links back to ask/detail flows (`src/components/quick-start-explorer.tsx`, `src/app/games/[id]/page.tsx`)

### 5. Dashboard, persistence, and safety nets

- Dashboard profile, collection, recent questions, and bookmarks (`src/app/dashboard/page.tsx`, `src/components/dashboard-client.tsx`)
- Bookmark/collection persistence endpoints (`src/app/api/bookmarks/route.ts`, `src/app/api/collection/route.ts`)
- Helper-level UX copy and regression coverage (`src/lib/ux.ts`, `tests/ux.test.ts`)

## Phase 2 — UI coverage table

| Surface | Domain | Status | Concrete coverage |
| --- | --- | --- | --- |
| Global shell and recovery scaffolding | App shell | [COVERED] | `src/app/layout.tsx`, `src/app/loading.tsx`, `src/app/error.tsx`, and `src/app/not-found.tsx` provide the shared shell plus loading/error/404 recovery paths. |
| Desktop/mobile navigation | App shell | [COVERED] | `src/components/site-header.tsx` includes active-route state, a mobile drawer, escape handling, and focus trapping. |
| Home and library discovery | Discovery | [COVERED] | `src/app/page.tsx`, `src/app/games/page.tsx`, and `src/components/library-browser.tsx` cover the entry flow, browsing, filters, and reset states. |
| Game detail flow | Discovery | [COVERED] | `src/app/games/[id]/page.tsx` provides quick-start, ask, and collection CTAs with mechanics/highlights/setup content. |
| Ask route deep links | Rules assistant | [PARTIAL] | `src/app/ask/page.tsx` accepts `?game=` and `?q=`, but `src/components/chat-interface.tsx` does not write the current selection back to the URL or clear consumed question params. |
| Ask conversation state | Rules assistant | [PARTIAL] | `src/components/hooks/use-conversation.ts` and `src/components/hooks/use-rules-session.ts` hydrate local history, but the thread is not cleared immediately when the selected game changes. |
| Ask request control | Rules assistant | [PARTIAL] | `src/components/question-input.tsx` only exposes submit while `src/components/hooks/use-conversation.ts` keeps an internal abort path that the player cannot trigger. |
| Quick-start shared selection | Quick-start | [PARTIAL] | `src/components/quick-start-explorer.tsx` lets players change the supported game locally, but the URL stays frozen on the initial state. |
| Dashboard collection management | Dashboard | [PARTIAL] | `src/components/dashboard-client.tsx` supports add/remove flows, but the add section gives no explanation once `addableGames` is empty. |
| Regression safety net | Platform | [PARTIAL] | `tests/ux.test.ts` covers helper copy in `src/lib/ux.ts`, but does not yet lock the new URL-state and collection-availability helpers needed for this pass. |

## Phase 3 — UX quality severities

| Severity | Finding | Evidence | User impact |
| --- | --- | --- | --- |
| High | Switching games in the ask flow can momentarily show the previous game's rulings under the new heading. | `src/components/chat-interface.tsx` swaps `selectedGame` immediately, while `src/components/hooks/use-rules-session.ts` updates `sessionId` in an effect and `src/components/hooks/use-conversation.ts` keeps prior `history`/`suggestions` until the new load completes. | Players can read or act on the wrong rules context during the exact moment they are trying to pivot to another title. |
| High | Ask and quick-start state is not shareable/persistent once the player changes the selected game, and deep-linked ask prompts can replay on refresh. | `src/components/chat-interface.tsx` and `src/components/quick-start-explorer.tsx` keep selection in local state only, and `src/components/chat-interface.tsx` never clears the one-time `q` param after it has been consumed. | Refreshing, copying the URL, or using back/forward can reopen the wrong game or rerun a stale question. |
| Medium | Players cannot stop a slow ask request even though the data layer already supports aborting it. | `src/components/hooks/use-conversation.ts` has `abortPendingAsk()`/`cancelPendingAsk()`, but `src/components/question-input.tsx` only renders a disabled submit state during loading. | Mid-game users are forced to wait for the timeout instead of bailing out and trying a shorter or better-scoped question. |
| Medium | The dashboard add flow becomes a silent dead end after every supported title is already saved. | `src/components/dashboard-client.tsx` always renders the add-game select/button, even when `addableGames.length === 0`, which leaves only the placeholder option and a disabled action. | Returning users get no confirmation that the collection is already complete and no next step from that section. |

## Phase 4 — Remediation plan with effort

| Remediation | Effort | Target paths | Status |
| --- | --- | --- | --- |
| Reset/scoped ask conversation state as soon as the selected game changes. | S | `src/components/chat-interface.tsx`, `src/components/hooks/use-conversation.ts`, `src/components/hooks/use-rules-session.ts` | Pending |
| Sync ask and quick-start game selection back into the URL and clear stale ask prompt params after use. | S | `src/components/chat-interface.tsx`, `src/components/quick-start-explorer.tsx`, `src/lib/ux.ts`, `tests/ux.test.ts` | Pending |
| Expose a visible cancel control for in-flight ask requests. | S | `src/components/question-input.tsx`, `src/components/hooks/use-conversation.ts` | Pending |
| Add explicit guidance when the dashboard collection already contains every supported game. | S | `src/components/dashboard-client.tsx`, `src/lib/ux.ts`, `tests/ux.test.ts` | Pending |

## Phase 5 — Priority stack rank

### Quick wins

| Rank | Item | Effort | Why it is prioritized |
| --- | --- | --- | --- |
| 1 | Scope conversation state on game switch | S | It removes the highest-risk wrong-context failure from the core ask workflow. |
| 2 | Sync URL state for ask and quick-start | S | It restores trustworthy refresh/share behavior across the most-used entry points. |
| 3 | Add ask-request cancellation | S | It gives players an immediate escape hatch when a slow answer is blocking play. |
| 4 | Explain the full-collection dashboard state | S | It removes a small but visible dead end on a repeat-visit surface. |

### Full stack rank

1. Scope conversation state on ask game switch (`src/components/chat-interface.tsx`, `src/components/hooks/use-conversation.ts`, `src/components/hooks/use-rules-session.ts`)
2. Sync ask and quick-start URL state (`src/components/chat-interface.tsx`, `src/components/quick-start-explorer.tsx`, `src/lib/ux.ts`)
3. Add ask-request cancellation (`src/components/question-input.tsx`, `src/components/hooks/use-conversation.ts`)
4. Explain the dashboard full-collection state (`src/components/dashboard-client.tsx`, `src/lib/ux.ts`)

## Implementation Status

- Pending — Scope conversation state on ask game switch.
- Pending — Sync ask and quick-start URL state.
- Pending — Add ask-request cancellation.
- Pending — Explain the dashboard full-collection state.
- Pending — Re-run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` after the remediations land.
