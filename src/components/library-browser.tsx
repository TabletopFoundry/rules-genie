'use client';

import { useMemo, useState } from 'react';

import { GameCard } from '@/components/game-card';
import type { GameRecord } from '@/types';

export function LibraryBrowser({ games, initialCollectionIds }: { games: GameRecord[]; initialCollectionIds: string[] }) {
  const [search, setSearch] = useState('');
  const [complexity, setComplexity] = useState('all');
  const [players, setPlayers] = useState('all');

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = `${game.name} ${game.description} ${game.category}`.toLowerCase().includes(search.toLowerCase());
      const matchesComplexity =
        complexity === 'all' ||
        (complexity === 'easy' && game.complexity < 2.2) ||
        (complexity === 'mid' && game.complexity >= 2.2 && game.complexity < 3.2) ||
        (complexity === 'heavy' && game.complexity >= 3.2);
      const matchesPlayers =
        players === 'all' ||
        (players === 'solo' && game.playerMin === 1) ||
        (players === 'two' && game.playerMin <= 2 && game.playerMax >= 2) ||
        (players === 'group' && game.playerMax >= 4);
      return matchesSearch && matchesComplexity && matchesPlayers;
    });
  }, [complexity, games, players, search]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-[32px] border border-board-forest/10 bg-white p-5 shadow-card sm:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by game, mechanic, or vibe"
          className="rounded-2xl border border-board-forest/10 px-4 py-3 text-sm outline-none ring-board-gold transition focus:ring-2"
        />
        <select value={complexity} onChange={(event) => setComplexity(event.target.value)} className="rounded-2xl border border-board-forest/10 px-4 py-3 text-sm outline-none ring-board-gold transition focus:ring-2">
          <option value="all">All complexity levels</option>
          <option value="easy">Gateway</option>
          <option value="mid">Midweight</option>
          <option value="heavy">Strategy-heavy</option>
        </select>
        <select value={players} onChange={(event) => setPlayers(event.target.value)} className="rounded-2xl border border-board-forest/10 px-4 py-3 text-sm outline-none ring-board-gold transition focus:ring-2">
          <option value="all">Any player count</option>
          <option value="solo">Soloable</option>
          <option value="two">Works at 2</option>
          <option value="group">Great with 4+</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing {filteredGames.length} supported games.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} inCollection={initialCollectionIds.includes(game.id)} />
        ))}
      </div>
      {!filteredGames.length ? (
        <div className="rounded-[28px] border border-dashed border-board-forest/20 bg-white p-10 text-center text-slate-500 shadow-card">
          No games matched that search. Try a broader term or reset the filters.
        </div>
      ) : null}
    </div>
  );
}
