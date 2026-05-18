import type { Citation, QaRecord } from '@/types';

import { GAMES } from './games';
import { MOCK_QA } from './qa-bank';

type SeedUser = {
  id: string;
  name: string;
  email: string;
  mode: string;
  createdAt: string;
};

type SeedCollection = {
  userId: string;
  gameId: string;
  createdAt: string;
};

type SeedSession = {
  id: string;
  userId: string;
  gameId: string;
  createdAt: string;
  updatedAt: string;
};

type SeedQaPair = {
  id: string;
  sessionId: string;
  userId: string;
  gameId: string;
  question: string;
  answer: string;
  citations: Citation[];
  confidence: number;
  status: QaRecord['status'];
  mode: QaRecord['mode'];
  createdAt: string;
};

type SeedBookmark = {
  userId: string;
  qaPairId: string;
  createdAt: string;
};

type SeedFeedback = {
  sessionId: string;
  qaPairId: string;
  rating: 'up' | 'down';
  reason?: string | null;
  createdAt: string;
};

type SessionQaRef = {
  id: string;
  patternIndex?: number;
  mode?: QaRecord['mode'];
  questionOverride?: string;
};

type SessionPlan = {
  id: string;
  userId: string;
  gameId: string;
  startMinute: number;
  qaRefs: SessionQaRef[];
};

const BASE_TIME = Date.UTC(2025, 0, 15, 18, 0, 0);
const FALLBACK_PALETTE = ['#1D6B55', '#F4B740', '#A63A50'] as const;

const toTimestamp = (minuteOffset: number) => {
  const date = new Date(BASE_TIME + minuteOffset * 60_000);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const pairId = (sessionId: string, index: number) => `${sessionId}-q${index + 1}`;

const gameQaTemplates = MOCK_QA.filter((entry) => entry.gameId !== null);
const qaById = new Map(gameQaTemplates.map((entry) => [entry.id, entry]));
const qaByGameId = new Map<string, typeof gameQaTemplates>();

for (const game of GAMES) {
  qaByGameId.set(
    game.id,
    gameQaTemplates.filter((entry) => entry.gameId === game.id)
  );
}

export const SEED_USERS: SeedUser[] = [
  {
    id: 'demo-user',
    name: 'Zoë Rulekeeper',
    email: 'zoe+power@rulesgenie.app',
    mode: 'Power User',
    createdAt: toTimestamp(-12_000)
  },
  {
    id: 'casual-cam',
    name: 'Marcus Meeple',
    email: 'marcus.casual@rulesgenie.app',
    mode: 'Casual Player',
    createdAt: toTimestamp(-7_200)
  },
  {
    id: 'new-anais',
    name: 'Anaïs First Turn',
    email: 'anais.new@rulesgenie.app',
    mode: 'New Account',
    createdAt: toTimestamp(-240)
  }
];

export const SEED_COLLECTIONS: SeedCollection[] = [
  { userId: 'demo-user', gameId: 'ark-nova', createdAt: toTimestamp(-300) },
  { userId: 'demo-user', gameId: 'brass-birmingham', createdAt: toTimestamp(-299) },
  { userId: 'demo-user', gameId: 'spirit-island', createdAt: toTimestamp(-298) },
  { userId: 'demo-user', gameId: 'wingspan', createdAt: toTimestamp(-297) },
  { userId: 'demo-user', gameId: 'agricola', createdAt: toTimestamp(-296) },
  { userId: 'demo-user', gameId: 'power-grid', createdAt: toTimestamp(-295) },
  { userId: 'demo-user', gameId: 'castles-of-burgundy', createdAt: toTimestamp(-294) },
  { userId: 'demo-user', gameId: 'the-quacks-of-quedlinburg', createdAt: toTimestamp(-293) },
  { userId: 'casual-cam', gameId: 'azul', createdAt: toTimestamp(-180) },
  { userId: 'casual-cam', gameId: 'cascadia', createdAt: toTimestamp(-179) },
  { userId: 'casual-cam', gameId: 'ticket-to-ride', createdAt: toTimestamp(-178) },
  { userId: 'casual-cam', gameId: 'king-of-tokyo', createdAt: toTimestamp(-177) }
];

const baseSessionPlans: SessionPlan[] = GAMES.map((game, index) => {
  const qaRefs: SessionQaRef[] = (qaByGameId.get(game.id) ?? []).slice(0, 3).map((entry, qaIndex) => ({
    id: entry.id,
    mode: qaIndex === 2 && index % 4 === 0 ? 'openai' : 'demo'
  }));

  if (qaRefs.length !== 3) {
    throw new Error(`Expected exactly 3 QA templates for game "${game.id}"`);
  }

  const userId = index < 22 ? 'demo-user' : index < GAMES.length - 1 ? 'casual-cam' : 'new-anais';

  return {
    id: `seed-${game.id}-session`,
    userId,
    gameId: game.id,
    startMinute: index * 90,
    qaRefs
  };
});

const extraSessionPlans: SessionPlan[] = [
  {
    id: 'demo-catan-marathon',
    userId: 'demo-user',
    gameId: 'catan',
    startMinute: 4_600,
    qaRefs: [
      { id: 'catan-distance-rule', patternIndex: 1, mode: 'demo' },
      { id: 'catan-robber-steal', patternIndex: 1, mode: 'openai' },
      { id: 'catan-longest-road', patternIndex: 1, mode: 'demo' },
      {
        id: 'catan-distance-rule',
        mode: 'fallback',
        questionOverride:
          'We paused mid-game because two players disagree: if I already have a road leading into an intersection and another player has a settlement one edge away, can I still place my settlement there because it is “my” road, or does the normal distance rule still block me even though the board state changed after several trades and a Knight card?'
      },
      { id: 'catan-robber-steal', mode: 'demo' }
    ]
  },
  {
    id: 'demo-wingspan-power-questions',
    userId: 'demo-user',
    gameId: 'wingspan',
    startMinute: 4_760,
    qaRefs: [
      { id: 'wingspan-brown-powers', patternIndex: 1, mode: 'demo' },
      { id: 'wingspan-egg-cost', patternIndex: 1, mode: 'openai' },
      { id: 'wingspan-birdfeeder-reroll', patternIndex: 1, mode: 'demo' },
      { id: 'wingspan-brown-powers', mode: 'fallback' }
    ]
  },
  {
    id: 'casual-cascadia-quick-check',
    userId: 'casual-cam',
    gameId: 'cascadia',
    startMinute: 4_910,
    qaRefs: [{ id: 'cascadia-nature-token', patternIndex: 1, mode: 'demo' }]
  },
  {
    id: 'new-pandemic-first-night',
    userId: 'new-anais',
    gameId: 'pandemic',
    startMinute: 4_980,
    qaRefs: [
      { id: 'pandemic-treat-disease', patternIndex: 1, mode: 'demo' },
      { id: 'pandemic-scientist-cure', patternIndex: 1, mode: 'fallback' }
    ]
  },
  {
    id: 'demo-dominion-late-night',
    userId: 'demo-user',
    gameId: 'dominion',
    startMinute: 5_060,
    qaRefs: [
      { id: 'dominion-buys', patternIndex: 1, mode: 'demo' },
      { id: 'dominion-shuffle', patternIndex: 1, mode: 'demo' },
      { id: 'dominion-duration', patternIndex: 1, mode: 'openai' },
      { id: 'dominion-buys', mode: 'demo' },
      { id: 'dominion-shuffle', mode: 'fallback' },
      { id: 'dominion-duration', mode: 'demo' }
    ]
  },
  {
    id: 'casual-kingdomino-rules-check',
    userId: 'casual-cam',
    gameId: 'kingdomino',
    startMinute: 5_200,
    qaRefs: [{ id: 'kingdomino-cannot-place', patternIndex: 1, mode: 'demo' }]
  }
];

const sessionPlans = [...baseSessionPlans, ...extraSessionPlans];

export const SEED_SESSIONS: SeedSession[] = sessionPlans.map((session) => ({
  id: session.id,
  userId: session.userId,
  gameId: session.gameId,
  createdAt: toTimestamp(session.startMinute),
  updatedAt: toTimestamp(session.startMinute + Math.max(session.qaRefs.length - 1, 0) * 6)
}));

export const SEED_QA_PAIRS: SeedQaPair[] = sessionPlans.flatMap((session) => (
  session.qaRefs.map((ref, index) => {
    const template = qaById.get(ref.id);

    if (!template || template.gameId !== session.gameId) {
      throw new Error(`Missing QA template "${ref.id}" for game "${session.gameId}"`);
    }

    const questionPattern = ref.questionOverride
      ?? template.questionPatterns[ref.patternIndex ?? 0]
      ?? template.questionPatterns[0]
      ?? '';

    if (!questionPattern) {
      throw new Error(`Missing question pattern for template "${ref.id}"`);
    }

    return {
      id: pairId(session.id, index),
      sessionId: session.id,
      userId: session.userId,
      gameId: session.gameId,
      question: questionPattern,
      answer: template.answer,
      citations: template.citations,
      confidence: template.confidence,
      status: template.status,
      mode: ref.mode ?? 'demo',
      createdAt: toTimestamp(session.startMinute + index * 6)
    };
  })
));

export const SEED_BOOKMARKS: SeedBookmark[] = [
  { userId: 'demo-user', qaPairId: pairId('seed-ark-nova-session', 0), createdAt: toTimestamp(5_230) },
  { userId: 'demo-user', qaPairId: pairId('seed-spirit-island-session', 1), createdAt: toTimestamp(5_231) },
  { userId: 'demo-user', qaPairId: pairId('seed-brass-birmingham-session', 2), createdAt: toTimestamp(5_232) },
  { userId: 'demo-user', qaPairId: pairId('seed-agricola-session', 2), createdAt: toTimestamp(5_233) },
  { userId: 'demo-user', qaPairId: pairId('demo-catan-marathon', 1), createdAt: toTimestamp(5_234) },
  { userId: 'demo-user', qaPairId: pairId('demo-wingspan-power-questions', 2), createdAt: toTimestamp(5_235) },
  { userId: 'demo-user', qaPairId: pairId('demo-dominion-late-night', 5), createdAt: toTimestamp(5_236) },
  { userId: 'demo-user', qaPairId: pairId('seed-power-grid-session', 1), createdAt: toTimestamp(5_237) },
  { userId: 'casual-cam', qaPairId: pairId('seed-azul-session', 0), createdAt: toTimestamp(5_238) },
  { userId: 'casual-cam', qaPairId: pairId('seed-cascadia-session', 0), createdAt: toTimestamp(5_239) },
  { userId: 'casual-cam', qaPairId: pairId('seed-king-of-tokyo-session', 1), createdAt: toTimestamp(5_240) },
  { userId: 'casual-cam', qaPairId: pairId('casual-kingdomino-rules-check', 0), createdAt: toTimestamp(5_241) }
];

export const SEED_FEEDBACK: SeedFeedback[] = [
  {
    sessionId: 'seed-wingspan-session',
    qaPairId: pairId('seed-wingspan-session', 0),
    rating: 'up',
    reason: 'Matched the table flow exactly and settled the brown-power order dispute instantly.',
    createdAt: toTimestamp(5_260)
  },
  {
    sessionId: 'seed-root-session',
    qaPairId: pairId('seed-root-session', 0),
    rating: 'down',
    reason: 'Helpful, but we still needed the faction-specific exception for the Vagabond and wanted a clearer casualty example.',
    createdAt: toTimestamp(5_261)
  },
  {
    sessionId: 'seed-brass-birmingham-session',
    qaPairId: pairId('seed-brass-birmingham-session', 1),
    rating: 'down',
    reason: 'Good starting point — our table also wanted to know whether merchant beer counted when the network only barely connected through a newly built rail and a contested market link.',
    createdAt: toTimestamp(5_262)
  },
  {
    sessionId: 'seed-agricola-session',
    qaPairId: pairId('seed-agricola-session', 2),
    rating: 'up',
    reason: 'The Begging card reminder was short, direct, and a little painful in exactly the right Agricola way.',
    createdAt: toTimestamp(5_263)
  },
  {
    sessionId: 'demo-catan-marathon',
    qaPairId: pairId('demo-catan-marathon', 3),
    rating: 'up',
    reason: 'Resolved a long, slightly dramatic debate that included unicode player notes like “road‑lock?” and “¿still blocked?” without losing the actual rule.',
    createdAt: toTimestamp(5_264)
  },
  {
    sessionId: 'demo-dominion-late-night',
    qaPairId: pairId('demo-dominion-late-night', 4),
    rating: 'up',
    reason: null,
    createdAt: toTimestamp(5_265)
  },
  {
    sessionId: 'casual-cascadia-quick-check',
    qaPairId: pairId('casual-cascadia-quick-check', 0),
    rating: 'up',
    reason: 'Exactly what a casual game-night table needed.',
    createdAt: toTimestamp(5_266)
  },
  {
    sessionId: 'new-pandemic-first-night',
    qaPairId: pairId('new-pandemic-first-night', 1),
    rating: 'down',
    reason: null,
    createdAt: toTimestamp(5_267)
  },
  {
    sessionId: 'seed-codenames-session',
    qaPairId: pairId('seed-codenames-session', 2),
    rating: 'up',
    reason: 'Our spymaster loved having the zero-clue rule spelled out clearly.',
    createdAt: toTimestamp(5_268)
  },
  {
    sessionId: 'seed-ark-nova-session',
    qaPairId: pairId('seed-ark-nova-session', 1),
    rating: 'down',
    reason: 'We needed a card-specific ruling for aviaries, but the general enclosure answer was still directionally useful.',
    createdAt: toTimestamp(5_269)
  }
];

export const SEED_SUMMARY = {
  userCount: SEED_USERS.length,
  gameCount: GAMES.length,
  sessionCount: SEED_SESSIONS.length,
  qaPairCount: SEED_QA_PAIRS.length,
  bookmarkCount: SEED_BOOKMARKS.length,
  collectionCount: SEED_COLLECTIONS.length,
  feedbackCount: SEED_FEEDBACK.length
};

export const SEED_EDGE_CASES = {
  longQuestionLength: Math.max(...SEED_QA_PAIRS.map((entry) => entry.question.length)),
  longestFeedbackReasonLength: Math.max(...SEED_FEEDBACK.map((entry) => entry.reason?.length ?? 0)),
  unicodeNames: SEED_USERS.map((user) => user.name).filter((name) => /[^\u0000-\u007F]/.test(name)),
  emptyOptionalFeedbackReasons: SEED_FEEDBACK.filter((entry) => !entry.reason).length,
  minConfidence: Math.min(...SEED_QA_PAIRS.map((entry) => entry.confidence)),
  maxConfidence: Math.max(...SEED_QA_PAIRS.map((entry) => entry.confidence)),
  paletteFallbackPreview: [...FALLBACK_PALETTE]
};
