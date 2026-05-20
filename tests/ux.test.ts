import assert from 'node:assert/strict';
import test from 'node:test';

import { describeAssistantMode, filterGames, getActiveLibraryFilters, resolveRequestedGameId } from '../src/lib/ux';
import type { GameRecord } from '../src/types';

const games: GameRecord[] = [
  {
    id: 'azul',
    name: 'Azul',
    tagline: 'Draft tiles and build the prettiest wall.',
    description: 'An accessible abstract game about pattern drafting.',
    playerMin: 2,
    playerMax: 4,
    playTime: '30-45 min',
    complexity: 1.8,
    year: 2017,
    category: 'Abstract',
    mechanics: ['Drafting', 'Pattern Building'],
    highlights: ['Easy to teach'],
    quickStart: ['Draft one factory or center set each turn.'],
    setupGuide: ['Place factories and scoreboards.'],
    exampleQuestions: ['Can I overflow a row on purpose?'],
    palette: ['#0f766e', '#14b8a6', '#99f6e4'],
    icon: '🟦'
  },
  {
    id: 'wingspan',
    name: 'Wingspan',
    tagline: 'Build habitats and chain bird powers.',
    description: 'An engine-building game with birds, eggs, and card combos.',
    playerMin: 1,
    playerMax: 5,
    playTime: '45-70 min',
    complexity: 2.5,
    year: 2019,
    category: 'Engine builder',
    mechanics: ['Engine Building', 'Card Drafting'],
    highlights: ['Solo support'],
    quickStart: ['Choose one habitat action each turn.'],
    setupGuide: ['Set the birdfeeder and goal board.'],
    exampleQuestions: ['When do brown powers trigger?'],
    palette: ['#1d4ed8', '#60a5fa', '#bfdbfe'],
    icon: '🪽'
  },
  {
    id: 'brass-birmingham',
    name: 'Brass: Birmingham',
    tagline: 'Build industries and tighten your network.',
    description: 'A strategy-heavy network and economy game with beer timing puzzles.',
    playerMin: 2,
    playerMax: 4,
    playTime: '90-120 min',
    complexity: 3.9,
    year: 2018,
    category: 'Economic strategy',
    mechanics: ['Network Building', 'Hand Management'],
    highlights: ['Tough decisions'],
    quickStart: ['Build, develop, sell, loan, scout, or network each turn.'],
    setupGuide: ['Lay out markets, income track, and industry tiles.'],
    exampleQuestions: ['Can I sell without my own beer?'],
    palette: ['#7c2d12', '#ea580c', '#fed7aa'],
    icon: '🏭'
  }
];

test('resolveRequestedGameId keeps supported ids intact', () => {
  assert.deepEqual(resolveRequestedGameId(games, 'wingspan'), {
    selectedGameId: 'wingspan',
    requestedGameMissing: false
  });
});

test('resolveRequestedGameId falls back to the first game when a shared link is invalid', () => {
  assert.deepEqual(resolveRequestedGameId(games, 'unknown-game'), {
    selectedGameId: 'azul',
    requestedGameMissing: true
  });
});

test('filterGames combines search, complexity, and player filters', () => {
  const filtered = filterGames(games, {
    search: 'engine',
    complexity: 'mid',
    players: 'solo'
  });

  assert.deepEqual(
    filtered.map((game) => game.id),
    ['wingspan']
  );
});

test('getActiveLibraryFilters returns readable active filter chips', () => {
  assert.deepEqual(
    getActiveLibraryFilters({
      search: 'birds',
      complexity: 'mid',
      players: 'solo'
    }),
    ['Search: “birds”', 'Complexity: Midweight', 'Players: Soloable']
  );
});

test('describeAssistantMode explains live readiness and fallback behavior', () => {
  const liveReady = describeAssistantMode('live');
  const fallback = describeAssistantMode('live', 'fallback');

  assert.equal(liveReady.badgeLabel, 'Live mode');
  assert.match(liveReady.description, /OpenAI is ready/i);
  assert.equal(fallback.badgeLabel, 'Fallback mode');
  assert.match(fallback.description, /demo engine/i);
});
