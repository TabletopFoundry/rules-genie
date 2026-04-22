import type { MockQa } from '@/types';

export const MOCK_QA: MockQa[] = [
  {
    id: 'catan-distance-rule',
    gameId: 'catan',
    questionPatterns: ['Can I build a settlement next to another player?', 'How close can settlements be in Catan?'],
    keywords: ['settlement', 'next', 'distance'],
    answer: 'No. A new settlement must be at least two road intersections away from any other settlement or city, no matter who owns it.',
    citations: [{ source: 'Base Rulebook', page: '4', section: 'Building Rules', note: 'Distance rule' }],
    confidence: 0.97,
    status: 'grounded'
  },
  {
    id: 'ticket-to-ride-locomotive',
    gameId: 'ticket-to-ride',
    questionPatterns: ['Can I draw a face-up locomotive first?', 'How do locomotives work when drawing cards?'],
    keywords: ['locomotive', 'draw', 'face-up'],
    answer: 'Yes, but if you take a face-up locomotive as your first draw, it counts as your entire card-draw action for the turn.',
    citations: [{ source: 'USA Rulebook', page: '3', section: 'Draw Train Car Cards' }],
    confidence: 0.95,
    status: 'grounded'
  },
  {
    id: 'carcassonne-monastery',
    gameId: 'carcassonne',
    questionPatterns: ['When does a monastery score?', 'How do monasteries work in Carcassonne?'],
    keywords: ['monastery', 'score'],
    answer: 'A monastery scores as soon as it is surrounded on all eight adjacent spaces. It is worth 9 points total: the monastery tile itself plus each surrounding tile.',
    citations: [{ source: 'Base Rules', page: '2', section: 'Monasteries' }],
    confidence: 0.94,
    status: 'grounded'
  },
  {
    id: 'wingspan-brown-powers',
    gameId: 'wingspan',
    questionPatterns: ['Do all brown powers trigger?', 'How do brown powers activate in Wingspan?'],
    keywords: ['brown', 'power', 'activate'],
    answer: 'When you activate a habitat, you resolve the habitat action first and then each bird’s brown power from right to left in that habitat, if its trigger conditions are met.',
    citations: [{ source: 'Core Rulebook', page: '8', section: 'Activate a Habitat' }],
    confidence: 0.93,
    status: 'grounded'
  },
  {
    id: 'gloomhaven-damage-negation',
    gameId: 'gloomhaven',
    questionPatterns: ['Can I lose a card to stop damage?', 'How do I negate damage in Gloomhaven?'],
    keywords: ['lose', 'card', 'damage'],
    answer: 'Yes. When damage would be dealt, you may lose one card from your hand or two from your discard pile to negate the entire source of damage.',
    citations: [{ source: 'Rulebook', page: '28', section: 'Suffering Damage' }],
    confidence: 0.96,
    status: 'grounded'
  },
  {
    id: 'terraforming-mars-actions',
    gameId: 'terraforming-mars',
    questionPatterns: ['Can I take two actions?', 'How many actions can I do on my turn in Terraforming Mars?'],
    keywords: ['action', 'turn'],
    answer: 'On your turn you usually take one or two actions. You can stop after one action, but you can never take more than two before play passes.',
    citations: [{ source: 'Rulebook', page: '9', section: 'Player Turns' }],
    confidence: 0.94,
    status: 'grounded'
  },
  {
    id: 'azul-factory-choice',
    gameId: 'azul',
    questionPatterns: ['Can I split colors from one factory?', 'Do I have to take all of one color in Azul?'],
    keywords: ['split', 'factory', 'color'],
    answer: 'You must take all tiles of exactly one color from the chosen factory. Any remaining tiles from that factory slide into the center of the table.',
    citations: [{ source: 'Rulebook', page: '3', section: 'Offer Phase' }],
    confidence: 0.95,
    status: 'grounded'
  },
  {
    id: 'pandemic-epidemic',
    gameId: 'pandemic',
    questionPatterns: ['What does an epidemic do?', 'When do epidemics intensify?'],
    keywords: ['epidemic', 'intensify'],
    answer: 'An epidemic increases the infection rate, infects the bottom city of the infection deck with three cubes, then shuffles the infection discard pile back on top of the deck.',
    citations: [{ source: 'Rulebook', page: '6', section: 'Resolving Epidemics' }],
    confidence: 0.95,
    status: 'grounded'
  },
  {
    id: 'root-battle-order',
    gameId: 'root',
    questionPatterns: ['Who removes pieces first in battle?', 'How is battle damage assigned in Root?'],
    keywords: ['battle', 'remove', 'damage'],
    answer: 'In battle, both sides assign hits at the same time. Defenders usually choose which of their own pieces are removed, but cardboard and faction-specific rules can change the priority.',
    citations: [{ source: 'Law of Root', page: '4', section: 'Battle' }],
    confidence: 0.82,
    status: 'low-confidence',
    suggestions: ['Mention the factions involved if this is about the Vagabond or Eyrie.', 'Call out whether buildings or tokens are present in the clearing.']
  },
  {
    id: 'scythe-stars',
    gameId: 'scythe',
    questionPatterns: ['When does the game end in Scythe?', 'How many stars end the game?'],
    keywords: ['star', 'end'],
    answer: 'The game ends immediately when a player places their sixth star. Then everyone totals coins, stars, territories, and resource bonuses to determine the winner.',
    citations: [{ source: 'Learn to Play', page: '22', section: 'Game End' }],
    confidence: 0.94,
    status: 'grounded'
  },
  {
    id: 'seven-wonders-resource-buy',
    gameId: 'seven-wonders',
    questionPatterns: ['How do I buy resources from neighbors?', 'Can I buy both left and right resources?'],
    keywords: ['buy', 'resources', 'neighbors'],
    answer: 'Yes. When you play a card, you may buy available resources from either or both adjacent neighbors. You pay coins to the neighbors, but the resources are only borrowed for that single card play.',
    citations: [{ source: 'Rulebook', page: '6', section: 'Commercial Transactions' }],
    confidence: 0.95,
    status: 'grounded'
  },
  {
    id: 'splendor-double-gem',
    gameId: 'splendor',
    questionPatterns: ['Can I take two of the same gem?', 'How do gem taking rules work in Splendor?'],
    keywords: ['two', 'same', 'gem'],
    answer: 'You can take two gems of the same color only if there are at least four tokens of that color in the supply before you take them.',
    citations: [{ source: 'Rulebook', page: '2', section: 'Take Tokens' }],
    confidence: 0.95,
    status: 'grounded'
  },
  {
    id: 'brass-overbuild',
    gameId: 'brass-birmingham',
    questionPatterns: ['Can I overbuild my own tile?', 'When may I replace an industry in Brass Birmingham?'],
    keywords: ['overbuild', 'industry', 'replace'],
    answer: 'Yes, you can overbuild one of your own industries if the new tile is the next higher level and the old one is either obsolete or the rules specifically allow overbuilding that type.',
    citations: [{ source: 'Rulebook', page: '7', section: 'Build Action' }],
    confidence: 0.86,
    status: 'low-confidence',
    suggestions: ['Name the specific industry tile you want to replace.', 'Say whether the current tile has already flipped.']
  },
  {
    id: 'spirit-island-defend',
    gameId: 'spirit-island',
    questionPatterns: ['How does defend stop blight?', 'What does defend do in Spirit Island?'],
    keywords: ['defend', 'blight'],
    answer: 'Defend reduces incoming damage to the land and Dahan in that land for the current action only. If enough damage remains after defend, blight is still added normally.',
    citations: [{ source: 'Rulebook', page: '9', section: 'Damage and Defend' }],
    confidence: 0.93,
    status: 'grounded'
  },
  {
    id: 'cascadia-nature-token',
    gameId: 'cascadia',
    questionPatterns: ['When can I use a nature token?', 'How do nature tokens work in Cascadia?'],
    keywords: ['nature', 'token'],
    answer: 'A nature token can be spent to draft any wildlife token with any habitat tile, ignoring the normal paired market restriction. You may also spend one to wipe and refill the market in some versions of the rules.',
    citations: [{ source: 'Rulebook', page: '4', section: 'Nature Tokens' }],
    confidence: 0.9,
    status: 'grounded'
  },
  {
    id: 'ark-nova-break',
    gameId: 'ark-nova',
    questionPatterns: ['What happens during a break?', 'What does break refresh in Ark Nova?'],
    keywords: ['break', 'refresh'],
    answer: 'During a break, discard cards from the display, refill the card row, refresh the association board, reset break markers, pay upkeep, and resolve income for all players.',
    citations: [{ source: 'Rulebook', page: '11', section: 'Break' }],
    confidence: 0.88,
    status: 'low-confidence',
    suggestions: ['Tell me if you are asking about X-tokens or kiosk income specifically.']
  },
  {
    id: 'everdell-basic-event',
    gameId: 'everdell',
    questionPatterns: ['Can I claim a basic event immediately?', 'How do events work in Everdell?'],
    keywords: ['basic', 'event'],
    answer: 'You may claim a basic event only when your city already meets the exact symbol requirements shown on that event tile. Claiming it uses one worker placed on the event.',
    citations: [{ source: 'Rulebook', page: '11', section: 'Events' }],
    confidence: 0.92,
    status: 'grounded'
  },
  {
    id: 'dune-imperium-board-space',
    gameId: 'dune-imperium',
    questionPatterns: ['Can I go to the same space twice?', 'Can multiple agents use the same board space in Dune Imperium?'],
    keywords: ['space', 'twice', 'agent'],
    answer: 'Normally no. Once a board space is occupied by any agent, it is blocked for the rest of the round unless the space or a card explicitly says otherwise.',
    citations: [{ source: 'Rulebook', page: '7', section: 'Agent Turns' }],
    confidence: 0.94,
    status: 'grounded'
  },
  {
    id: 'dominion-shuffle',
    gameId: 'dominion',
    questionPatterns: ['What if I need to draw from an empty deck?', 'How do I shuffle my discard into my deck in Dominion?'],
    keywords: ['empty', 'deck', 'draw'],
    answer: 'Whenever you need to draw and your deck runs out, shuffle your discard pile to form a new deck, then continue drawing the remaining cards.',
    citations: [{ source: 'Base Rules', page: '5', section: 'Drawing Cards' }],
    confidence: 0.96,
    status: 'grounded'
  },
  {
    id: 'arnak-guardians',
    gameId: 'lost-ruins-of-arnak',
    questionPatterns: ['Do I have to defeat a guardian immediately?', 'How do guardians work in Arnak?'],
    keywords: ['guardian', 'defeat'],
    answer: 'No. Uncovering a site places a guardian there right away, but defeating that guardian is optional and usually happens later when you can pay its cost and take the reward.',
    citations: [{ source: 'Rulebook', page: '8', section: 'Discovering New Sites' }],
    confidence: 0.93,
    status: 'grounded'
  },
  {
    id: 'generic-strategy',
    gameId: null,
    questionPatterns: ['What is the best move?', 'Should I do this?'],
    keywords: ['best', 'should', 'strategy'],
    answer: 'That sounds like strategy advice rather than an official rules ruling. I can still help, but I will treat it as table advice instead of a citation-backed answer.',
    citations: [{ source: 'RulesGenie Demo Mode', page: '—', section: 'Strategy Disclaimer' }],
    confidence: 0.74,
    status: 'strategy',
    suggestions: ['Ask a rules-specific question like “Can I?” or “When does this trigger?”']
  }
];
