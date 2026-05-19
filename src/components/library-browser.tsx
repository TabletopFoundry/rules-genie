'use client';

import { useMemo, useState } from 'react';

import { GameCard } from '@/components/game-card';
import {
  filterGames,
  getActiveLibraryFilters,
  type LibraryComplexityFilter,
  type LibraryFilters,
  type LibraryPlayersFilter
} from '@/lib/ux';
import type { GameRecord } from '@/types';

export function LibraryBrowser({
  games,
  initialCollectionIds
}: {
  games: GameRecord[];
  initialCollectionIds: string[];
}) {
  const [search, setSearch] = useState('');
  const [complexity, setComplexity] = useState<LibraryComplexityFilter>('all');
  const [players, setPlayers] = useState<LibraryPlayersFilter>('all');

  const filters = useMemo<LibraryFilters>(() => ({ search, complexity, players }), [complexity, players, search]);
  const filteredGames = useMemo(() => filterGames(games, filters), [filters, games]);
  const activeFilters = useMemo(() => getActiveLibraryFilters(filters), [filters]);

  function resetFilters() {
    setSearch('');
    setComplexity('all');
    setPlayers('all');
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-[32px] border border-board-forest/10 bg-white p-5 shadow-card">
        <div className="grid gap-4 sm:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by game, mechanic, or vibe"
            aria-label="Search games by name, mechanic, or theme"
            className="rounded-2xl border border-board-forest/10 px-4 py-3 text-sm outline-none ring-board-gold transition focus:ring-2"
          />
          <select
            value={complexity}
            onChange={(event) => setComplexity(event.target.value as LibraryComplexityFilter)}
            aria-label="Filter by complexity"
            className="rounded-2xl border border-board-forest/10 px-4 py-3 text-sm outline-none ring-board-gold transition focus:ring-2"
          >
            <option value="all">All complexity levels</option>
            <option value="easy">Gateway</option>
            <option value="mid">Midweight</option>
            <option value="heavy">Strategy-heavy</option>
          </select>
          <select
            value={players}
            onChange={(event) => setPlayers(event.target.value as LibraryPlayersFilter)}
            aria-label="Filter by player count"
            className="rounded-2xl border border-board-forest/10 px-4 py-3 text-sm outline-none ring-board-gold transition focus:ring-2"
          >
            <option value="all">Any player count</option>
            <option value="solo">Soloable</option>
            <option value="two">Works at 2</option>
            <option value="group">Great with 4+</option>
          </select>
        </div>

        {activeFilters.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <span key={filter} className="rounded-full bg-board-mist px-3 py-1 text-xs font-semibold text-board-pine">
                {filter}
              </span>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-board-forest/15 px-3 py-1 text-xs font-semibold text-board-pine transition hover:bg-board-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500" role="status" aria-live="polite">
          Showing {filteredGames.length} supported games{activeFilters.length ? ` · ${activeFilters.join(' · ')}` : '.'}
        </p>
        {activeFilters.length ? (
          <button
            type="button"
            onClick={resetFilters}
            className="w-fit rounded-full border border-board-forest/15 px-4 py-2 text-sm font-semibold text-board-pine transition hover:bg-board-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
          >
            Clear all filters
          </button>
        ) : null}
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} inCollection={initialCollectionIds.includes(game.id)} />
        ))}
      </div>
      {!filteredGames.length ? (
        <div className="rounded-[28px] border border-dashed border-board-forest/20 bg-white p-10 text-center text-slate-500 shadow-card">
          <p>No games matched the current filters.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-board-pine/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
          >
            Reset search and filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
