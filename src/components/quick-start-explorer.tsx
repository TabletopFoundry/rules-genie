'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { GameCover } from '@/components/game-cover';
import { resolveRequestedGameId } from '@/lib/ux';
import type { GameRecord } from '@/types';

export function QuickStartExplorer({
  games,
  initialGameId
}: {
  games: GameRecord[];
  initialGameId?: string | undefined;
}) {
  const initialSelection = useMemo(() => resolveRequestedGameId(games, initialGameId), [games, initialGameId]);
  const [selectedId, setSelectedId] = useState(initialSelection.selectedGameId);
  const validSelectedId = useMemo(() => resolveRequestedGameId(games, selectedId).selectedGameId, [games, selectedId]);
  const selectedGame = useMemo(
    () => games.find((game) => game.id === validSelectedId),
    [games, validSelectedId]
  );

  useEffect(() => {
    if (validSelectedId !== selectedId) {
      setSelectedId(validSelectedId);
    }
  }, [selectedId, validSelectedId]);

  if (!selectedGame) {
    const missingSharedGame = initialSelection.requestedGameMissing && initialSelection.requestedGameId;

    return (
      <div className="rounded-[32px] border border-dashed border-board-forest/20 bg-white p-8 shadow-card sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-board-forest">
          {missingSharedGame ? 'Shared quick-start needs a new game pick' : 'No supported games available'}
        </p>
        <h2 className="mt-3 text-3xl font-bold text-board-pine">
          {missingSharedGame ? 'Choose a supported game to open quick-start mode.' : 'No supported games available'}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          {missingSharedGame
            ? `“${missingSharedGame}” is not in the current catalog. Pick one of the supported games below before RulesGenie shows the condensed teach guide.`
            : 'The catalog is empty right now, but you can return home or reopen the library later.'}
        </p>
        {missingSharedGame ? (
          <label className="mt-6 block text-sm font-semibold text-board-pine">
            Pick a game
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="mt-2 w-full max-w-xl rounded-2xl border border-board-forest/10 px-4 py-3 text-sm text-slate-700 outline-none ring-board-gold transition focus:ring-2"
            >
              <option value="">Choose a supported game</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/games"
            className="inline-flex rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-board-pine/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
          >
            Browse supported games
          </Link>
          <Link
            href={missingSharedGame ? '/ask' : '/'}
            className="inline-flex rounded-full border border-board-forest/15 px-5 py-3 text-sm font-semibold text-board-pine transition hover:bg-board-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
          >
            {missingSharedGame ? 'Open rules assistant' : 'Go home'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {initialSelection.requestedGameMissing ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          That quick-start link asked for <span className="font-semibold">“{initialSelection.requestedGameId}”</span>,
          which is not in the current catalog. You selected <span className="font-semibold">{selectedGame.name}</span>{' '}
          to continue with a supported teach guide.
          <Link href="/games" className="ml-2 font-semibold text-amber-900 underline underline-offset-4">
            Browse supported games
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 rounded-[32px] border border-board-forest/10 bg-white p-5 shadow-card lg:grid-cols-[1.2fr_2fr]">
        <GameCover game={selectedGame} className="aspect-[4/5] h-full min-h-[300px]" />
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-board-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-board-pine">
              Quick-start mode
            </span>
            <span className="rounded-full bg-board-mist px-3 py-1 text-xs font-semibold text-board-pine">
              {selectedGame.playerMin}–{selectedGame.playerMax} players
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-board-pine">{selectedGame.name}</h2>
            <p className="text-slate-600">{selectedGame.description}</p>
          </div>
          <label className="block text-sm font-semibold text-board-pine">
            Pick a game
            <select
              value={validSelectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-board-forest/10 px-4 py-3 text-sm text-slate-700 outline-none ring-board-gold transition focus:ring-2"
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/ask?game=${selectedGame.id}`}
              className="inline-flex rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white"
            >
              Ask live rules questions
            </Link>
            <Link
              href={`/games/${selectedGame.id}`}
              className="inline-flex rounded-full border border-board-forest/15 px-5 py-3 text-sm font-semibold text-board-pine"
            >
              Open game detail
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[32px] border border-board-forest/10 bg-white p-6 shadow-card">
          <h3 className="text-xl font-bold text-board-pine">60-second rules summary</h3>
          <ol className="mt-4 space-y-4">
            {selectedGame.quickStart.map((item, index) => (
              <li key={item} className="flex gap-4 rounded-2xl bg-board-canvas p-4 text-sm text-slate-600">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-board-pine text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-[32px] border border-board-forest/10 bg-white p-6 shadow-card">
          <h3 className="text-xl font-bold text-board-pine">Setup guide</h3>
          <ol className="mt-4 space-y-4">
            {selectedGame.setupGuide.map((item, index) => (
              <li key={item} className="rounded-2xl border border-board-forest/10 p-4 text-sm text-slate-600">
                <p className="font-semibold text-board-pine">Step {index + 1}</p>
                <p className="mt-1">{item}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
