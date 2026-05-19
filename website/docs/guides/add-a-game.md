---
id: add-a-game
title: Add a new game
sidebar_position: 2
description: Extend the RulesGenie catalog with a new board game and demo Q&A.
---

# Add a new game

RulesGenie ships with 35 games. Adding a 36th takes about 10 minutes.

## 1. Add the game record

Open `src/data/games.ts` and append a new `GameRecord`. Use an existing
entry as the template:

```ts title="src/data/games.ts"
{
  id: 'spirit-island',
  name: 'Spirit Island',
  publisher: 'Greater Than Games',
  designer: 'R. Eric Reuss',
  complexity: 4.0,
  players: { min: 1, max: 4, best: 2 },
  duration: { min: 90, max: 120 },
  mechanics: ['cooperative', 'area-control', 'variable-powers'],
  category: 'heavyweight',
  cover: '/games/spirit-island.svg',
  blurb: 'Defend your island home from colonial invaders as elemental spirits.',
  rulebook: {
    title: 'Spirit Island Rulebook',
    edition: '2nd printing',
    url: 'https://example.com/spirit-island-rules.pdf',
  },
},
```

Required fields are enforced by the `GameRecord` type in
`src/types/index.ts`. TypeScript will fail the build if anything is
missing.

## 2. Add a cover image

Drop an SVG or PNG at `public/games/spirit-island.svg` matching the
`cover` path you set above. A flat-color SVG with the game name is
fine — see other entries in `public/games/` for sizing.

## 3. Author mock Q&A entries

Open `src/data/mock-qa.ts` and add at least 3–5 entries scoped to the
new `gameId`. This is what powers demo-mode answers:

```ts title="src/data/mock-qa.ts"
{
  gameId: 'spirit-island',
  questionPatterns: [
    'how does fear work',
    'fear cards',
    'gain fear',
  ],
  answer:
    'Generating Fear advances the Fear Pool. When it fills, draw the top ' +
    'Fear Card and resolve its lowest-tier effect. At Terror Level 2 and ' +
    '3, resolve the higher-tier effects instead. Reaching Terror Level 3 ' +
    'can win the game if the last Invader is removed.',
  citations: [
    { source: 'Spirit Island Rulebook', section: 'Fear & Terror Level', page: 14 },
  ],
  confidence: 'high',
  suggestions: [
    'What is the Terror Level?',
    'How do I lose the game?',
  ],
},
```

Tips:

- **Patterns are token bags.** The mock engine tokenises the question and
  the patterns and scores by overlap. Include several phrasings.
- **Real citations.** Even in demo mode, citations should reference real
  rulebook sections so users learn to trust them.
- **Confidence honesty.** If a question is an edge case, set
  `confidence: 'medium'` and add a “verify in the rulebook” note in the
  answer.

## 4. Reseed and verify

The database auto-seeds on dev server startup *when there's no existing
data*. To get the new game in:

```bash
# Stop the dev server (Ctrl+C)
rm rulesgenie.db rulesgenie.db-shm rulesgenie.db-wal
npm run dev
```

Visit [http://localhost:3000/games](http://localhost:3000/games) — your
new game should appear in the catalog. Click it, hit **Ask**, and try
one of the question patterns you authored.

## 5. Add a test (optional but encouraged)

If you're contributing the game back upstream, add a smoke test that
asks one of your seeded questions and asserts the answer contains
expected keywords. The mock engine's determinism makes this reliable.

## Production note

In production (`NODE_ENV=production`) the dev seed is **skipped
entirely**. You'll need a migration strategy if you want new games to
land in an existing production database. The simplest path: ship a
small migration script that `INSERT … ON CONFLICT DO NOTHING`s into
`games` at boot.
