# UX & DX Review 5 — Fresh Audit (Round 5)

> **Reviewer:** Automated audit via codebase analysis  
> **Date:** 2025-01-XX  
> **Scope:** Genuinely new issues not documented or fixed in UX_REVIEW 1–4, CODE_REVIEW 1–2, or IMPROVEMENTS.md  
> **Method:** Full source read of every component, page, API route, hook, and utility

---

## Summary

RulesGenie has matured significantly across four prior review rounds. Core accessibility (skip link, focus trap, aria-pressed, aria-live regions), error handling (zod validation, user-safe API errors), and structural improvements (db/ai module splits, CSRF middleware) are all in good shape. This round surfaces **net-new issues** that earlier reviews either didn't catch or that were introduced by subsequent changes. The highest-impact gaps are: an unguarded `JSON.parse` in the OpenAI engine that will crash on malformed LLM output, a null-dereference risk in the dashboard DB module, missing `<label>` on the dashboard collection `<select>`, mobile overflow from a `min-w-[240px]` on the same select, and several conversation-thread accessibility omissions around answer landmarks and repeated "Remove" buttons lacking distinguishing context.

---

## P0 — Critical (must fix before production)

### P0-1: Unguarded `JSON.parse` of LLM output can crash the server

**File:** `src/lib/ai/openai-engine.ts:113`  
**Issue:** `AiAnswerSchema.safeParse(JSON.parse(raw))` — if the LLM returns syntactically invalid JSON (which happens in production with GPT models, especially under edge-case prompts), `JSON.parse()` throws a `SyntaxError` before `safeParse` ever runs. The outer `catch` block does handle it by falling back to mock, but the error type is generic — a JSON parse failure is conflated with network/API errors, making debugging harder.  
**More critically**, `completion.choices[0]?.message?.content` can return `undefined` when the model returns a refusal or an empty completion, and `?? '{}'` produces a valid but meaningless empty-object JSON that passes `JSON.parse` but then fails `AiAnswerSchema` (answer is required min-length 1). The fallback works, but the user sees "Demo mode" without any indication the AI was attempted and failed.  
**Fix:**
```ts
const raw = completion.choices[0]?.message?.content;
if (!raw) {
  console.warn('[RulesGenie] OpenAI returned empty content — falling back to mock.');
  return { ...answerWithMock(game, question), mode: 'fallback' };
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch (err) {
  console.error('[RulesGenie] OpenAI returned invalid JSON:', (err as Error).message);
  return { ...answerWithMock(game, question), mode: 'fallback' };
}

const result = AiAnswerSchema.safeParse(parsed);
```
**Why P0:** Server-side unhandled exceptions can crash the Node process in serverless environments and produce 500s with no retry logic.

---

### P0-2: Dashboard `getDashboardSnapshot` assumes `profile` row always exists

**File:** `src/lib/db/dashboard.ts:10-15`  
**Issue:** `db.prepare(...).get(userId) as { id, name, email, mode }` — `.get()` returns `undefined` when no row matches. The `as` cast silences this, and the caller will crash with `Cannot read properties of undefined (reading 'name')` if the demo user hasn't been seeded or if the userId is invalid.  
**Fix:** Add a null guard:
```ts
const profile = db.prepare('SELECT id, name, email, mode FROM users WHERE id = ?').get(userId);
if (!profile) {
  throw new Error(`User profile not found for id="${userId}". Has the database been seeded?`);
}
```
**Why P0:** This crashes the entire dashboard page with an opaque error. A missing seed after a fresh DB reset is a realistic scenario.

---

## P1 — High (significant UX/accessibility gap)

### P1-1: Dashboard "Add game" `<select>` has no accessible label

**File:** `src/components/dashboard-client.tsx:120`  
**Issue:** The `<select>` for adding a game to the collection has no `<label>`, `aria-label`, or `aria-labelledby`. Screen readers announce it as an unlabeled combobox. The nearby heading "Manage your collection" isn't programmatically associated.  
**Fix:** Add `aria-label="Choose a game to add to your collection"` to the `<select>`.

---

### P1-2: Dashboard `min-w-[240px]` on collection select causes horizontal overflow on narrow viewports

**File:** `src/components/dashboard-client.tsx:120`  
**Issue:** `min-w-[240px]` forces the select element to be at least 240px wide. On viewports < 360px (small phones, split-screen), this overflows its container. The parent uses `flex-col gap-3 sm:flex-row` but the min-width still applies in column mode.  
**Fix:** Replace `min-w-[240px]` with `w-full sm:min-w-[240px]` so it fills available width on mobile and only enforces minimum on larger screens.

---

### P1-3: Multiple "Remove" buttons in dashboard lack distinguishing context for screen readers

**File:** `src/components/dashboard-client.tsx:151, 197`  
**Issue:** Both the collection card "Remove" button and the bookmark "Remove" button render as generic `<button>Remove</button>` with no `aria-label` to identify *which* item is being removed. A screen reader user cycling through buttons hears "Remove, Remove, Remove…" with no way to distinguish targets.  
**Fix:** Add `aria-label={`Remove ${game.name} from collection`}` and `aria-label={`Remove bookmark for: ${item.question.slice(0, 60)}`}` respectively.

---

### P1-4: Chat sidebar is hidden below `xl` breakpoint with no alternative navigation

**File:** `src/components/chat-interface.tsx:84`  
**Issue:** The layout uses `xl:grid-cols-[320px_1fr]` — below `xl` (1280px), the sidebar stacks above the conversation. On medium screens (768px–1280px), the sidebar's game selector, session controls, and quick-start reminders push the actual conversation far below the fold. There's no collapsed/accordion treatment for the sidebar on tablet-sized screens.  
**Fix:** Consider collapsing the sidebar into a disclosure/accordion or a horizontal summary bar at `lg` breakpoint, keeping the full sidebar only for `xl+`.

---

### P1-5: `ChatInterface` returns `null` when no game is selected — blank screen with no user feedback

**File:** `src/components/chat-interface.tsx:79-81`  
**Issue:** If `selectedGame` is falsy (e.g., empty games array passed), the component returns `null`, rendering a completely blank page with no explanation. This is a silent failure.  
**Fix:** Return an empty-state message: "No supported games available. Check back later or contact support."

---

### P1-6: `QuickStartExplorer` returns `null` when no game — same silent blank page issue

**File:** `src/components/quick-start-explorer.tsx:13-15`  
**Issue:** Identical to P1-5. `return null` when `!selectedGame`.  
**Fix:** Return an informative empty state.

---

### P1-7: Conversation thread answers lack heading landmarks for screen reader navigation

**File:** `src/components/conversation-thread.tsx:32-49`  
**Issue:** Each Q&A pair is wrapped in `<article>` (good), but there's no heading element inside. Screen reader users navigating by headings (`h` key in NVDA/JAWS) can't jump between answers. The "Player asked" text is a `<p>` with decorative styling only.  
**Fix:** Add a visually-hidden heading per article, e.g.:
```tsx
<h4 className="sr-only">Question {index + 1}: {item.question.slice(0, 80)}</h4>
```

---

### P1-8: `FeatureCard` icon is not marked as decorative — announced by screen readers

**File:** `src/components/feature-card.tsx:6-7`  
**Issue:** The icon container renders a Lucide React icon but has no `aria-hidden="true"`. Screen readers may attempt to announce SVG internals. The title text is separate, so the icon is purely decorative.  
**Fix:** Wrap the icon div with `aria-hidden="true"`:
```tsx
<div className="..." aria-hidden="true">{icon}</div>
```

---

### P1-9: Mobile nav drawer has no backdrop overlay — users can interact with page content underneath

**File:** `src/components/site-header.tsx:100-126`  
**Issue:** The mobile menu renders inline below the header with no backdrop/overlay and no `inert` on the main content. Users can scroll and interact with page content while the menu is open, which is disorienting. The focus trap covers Tab cycling but not click/touch on background content.  
**Fix:** Add a semi-transparent backdrop overlay behind the nav drawer and set `inert` on `<main>` while the menu is open, or use a proper dialog/sheet pattern.

---

## P2 — Medium (polish & best-practice gaps)

### P2-1: No `aria-current="page"` on active nav links

**File:** `src/components/site-header.tsx:78-83`  
**Issue:** Nav links don't indicate which page is currently active. Screen readers and assistive tech have no way to convey current location. Visually, there's also no active-link styling.  
**Fix:** Use Next.js `usePathname()` to conditionally add `aria-current="page"` and a visual active state (e.g., `bg-board-mist text-board-pine`) to the matching link.

---

### P2-2: Hero `h1` is `text-5xl sm:text-6xl` — may overflow on very narrow screens

**File:** `src/app/page.tsx:32-34`  
**Issue:** At `text-5xl` (3rem / 48px), the hero heading "Stop flipping through rulebooks. Get the ruling in seconds." is ~50 characters. On 320px-wide screens, long words can overflow or cause awkward line breaks. There's no `text-balance` or `overflow-wrap: break-word`.  
**Fix:** Add `text-balance` (modern browsers) and `break-words` as fallback:
```tsx
className="... text-balance break-words"
```

---

### P2-3: Game detail sidebar uses fixed `360px` column width — can crowd content on `lg` breakpoint

**File:** `src/app/games/[id]/page.tsx:40`  
**Issue:** `lg:grid-cols-[360px_1fr]` starts at 1024px. The game cover gets 360px, leaving only ~620px for the detail content (minus padding). On 1024px exactly, the detail column is cramped.  
**Fix:** Use a proportional column like `lg:grid-cols-[minmax(280px,360px)_1fr]` or reduce the fixed size at `lg`.

---

### P2-4: `quick-start-explorer.tsx` ordered lists use visual step numbers but `<li>` elements lack `value` attribute

**File:** `src/components/quick-start-explorer.tsx:58-64`  
**Issue:** The `<ol>` renders custom-styled step numbers inside each `<li>` via a `<span>`, but the native list counter is hidden by Tailwind's `list-none` reset. Screen readers announce "list item" without numbers. Similarly in `games/[id]/page.tsx:88-95`.  
**Fix:** Either restore native list numbering with `list-decimal` or add `aria-label={`Step ${index + 1}: ${item.slice(0, 60)}`}` to each `<li>`.

---

### P2-5: Footer still shows "Demo mode" guidance regardless of configuration

**File:** `src/app/layout.tsx:31`  
**Issue:** The footer permanently reads "Demo mode works without API keys. Add OpenAI credentials for production-style answers." even when OpenAI is configured and working. This is confusing for users who *have* configured the API key.  
**Fix:** This is a server component — read `process.env.OPENAI_API_KEY` and conditionally show the message only when in demo mode.

---

### P2-6: `GameCard` has two separate links to the same destination — redundant tab stops

**File:** `src/components/game-card.tsx:11-19`  
**Issue:** Both the cover image and the title text are separate `<Link>` elements pointing to `/games/${game.id}`. Keyboard users must tab through two identical links per card.  
**Fix:** Wrap the entire card top section (image + title) in a single link, or make one of them `tabIndex={-1}` and `aria-hidden="true"`.

---

### P2-7: No `rel="noopener"` or security headers configured in `next.config.ts`

**File:** `next.config.ts`  
**Issue:** No `headers()` function is configured. The app serves no `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, or `Content-Security-Policy` headers. While Next.js adds some defaults, explicit security headers are a production requirement.  
**Fix:** Add a `headers()` config:
```ts
const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ]
    }];
  }
};
```

---

### P2-8: `use-conversation.ts` doesn't cancel in-flight `askQuestion` requests on unmount or game switch

**File:** `src/components/hooks/use-conversation.ts:59-90`  
**Issue:** The history fetch correctly uses `AbortController` (line 37-56), but `askQuestion` does not. If a user switches games while a question is in-flight, the response from the old game will be appended to the new game's history. This is a race condition.  
**Fix:** Use a ref-based `AbortController` for `askQuestion` as well, aborting on game/session change.

---

### P2-9: `timeAgo` shows misleading labels at day boundaries

**File:** `src/lib/utils.ts:74-85`  
**Issue:** `Math.round` causes jumps: 23.5 hours rounds to "24h ago" instead of "1d ago", and 89 minutes shows as "1h ago" (rounds down from 1.48). This was flagged in prior reviews but the root cause (`Math.round` vs `Math.floor`) remains unfixed.  
**Fix:** Use `Math.floor` for all divisions to avoid premature rounding up.

---

### P2-10: No `loading.tsx` for individual route segments — all pages share the global spinner

**File:** `src/app/loading.tsx` (only global one exists)  
**Issue:** Dashboard, Games, Ask, and Quick-Start pages all fall back to the same global loading spinner. This means navigating between pages shows an identical loading state with no route-specific skeleton or context.  
**Fix:** Add per-route `loading.tsx` files with contextual skeletons (e.g., dashboard card placeholders, game grid placeholders).

---

### P2-11: `feedback-controls.tsx` submits "incorrect ruling" as default reason on downvote even if user hasn't chosen

**File:** `src/components/feedback-controls.tsx:48`  
**Issue:** `submit('down', reason || reasons[0])` — if the user clicks "Needs work" without selecting a reason, it auto-submits "incorrect ruling" as the reason. The user never chose this; it's a silent default that corrupts feedback data.  
**Fix:** Either require a reason selection before allowing downvote submission, or submit with `reason: null` and let the UI prompt for a reason afterward.

---

### P2-12: `conversation-thread.tsx` wraps entire thread in `aria-live="polite"` — excessive announcements

**File:** `src/components/conversation-thread.tsx:25`  
**Issue:** The entire conversation history div is `aria-live="polite"`. When a new answer is appended, the screen reader re-announces *all* content in the region, not just the new item. With a long conversation, this becomes overwhelming.  
**Fix:** Move `aria-live` to a narrower wrapper around only the most recent answer or the loading/error status, not the entire history.

---

## Quick Wins (< 1 day each)

| # | Issue | Effort |
|---|-------|--------|
| 1 | P0-1: Guard `JSON.parse` in openai-engine.ts | 30 min |
| 2 | P0-2: Null-check profile in dashboard.ts | 15 min |
| 3 | P1-1: Add `aria-label` to dashboard select | 5 min |
| 4 | P1-2: Fix `min-w-[240px]` responsive overflow | 5 min |
| 5 | P1-3: Add contextual `aria-label` to Remove buttons | 15 min |
| 6 | P1-5/P1-6: Replace `return null` with empty states | 30 min |
| 7 | P1-8: Add `aria-hidden` to FeatureCard icon | 5 min |
| 8 | P2-1: Add `aria-current="page"` to nav links | 30 min |
| 9 | P2-5: Conditionally show demo-mode footer text | 15 min |
| 10 | P2-6: Deduplicate GameCard links | 20 min |
| 11 | P2-9: `Math.floor` in `timeAgo` | 5 min |
| 12 | P2-11: Don't auto-select feedback reason | 15 min |

## Medium-Term Improvements (days to sprint)

| # | Issue | Effort |
|---|-------|--------|
| 1 | P1-4: Responsive sidebar collapse for chat on tablet | 2–3 days |
| 2 | P1-7: Heading landmarks in conversation thread | 1 day |
| 3 | P1-9: Mobile nav backdrop + `inert` on main content | 1 day |
| 4 | P2-7: Security headers in next.config.ts | 1 day (with CSP tuning) |
| 5 | P2-8: AbortController for askQuestion | 1 day |
| 6 | P2-10: Per-route loading skeletons | 2–3 days |
| 7 | P2-12: Narrow `aria-live` region scope | 1 day |
| 8 | P2-4: Restore semantic list numbering in quick-start | 1 day |

## Long-Term Investments

| # | Area | Description |
|---|------|-------------|
| 1 | **Accessibility audit with real AT** | Run NVDA + VoiceOver end-to-end tests. Automated analysis can only catch structural issues; real assistive tech testing will surface interaction-flow problems. |
| 2 | **Responsive design pass** | Test all pages at 320px, 375px, 768px, 1024px, 1280px breakpoints systematically. The current design is desktop-first with mobile adjustments; a dedicated mobile-first pass would catch overflow, cramped layouts, and touch-target sizing issues. |
| 3 | **Error recovery patterns** | Implement retry-with-backoff for API calls, optimistic UI updates with rollback, and toast notifications instead of inline error banners that disappear on re-render. |
| 4 | **Performance monitoring** | Add Web Vitals tracking (LCP, CLS, INP). The data-URI SVG covers likely cause high CLS on initial paint; real image assets or a canvas-based approach would improve paint performance. |

---

## Comparison to Best Practices

| Area | Status | Gap |
|------|--------|-----|
| Skip link | ✅ Present | — |
| Focus management | ✅ Mostly good | Mobile nav lacks backdrop; no `inert` |
| `aria-live` regions | ⚠️ Over-broad | Entire conversation thread is live region |
| Semantic HTML | ⚠️ Partial | Missing headings in articles, decorative icons not hidden |
| Error boundaries | ✅ Global exists | No per-feature boundaries |
| API error messages | ✅ User-safe | — |
| Input validation | ✅ Zod everywhere | — |
| CSRF protection | ✅ Origin-based middleware | — |
| Security headers | ❌ None configured | No CSP, X-Frame-Options, etc. |
| Loading states | ⚠️ Global only | No route-specific skeletons |
| Responsive design | ⚠️ Mostly works | Fixed widths cause overflow at narrow/medium breakpoints |
| Active link indication | ❌ Missing | No visual or programmatic active state |
| Keyboard navigation | ✅ Good | — |
| Color contrast | ✅ Appears sufficient | Needs manual WCAG 2.1 AA verification |
| Touch targets | ⚠️ Mostly 44px+ | Some text-link targets (Continue asking →) may be undersized |
