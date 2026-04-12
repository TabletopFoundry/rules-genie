import Link from 'next/link';

import { CollectionToggle } from '@/components/collection-toggle';
import { GameCover } from '@/components/game-cover';
import { getComplexityLabel } from '@/lib/utils';
import type { GameRecord } from '@/types';

export function GameCard({ game, inCollection = false }: { game: GameRecord; inCollection?: boolean }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-board-forest/10 bg-white shadow-card">
      <Link href={`/games/${game.id}`} className="block">
        <GameCover game={game} className="aspect-[3/4] w-full" />
      </Link>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-board-forest">{game.category}</p>
          <Link href={`/games/${game.id}`}>
            <h3 className="mt-2 text-xl font-bold text-board-pine">{game.name}</h3>
          </Link>
          <p className="mt-2 text-sm text-slate-600">{game.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
          <p>Players: {game.playerMin}–{game.playerMax}</p>
          <p>Time: {game.playTime}</p>
          <p>Complexity: {game.complexity.toFixed(1)}</p>
          <p>{getComplexityLabel(game.complexity)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {game.mechanics.slice(0, 3).map((mechanic) => (
            <span key={mechanic} className="rounded-full bg-board-mist px-3 py-1 text-xs font-semibold text-board-pine">
              {mechanic}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/ask?game=${game.id}`} className="inline-flex items-center rounded-full bg-board-pine px-4 py-2 text-sm font-semibold text-white">
            Ask a question
          </Link>
          <CollectionToggle gameId={game.id} initialActive={inCollection} />
        </div>
      </div>
    </article>
  );
}
