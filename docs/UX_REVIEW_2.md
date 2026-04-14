# RulesGenie — Second-Pass UX & DX Audit

> **Context:** Follow-up review after the first audit (`docs/UX_REVIEW.md`) and its fixes.  
> **Auditor perspective:** Senior engineer evaluating the state of the codebase post-remediation.  
> **Date:** June 2025  
> **Scope:** Remaining UX gaps, accessibility, responsive edge cases, error handling, visual polish, regressions.

---

## 1. Summary

The first review's P0 issues — Enter-key submission, auto-scroll, textarea sizing, mobile hamburger menu, skip-to-content link, `aria-live` regions, focus-visible rings, suggestion chips, new-session button, error feedback in dashboard, and `?q=` pre-fill — have all been addressed and the implementations are solid. The codebase is meaningfully better than what was described in Review 1. What remains falls into three buckets: (a) **accessibility details** the global fixes didn't catch (toggle state semantics, focus trapping, error exposure), (b) **responsive micro-breakpoint edge cases** that matter for the PRD's 320px commitment, and (c) **error handling gaps** in API routes and client-side fetch calls that can silently corrupt state or leak internals. None are ship-blocking individually, but several clusters deserve attention before user testing.

---

## 2. Issues Fixed Since Review 1 — Verified ✅

| Review 1 Issue | Status |
|---|---|
| 3.1 Enter-key submission in chat | ✅ Fixed — `handleKeyDown` on textarea, Enter submits, Shift+Enter newlines (chat-interface.tsx:123-131) |
| 3.2 Auto-scroll to new answers | ✅ Fixed — `conversationEndRef` + `scrollIntoView` on history/loading change (chat-interface.tsx:74-76) |
| 3.3 Textarea too tall | ✅ Fixed — `min-h-[48px]`, `rows={1}`, auto-resize with `autoResize()` (chat-interface.tsx:39-44, 291) |
| 3.4 Focus management / `aria-live` | ✅ Fixed — global `focus-visible` ring in globals.css:27-32, `aria-live="polite"` on conversation area (chat-interface.tsx:221), `role="status"` on loading (loading.tsx:3) |
| 3.5 Header overflow on small screens | ✅ Fixed — hamburger menu with `sm:hidden` toggle (site-header.tsx:38-67) |
| 3.6 Suggestions never rendered | ✅ Fixed — suggestion chips rendered below answers (chat-interface.tsx:252-272) |
| 3.7 No "clear session" button | ✅ Fixed — `clearSession()` + "New session" button in sidebar (chat-interface.tsx:133-144, 193-199) |
| 3.8 Silent error handling in dashboard | ✅ Fixed — `mutationError` state with dismissible alert banner (dashboard-client.tsx:15, 75-84) |
| 3.9 Example questions don't pre-fill chat | ✅ Fixed — `?q=` param support with auto-submit (ask/page.tsx:12, chat-interface.tsx:79-85) |
| 3.11 No loading animation | ✅ Fixed — bouncing dots animation in loading.tsx:8-12 |
| 3.15 Hardcoded "20 supported games" | ✅ Fixed — uses `allGames.length` dynamically (page.tsx:38) |
| Skip-to-content link | ✅ Added — layout.tsx:21-26 |
| Button hover/active states | ✅ Fixed — `hover:bg-board-pine/90 active:scale-[0.98]` on primary CTA (chat-interface.tsx:299) |
| Disabled button branding | ✅ Fixed — `disabled:bg-board-pine/40` instead of `disabled:bg-slate-300` (chat-interface.tsx:299) |
| `.gitignore` for DB files | ✅ Fixed — `*.db`, `*.db-shm`, `*.db-wal` all excluded (.gitignore:4-6) |
| Example prompt `aria-label` | ✅ Fixed — `aria-label={`Ask: ${example}`}` on sidebar prompts (chat-interface.tsx:181) |

---

## 3. Remaining Issues

### P0 — Critical

#### 3.1 API routes crash on malformed JSON body
**Files:** `src/app/api/ask/route.ts:16`, `src/app/api/bookmarks/route.ts:11`, `src/app/api/collection/route.ts:11`, `src/app/api/feedback/route.ts:16`  
**Problem:** All four POST routes call `await request.json()` without a `try/catch`. If the request body is not valid JSON (e.g., empty body, truncated request, content-type mismatch), `request.json()` throws and the error surfaces as an unhandled 500 with a stack trace — bypassing the Zod validation entirely.  
**Impact:** Any HTTP client sending a non-JSON body gets an opaque server error. In production, this is a crash loop vector for bots or misconfigured clients. More importantly, it means the carefully written Zod validation below never runs — the route fails before reaching it.  
**Fix:** Wrap each `request.json()` in try/catch:
```ts
let payload: unknown;
try {
  payload = await request.json();
} catch {
  return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
}
```

#### 3.2 `error.tsx` leaks raw `error.message` to users
**File:** `src/app/error.tsx:9`  
**Problem:** `{error.message || 'Something went wrong while loading the app.'}` renders whatever string the server threw. In development this is fine, but in production Node errors can include file paths, SQL statements, or stack fragments (e.g., a SQLite constraint violation will print the full SQL).  
**Impact:** Information disclosure. An attacker triggering edge-case errors could map internal paths and query structure.  
**Fix:** In production, show only the generic fallback. Use `error.digest` (which Next.js provides as a sanitized hash) for support reference:
```tsx
<p>{process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong while loading the app.'}</p>
{error.digest && <p className="mt-2 text-xs text-slate-400">Reference: {error.digest}</p>}
```

#### 3.3 `BookmarkToggle` and `CollectionToggle` have no error handling on fetch
**Files:** `src/components/bookmark-toggle.tsx:16-24`, `src/components/collection-toggle.tsx:24-33`  
**Problem:** Both components `await fetch(...)` and then immediately `await response.json()` with no `response.ok` check and no try/catch. If the API returns a non-200 status or the network fails, the component either silently parses an error response as if it were success data (setting `active` to `undefined`), or throws an unhandled promise rejection.  
**Impact:** User clicks "Save answer" or "Add to collection", it fails silently, and the UI shows an incorrect toggled state. The `FeedbackControls` component (feedback-controls.tsx:21) does check `response.ok` — inconsistency between sibling components.  
**Fix:** Add `if (!response.ok) throw new Error(...)` and wrap in try/catch with error state, matching the pattern already used in `dashboard-client.tsx:23-47`.

---

### P1 — High

#### 3.4 Toggle buttons missing `aria-pressed` state
**Files:** `src/components/bookmark-toggle.tsx:12`, `src/components/collection-toggle.tsx:21`, `src/components/feedback-controls.tsx:32,40`  
**Problem:** All toggle-style buttons (bookmark, collection, thumbs up/down) lack `aria-pressed` attribute. Screen readers announce them as generic buttons — there's no way for assistive technology users to know the current toggle state without reading the button label text.  
**Impact:** WCAG 2.1 AA failure (4.1.2 Name, Role, Value). The PRD commits to AA compliance.  
**Fix:** Add `aria-pressed={active}` to BookmarkToggle and CollectionToggle. Add `aria-pressed={rating === 'up'}` / `aria-pressed={rating === 'down'}` to feedback thumbs.

#### 3.5 Mobile menu has no focus trap or Escape-to-close
**File:** `src/components/site-header.tsx:51-67`  
**Problem:** The mobile nav drawer renders inline with no focus trapping. When opened, Tab cycles through the menu links but then escapes into the page behind. There is no Escape key handler to close the menu. The drawer also doesn't trap scroll — the page behind scrolls while the menu is visually open.  
**Impact:** Keyboard-only users can get disoriented; the menu doesn't behave like a modal overlay. This is a common WCAG 2.1 AA gap (2.1.2 No Keyboard Trap — ironic, the trap *is* missing here).  
**Fix:** Add `onKeyDown` handler for Escape. Optionally add a focus trap (e.g., via `useRef` + `focus()` on first link when opening, and re-focus trigger button on close). Since the drawer is not a full overlay, a lightweight approach is acceptable:
```tsx
onKeyDown={(e) => { if (e.key === 'Escape') setMobileOpen(false); }}
```

#### 3.6 Library search input has no visible label (placeholder-only)
**File:** `src/components/library-browser.tsx:33-37`  
**Problem:** The search input uses `placeholder="Search by game, mechanic, or vibe"` as its only label. Placeholders disappear on focus, violating WCAG 1.3.1 (Info and Relationships) and 3.3.2 (Labels or Instructions). The complexity and player-count selects are similarly unlabeled — they rely on the first `<option>` as a pseudo-label.  
**Impact:** Screen reader users get no context for these inputs. Sighted users who clear the field lose context about what it does.  
**Fix:** Add `<label className="sr-only">` for the search input. For the selects, the first `<option>` (e.g., "All complexity levels") provides reasonable context, but an explicit `aria-label` is safer:
```tsx
<input aria-label="Search games by name, mechanic, or theme" ... />
<select aria-label="Filter by complexity" ...>
<select aria-label="Filter by player count" ...>
```

#### 3.7 Dashboard "Add game" button regresses to `disabled:bg-slate-300`
**File:** `src/components/dashboard-client.tsx:135`  
**Problem:** The "Add game" button uses `disabled:bg-slate-300` — the exact anti-pattern that Review 1 flagged and was fixed on the primary CTA in chat-interface.tsx. The fix was applied inconsistently.  
**Impact:** When no game is selected, the button becomes a generic gray pill that loses all brand identity. Inconsistent with the `disabled:bg-board-pine/40` applied elsewhere.  
**Fix:** Change to `disabled:bg-board-pine/40` and add missing hover/active/focus-visible states:
```
className="rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-board-pine/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-board-pine/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
```

#### 3.8 Dashboard action buttons missing hover/focus/transition styles
**Files:** `src/components/dashboard-client.tsx:148,151,177,197`  
**Problem:** Several interactive elements in the dashboard lack hover, focus-visible, and transition styles:
- "Open assistant" link (line 148): no hover state, no focus ring
- "Remove" button on collection cards (line 151): no hover state, no focus ring, no transition
- "Continue asking →" link (line 177): has text color but no hover/focus ring
- "Remove" button on bookmarks (line 197): bare text button, no focus ring
**Impact:** Buttons feel dead on hover; keyboard users can't see where they are in the dashboard. Inconsistent with the well-styled chat interface.  
**Fix:** Apply consistent interactive styles (`transition hover:bg-board-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold`) to all clickable elements.

#### 3.9 `CitationList` uses non-semantic markup for list content
**File:** `src/components/citation-list.tsx:8-19`  
**Problem:** Citations are rendered as a flex container of `<div>` elements. Semantically, they are a list of sources. Screen readers won't announce the count ("3 items") or allow list-based navigation.  
**Impact:** WCAG 1.3.1 (Info and Relationships) — the structure is visually a list but programmatically a pile of divs.  
**Fix:** Use `<ul>` / `<li>` with `role="list"` (since Tailwind resets list styles):
```tsx
<ul role="list" className="flex flex-wrap gap-2">
  <li key={...} className="rounded-2xl ...">
```

#### 3.10 `FeedbackControls.submit()` has no error feedback to user
**File:** `src/components/feedback-controls.tsx:15-27`  
**Problem:** While `submit()` does check `response.ok`, on failure it simply... does nothing. No error state, no console warning, no visual feedback. The function silently drops the failure and the user has no idea their feedback wasn't recorded.  
**Impact:** Unlike `BookmarkToggle` (which is completely unchecked), feedback at least checks the response — but still provides zero feedback on failure. The dashboard's error-handling pattern (mutationError state) should be mirrored here.  
**Fix:** Add local error state and render an inline error message, or optimistically revert the rating on failure.

---

### P2 — Medium (Polish & Robustness)

#### 3.11 `select` in dashboard has `min-w-[240px]` — overflows at 320px
**File:** `src/components/dashboard-client.tsx:120`  
**Problem:** The "Choose a game to add" select has `min-w-[240px]`. On a 320px viewport (PRD requirement) with `px-4` padding on the parent, the available width is ~288px. The select and "Add game" button are in a `flex-col` on small screens, so the select itself fits, but only barely. On any viewport between 320–400px, if `sm:flex-row` kicks in (which it doesn't — `sm` is 640px), both would overflow. Currently safe, but the hardcoded `min-w` is fragile.  
**Fix:** Replace `min-w-[240px]` with `w-full sm:min-w-[240px]` to ensure full-width on small screens.

#### 3.12 Game cover SVG text truncation on long game names
**File:** `src/lib/utils.ts:55`  
**Problem:** The SVG cover renders game names at `font-size="48"` starting at `x="64"` in a 600px-wide SVG. Any game name longer than ~18 characters overflows the right edge of the SVG (e.g., "Terraforming Mars" fits at 17 chars, but "Betrayal at House on the Hill" at 29 chars would be clipped). The SVG has no `textLength`, `lengthAdjust`, or multi-line text wrapping.  
**Impact:** Some game covers in the library will show truncated names. Visual-only issue since `alt` text exists.  
**Fix:** Add `textLength="470" lengthAdjust="spacingAndGlyphs"` to the SVG `<text>` element, or reduce font-size dynamically based on name length.

#### 3.13 Ordered lists (`<ol>`) rendered without list semantics in quick-start/setup
**Files:** `src/components/quick-start-explorer.tsx:58-64,69-75`, `src/app/games/[id]/page.tsx:71-78,82-89`  
**Problem:** Quick-start rules and setup steps use `<ol>` but each `<li>` has a manually rendered step number (`Step {index + 1}` or a numbered circle). The `<ol>` is semantically correct, but the Tailwind reset (`list-none` by default) means the browser's native numbering is hidden, and the manual numbering is fragile — if items are reordered, the numbers update, but the disconnect between semantic and visual numbering can confuse screen readers that announce both the native list position *and* the visual number.  
**Fix:** Either use CSS counters to generate numbers (remove manual spans), or use `<ul>` with `aria-label="Setup steps"` if the manual numbers are intentional. The current approach isn't broken, but it's unnecessarily fragile.

#### 3.14 No `<form>` element wrapping the chat question submission
**File:** `src/components/chat-interface.tsx:276-304`  
**Problem:** The textarea and submit button are wrapped in a plain `<div>`, not a `<form>`. While Enter-key submission works via `onKeyDown`, the pattern bypasses native form semantics. This means:
- No native form validation (length constraints are handled in code, which is fine)
- Autofill/password managers may not recognize the input correctly
- Assistive technology doesn't announce the region as a form
**Impact:** Minor for this use case, but semantically incorrect. `<form onSubmit>` with `event.preventDefault()` is the correct pattern.  
**Fix:** Wrap in `<form onSubmit={(e) => { e.preventDefault(); askQuestion(); }}>` and change the button to `type="submit"`.

#### 3.15 `timeAgo` still uses `Math.round` (Review 1 item 3.17 — not fixed)
**File:** `src/lib/utils.ts:71-80`  
**Problem:** This was flagged in Review 1 (item 3.17, P2) and has not been addressed. `Math.round` means 89 minutes shows as "1h ago" (rounds down) but 91 minutes shows as "2h ago" (rounds up). Similarly, 35 hours shows as "1d ago" but 36 hours shows as "2d ago".  
**Impact:** Minor inaccuracy. Users see "2h ago" for something that happened 91 minutes ago — unexpected behavior.  
**Fix:** Use `Math.floor` instead of `Math.round`.

#### 3.16 No per-page `<title>` or metadata beyond root layout
**Files:** `src/app/ask/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/games/page.tsx`, `src/app/games/[id]/page.tsx`, `src/app/quick-start/page.tsx`  
**Problem:** No page exports a `metadata` object or `generateMetadata` function. Every page renders with the root title "RulesGenie" in the browser tab. Users with multiple tabs can't distinguish them.  
**Impact:** Bad UX for multi-tab users. Bad SEO (all pages have identical `<title>`). Accessibility: screen readers announce the same title for every page.  
**Fix:** Add `export const metadata` to each page:
```ts
export const metadata = { title: 'Ask Rules | RulesGenie' };
```
For `games/[id]/page.tsx`, use `generateMetadata()` to include the game name.

#### 3.17 Hero heading text is very large on mobile viewports
**File:** `src/app/page.tsx:20-22`  
**Problem:** The hero `<h1>` uses `text-5xl sm:text-6xl`. On a 320px viewport, `text-5xl` (3rem / 48px) with the long heading text "Stop flipping through rulebooks. Get the ruling in seconds." wraps to 5-6 lines and consumes most of the viewport.  
**Impact:** On 320px screens, the hero section pushes all other content (feature cards, CTA buttons) below the fold. Users see a wall of heading text.  
**Fix:** Add a smaller mobile size: `text-3xl sm:text-5xl lg:text-6xl`.

#### 3.18 Game detail page fixed sidebar width breaks on medium screens
**File:** `src/app/games/[id]/page.tsx:23`  
**Problem:** `lg:grid-cols-[360px_1fr]` creates a fixed 360px column for the game cover. Between 1024px (lg breakpoint) and ~1100px, the right content column has only ~600px — which is fine. But the cover image uses `aspect-[3/4] h-full`, which means on `lg` screens the cover is 360×480px, consuming significant vertical space in the grid and forcing the text content to the right to be very tall and narrow.  
**Impact:** Awkward layout at exactly the lg breakpoint. The cover dominates.  
**Fix:** Use `lg:grid-cols-[300px_1fr] xl:grid-cols-[360px_1fr]` to give the content more room at the lg breakpoint.

#### 3.19 Quick-start `min-h-[300px]` on game cover is excessive on mobile
**File:** `src/components/quick-start-explorer.tsx:20`  
**Problem:** The game cover in the quick-start explorer has `min-h-[300px]`. On mobile (single-column layout), the cover takes 300px+ of a ~568px visible viewport (after header/nav). This pushes the actual rules content — the thing the user came for — below the fold.  
**Impact:** Users on mobile must scroll past a decorative cover image to see the quick-start content.  
**Fix:** Use `min-h-[200px] lg:min-h-[300px]` to reduce mobile prominence.

#### 3.20 `color-scheme: light` is hardcoded with no dark mode path
**File:** `src/app/globals.css:6`  
**Problem:** This was flagged in Review 1 (item 3.14, P2) and has not been addressed. The PRD notes "text must remain readable in low-light indoor settings" — the primary use case (game tables at night). With `color-scheme: light` hardcoded, OS-level dark mode is completely ignored.  
**Impact:** Bright white UI in the exact use case the product targets.  
**Fix:** Longer-term effort. As interim, add `@media (prefers-color-scheme: dark) { :root { color-scheme: dark; } }` and key dark overrides for `bg-white`, `bg-board-canvas`, and text colors.

#### 3.21 `db.ts` seeds on every module import (Review 1 item 4.3.4 — not fixed)
**File:** `src/lib/db.ts:48-49`  
**Problem:** `initializeDatabase()` and `seedDatabase()` run unconditionally at module load. While idempotent via `ON CONFLICT`, this inserts and upserts 20 game records on every server cold start (and every HMR in dev).  
**Impact:** Slow cold starts; unexpected for developers who don't expect `import '@/lib/db'` in `layout.tsx` to have side effects.  
**Fix:** Gate behind `process.env.NODE_ENV !== 'production'` or add a boolean guard `if (!db.prepare('SELECT 1 FROM games LIMIT 1').get()) seedDatabase()`.

#### 3.22 No `next.config.js` security headers
**File:** `next.config.js`  
**Problem:** No CSP, no X-Frame-Options, no X-Content-Type-Options, no Referrer-Policy. The config only has `serverExternalPackages`.  
**Impact:** Security baseline is unset. The SVG data URIs in game covers would also need to be allowed in a CSP `img-src` directive.  
**Fix:** Add a `headers()` function in next.config.js with baseline security headers.

---

## 4. Regression Check

| Area | Status | Notes |
|---|---|---|
| Enter-key + button submission | ✅ No regression | Both paths work; button correctly disables during loading |
| Auto-scroll | ✅ No regression | Smooth scroll on history change and loading state |
| Mobile hamburger | ✅ No regression | Opens/closes, links close menu on click |
| Suggestion chips | ✅ No regression | Render correctly, auto-submit on click, clear after new question |
| New session button | ✅ No regression | Clears localStorage, generates fresh session ID, resets all state |
| Dashboard error banner | ✅ No regression | Renders on API failure, dismissible |
| `?q=` pre-fill + auto-submit | ✅ No regression | `initialQuestionFired` ref prevents double-submit |
| Skip-to-content | ✅ No regression | Present, visible on focus, targets `#main-content` |
| Focus-visible rings | ⚠️ Partial regression | Global CSS rule works, but some dashboard buttons (3.8) don't have `outline-none` to suppress browser default, causing double rings in Firefox |
| Loading animation | ✅ No regression | Three-dot bounce animation works |

---

## 5. Quick Wins (< 1 day each)

| # | Task | Priority | Effort | File(s) |
|---|---|---|---|---|
| 1 | Wrap `request.json()` in try/catch in all 4 API routes | P0 | 30 min | `api/*/route.ts` |
| 2 | Sanitize `error.message` in `error.tsx` for production | P0 | 15 min | `error.tsx` |
| 3 | Add error handling to `BookmarkToggle` and `CollectionToggle` fetch calls | P0 | 45 min | `bookmark-toggle.tsx`, `collection-toggle.tsx` |
| 4 | Add `aria-pressed` to all toggle buttons | P1 | 30 min | `bookmark-toggle.tsx`, `collection-toggle.tsx`, `feedback-controls.tsx` |
| 5 | Add Escape-to-close on mobile menu | P1 | 15 min | `site-header.tsx` |
| 6 | Add `aria-label` / sr-only labels to library filter inputs | P1 | 15 min | `library-browser.tsx` |
| 7 | Fix `disabled:bg-slate-300` regression on dashboard "Add game" button | P1 | 5 min | `dashboard-client.tsx:135` |
| 8 | Add hover/focus-visible styles to dashboard action buttons | P1 | 30 min | `dashboard-client.tsx` |
| 9 | Use `<ul>` / `<li>` in `CitationList` | P1 | 10 min | `citation-list.tsx` |
| 10 | Add `export const metadata` to all page routes | P2 | 30 min | All `page.tsx` files |
| 11 | Fix `Math.round` → `Math.floor` in `timeAgo` | P2 | 5 min | `utils.ts:74-78` |
| 12 | Reduce hero `text-5xl` to `text-3xl` on mobile | P2 | 5 min | `page.tsx:20` |
| 13 | Replace `min-w-[240px]` with `w-full sm:min-w-[240px]` on dashboard select | P2 | 5 min | `dashboard-client.tsx:120` |

---

## 6. Medium-Term Improvements (1–5 days)

| # | Task | Priority | Effort | Notes |
|---|---|---|---|---|
| 1 | Add error feedback to `FeedbackControls` (toast or inline) | P1 | 2 hours | Match dashboard error pattern |
| 2 | Wrap chat submission in `<form>` for semantic correctness | P2 | 1 hour | chat-interface.tsx |
| 3 | Add focus trap to mobile menu (lightweight) | P1 | 2–3 hours | site-header.tsx |
| 4 | SVG cover text truncation handling | P2 | 2 hours | utils.ts `getGameCover()` |
| 5 | Gate `seedDatabase()` to avoid cold-start work | P2 | 1 hour | db.ts |
| 6 | Add `headers()` security config to next.config.js | P2 | 2–3 hours | CSP, X-Frame-Options, etc. |
| 7 | Dark mode basics (canvas/white/text inversion) | P2 | 1–2 days | globals.css + Tailwind `dark:` |
| 8 | Responsive game detail grid at lg breakpoint | P2 | 1 hour | games/[id]/page.tsx |
| 9 | Reduce quick-start cover `min-h` on mobile | P2 | 15 min | quick-start-explorer.tsx |

---

## 7. Visual Consistency Audit

### Fixed since Review 1
- ✅ Primary CTA buttons now have `hover:bg-board-pine/90` and `active:scale-[0.98]`
- ✅ Disabled state uses branded `disabled:bg-board-pine/40` (in chat)
- ✅ Loading state has animation (bouncing dots)

### Still inconsistent
- **Dashboard buttons** (3.7, 3.8) — "Add game", "Remove", "Open assistant" lack the interactive style vocabulary established in chat-interface.tsx. Some have zero hover/focus states.
- **Secondary button styles vary** — Some use `border-board-forest/15` (game detail), others use `border-board-forest/10` (dashboard collection cards), others `border-board-forest/20` (library empty state). These should converge on one or two tokens.
- **Focus ring application** — The global CSS rule (globals.css:27-31) applies `ring-2 ring-board-gold` to `a`, `button`, `select`, `input` focus-visible states. However, components that set their own `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold` (e.g., chat-interface.tsx:299) create redundancy. The global rule + per-component rule can cause double ring rendering in some browsers. Recommendation: rely on the global rule and remove per-component focus-visible unless overriding.
- **Border radius tokens** (from Review 1, unfixed) — Still a mix of `rounded-[28px]`, `rounded-[32px]`, `rounded-[36px]`, `rounded-[40px]`, `rounded-2xl`, `rounded-3xl`, `rounded-full`. Adding named Tailwind tokens (`rounded-card: 28px`, `rounded-panel: 32px`, `rounded-hero: 40px`) would improve maintainability.

---

## 8. Accessibility Summary

| WCAG Criterion | Status | Issue |
|---|---|---|
| 1.3.1 Info and Relationships | ⚠️ | Citation divs should be list (3.9); library inputs lack labels (3.6) |
| 2.1.1 Keyboard | ✅ | Enter submission, focus rings, skip-nav all working |
| 2.1.2 No Keyboard Trap | ⚠️ | Mobile menu doesn't trap focus (3.5) |
| 2.4.1 Bypass Blocks | ✅ | Skip-to-content link present |
| 2.4.2 Page Titled | ⚠️ | All pages share root title (3.16) |
| 3.3.2 Labels or Instructions | ⚠️ | Library search has placeholder-only label (3.6) |
| 4.1.2 Name, Role, Value | ⚠️ | Toggle buttons missing `aria-pressed` (3.4) |
| 4.1.3 Status Messages | ✅ | `aria-live="polite"` on conversation area, `role="status"` on loading |

**Net assessment:** The app went from ~50% AA coverage to ~75% after Review 1 fixes. The remaining gaps (aria-pressed, labels, list semantics, page titles) are all quick fixes. The mobile focus trap is the most effort.

---

## 9. Priority Matrix

### P0 (Fix before any user testing)
1. API route JSON parse crash (3.1) — security + reliability
2. Error page information disclosure (3.2) — security
3. Silent fetch failures in BookmarkToggle / CollectionToggle (3.3) — data integrity

### P1 (Fix before beta)
4. `aria-pressed` on toggles (3.4) — a11y compliance
5. Mobile menu Escape key + focus management (3.5) — a11y
6. Library filter input labels (3.6) — a11y
7. Dashboard "Add game" disabled style regression (3.7) — visual consistency
8. Dashboard button interactive styles (3.8) — visual consistency
9. Citation list semantics (3.9) — a11y
10. Feedback controls error feedback (3.10) — error handling

### P2 (Quality-of-life)
11. Per-page metadata/titles (3.16)
12. `timeAgo` rounding (3.15)
13. Hero heading size on mobile (3.17)
14. Dashboard select `min-w` on small screens (3.11)
15. Chat `<form>` semantics (3.14)
16. SVG cover text truncation (3.12)
17. Dark mode (3.20)
18. Security headers (3.22)
19. Seed guard on db.ts (3.21)
20. Ordered list semantics in quick-start (3.13)
