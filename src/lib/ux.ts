import { COMPLEXITY_GATEWAY_MAX, COMPLEXITY_MIDWEIGHT_MAX } from './utils';
import type { GameRecord, QaRecord } from '../types';

export type AssistantModePreference = 'demo' | 'live';
export type LibraryComplexityFilter = 'all' | 'easy' | 'mid' | 'heavy';
export type LibraryPlayersFilter = 'all' | 'solo' | 'two' | 'group';

export type LibraryFilters = {
  search: string;
  complexity: LibraryComplexityFilter;
  players: LibraryPlayersFilter;
};

export type ConversationErrorKind = 'history' | 'ask';

type GameSelectionItem = Pick<GameRecord, 'id'>;

export function getPreferredAssistantMode(): AssistantModePreference {
  return process.env.RULESGENIE_DEMO_MODE === 'false' && Boolean(process.env.OPENAI_API_KEY?.trim()) ? 'live' : 'demo';
}

export function getAssistantModeOverview(preferredMode: AssistantModePreference) {
  if (preferredMode === 'live') {
    return {
      launchBadge: 'Live ready · OpenAI connected',
      statsLabel: 'Assistant status',
      statsValue: 'Live ready',
      statsDescription: 'OpenAI is connected for live rulings grounded in the same curated RulesGenie context.',
      sampleQuestionDescription:
        'RulesGenie will answer with live AI first, then keep the exchange in your local session history.',
      askDescription:
        'Live mode is ready. RulesGenie will use OpenAI for new questions, then fall back to demo answers only if a live request fails.',
      footerNote:
        'Live mode is active. If OpenAI becomes unavailable, RulesGenie falls back to demo answers and tells you.',
      healthSummary: 'OpenAI is configured for live responses.'
    };
  }

  return {
    launchBadge: 'Demo ready · mock mode included',
    statsLabel: 'Works without keys',
    statsValue: 'Demo',
    statsDescription: 'Demo answers work without API keys while preserving citations, bookmarks, and local session history.',
    sampleQuestionDescription:
      'RulesGenie will answer instantly in demo mode, then remember the exchange in your local session history.',
    askDescription:
      'Demo mode works out of the box. Add an OpenAI key later if you want live production-style generation grounded in the same curated context.',
    footerNote:
      'Demo mode works without API keys. Add OpenAI credentials later if you want live production-style answers.',
    healthSummary: 'Demo answers are active because demo mode is enabled or no OpenAI key is configured.'
  };
}

export function resolveRequestedGameId<T extends GameSelectionItem>(games: T[], requestedGameId?: string) {
  const fallbackGameId = games[0]?.id ?? '';

  if (!requestedGameId) {
    return { selectedGameId: fallbackGameId, requestedGameMissing: false };
  }

  if (games.some((game) => game.id === requestedGameId)) {
    return { selectedGameId: requestedGameId, requestedGameMissing: false };
  }

  return { selectedGameId: fallbackGameId, requestedGameMissing: true, requestedGameId };
}

export function getConversationErrorAction(kind: ConversationErrorKind, prompt?: string) {
  if (kind === 'history') {
    return {
      label: 'Reload conversation',
      hint: 'Refresh this game\'s saved rulings without leaving the table.'
    };
  }

  const trimmedPrompt = prompt?.trim();

  return {
    label: 'Retry last question',
    hint: trimmedPrompt
      ? `Send “${trimmedPrompt}” again without retyping it.`
      : 'Send the last rules question again without retyping it.'
  };
}

export function filterGames(games: GameRecord[], filters: LibraryFilters) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return games.filter((game) => {
    const matchesSearch =
      !normalizedSearch ||
      `${game.name} ${game.description} ${game.category} ${game.mechanics.join(' ')} ${game.highlights.join(' ')}`
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesComplexity =
      filters.complexity === 'all' ||
      (filters.complexity === 'easy' && game.complexity < COMPLEXITY_GATEWAY_MAX) ||
      (filters.complexity === 'mid' &&
        game.complexity >= COMPLEXITY_GATEWAY_MAX &&
        game.complexity < COMPLEXITY_MIDWEIGHT_MAX) ||
      (filters.complexity === 'heavy' && game.complexity >= COMPLEXITY_MIDWEIGHT_MAX);

    const matchesPlayers =
      filters.players === 'all' ||
      (filters.players === 'solo' && game.playerMin === 1) ||
      (filters.players === 'two' && game.playerMin <= 2 && game.playerMax >= 2) ||
      (filters.players === 'group' && game.playerMax >= 4);

    return matchesSearch && matchesComplexity && matchesPlayers;
  });
}

export function getActiveLibraryFilters(filters: LibraryFilters) {
  const activeFilters: string[] = [];

  if (filters.search.trim()) {
    activeFilters.push(`Search: “${filters.search.trim()}”`);
  }

  if (filters.complexity !== 'all') {
    activeFilters.push(
      filters.complexity === 'easy'
        ? 'Complexity: Gateway'
        : filters.complexity === 'mid'
          ? 'Complexity: Midweight'
          : 'Complexity: Strategy-heavy'
    );
  }

  if (filters.players !== 'all') {
    activeFilters.push(
      filters.players === 'solo'
        ? 'Players: Soloable'
        : filters.players === 'two'
          ? 'Players: Works at 2'
          : 'Players: Great with 4+'
    );
  }

  return activeFilters;
}

export function describeAssistantMode(preferredMode: AssistantModePreference, lastMode?: QaRecord['mode']) {
  if (lastMode === 'fallback') {
    return {
      badgeLabel: 'Fallback mode',
      badgeTone: 'bg-amber-100',
      description:
        'Live AI was unavailable for the last ruling, so RulesGenie used the demo engine instead and kept the same citation and session flow.'
    };
  }

  if (lastMode === 'openai') {
    return {
      badgeLabel: 'Live mode',
      badgeTone: 'bg-green-100',
      description: 'The last ruling used OpenAI with your current conversation for extra context.'
    };
  }

  if (preferredMode === 'live') {
    return {
      badgeLabel: 'Live mode',
      badgeTone: 'bg-green-100',
      description:
        'OpenAI is ready for new questions. If a live request fails, RulesGenie will fall back to demo mode and tell you.'
    };
  }

  return {
    badgeLabel: 'Demo mode',
    badgeTone: 'bg-board-gold/15',
    description: 'Demo answers work without API keys and still keep citations, bookmarks, and local session history.'
  };
}
