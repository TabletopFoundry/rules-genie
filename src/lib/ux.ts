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

type GameSelectionItem = Pick<GameRecord, 'id'>;

export function resolveRequestedGameId<T extends GameSelectionItem>(games: T[], requestedGameId?: string) {
  const fallbackGameId = games[0]?.id ?? '';

  if (!requestedGameId) {
    return { selectedGameId: fallbackGameId, requestedGameMissing: false };
  }

  if (games.some((game) => game.id === requestedGameId)) {
    return { selectedGameId: requestedGameId, requestedGameMissing: false };
  }

  return { selectedGameId: fallbackGameId, requestedGameMissing: true };
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
