import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CollectionToggle } from '@/components/collection-toggle';
import { GameCover } from '@/components/game-cover';
import { SectionHeading } from '@/components/section-heading';
import { getCollectionGameIds, getGameById } from '@/lib/db';
import { getComplexityLabel } from '@/lib/utils';

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGameById(id);

  if (!game) {
    notFound();
  }

  const inCollection = getCollectionGameIds().has(game.id);

  return (
    <div className="space-y-8 pb-8">
      <SectionHeading eyebrow="Game detail" title={game.name} description={game.description} />
      <section className="grid gap-8 rounded-[36px] border border-board-forest/10 bg-white p-6 shadow-card lg:grid-cols-[360px_1fr]">
        <GameCover game={game} className="aspect-[3/4] h-full" />
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-board-gold/20 px-4 py-2 text-sm font-semibold text-board-pine">{game.category}</span>
            <span className="rounded-full bg-board-mist px-4 py-2 text-sm font-semibold text-board-pine">{game.playerMin}–{game.playerMax} players</span>
            <span className="rounded-full bg-board-mist px-4 py-2 text-sm font-semibold text-board-pine">{game.playTime}</span>
            <span className="rounded-full bg-board-mist px-4 py-2 text-sm font-semibold text-board-pine">{game.complexity.toFixed(1)} · {getComplexityLabel(game.complexity)}</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-board-pine">{game.tagline}</h2>
            <p className="text-slate-600">Released in {game.year}. This RulesGenie profile includes a quick-start summary, setup guide, example prompts, and demo-mode question matching.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/ask?game=${game.id}`} className="inline-flex rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white">
              Ask a rules question
            </Link>
            <Link href={`/quick-start?game=${game.id}`} className="inline-flex rounded-full border border-board-forest/15 px-5 py-3 text-sm font-semibold text-board-pine">
              Open quick-start
            </Link>
            <CollectionToggle gameId={game.id} initialActive={inCollection} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] bg-board-canvas p-5">
              <h3 className="text-lg font-bold text-board-pine">Core mechanics</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {game.mechanics.map((mechanic) => (
                  <span key={mechanic} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-board-pine">
                    {mechanic}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] bg-board-canvas p-5">
              <h3 className="text-lg font-bold text-board-pine">Why players love it</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {game.highlights.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-board-forest/10 bg-white p-6 shadow-card">
          <h3 className="text-xl font-bold text-board-pine">Quick-start summary</h3>
          <ol className="mt-4 space-y-4">
            {game.quickStart.map((item, index) => (
              <li key={item} className="rounded-2xl border border-board-forest/10 p-4 text-sm text-slate-600">
                <p className="font-semibold text-board-pine">Rule {index + 1}</p>
                <p className="mt-1">{item}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-[32px] border border-board-forest/10 bg-white p-6 shadow-card">
          <h3 className="text-xl font-bold text-board-pine">Setup guide</h3>
          <ol className="mt-4 space-y-4">
            {game.setupGuide.map((item, index) => (
              <li key={item} className="rounded-2xl border border-board-forest/10 p-4 text-sm text-slate-600">
                <p className="font-semibold text-board-pine">Step {index + 1}</p>
                <p className="mt-1">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-[32px] border border-board-forest/10 bg-white p-6 shadow-card">
        <h3 className="text-xl font-bold text-board-pine">Example rules questions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {game.exampleQuestions.map((item) => (
            <Link key={item} href={`/ask?game=${game.id}`} className="rounded-full border border-board-forest/15 px-4 py-2 text-sm font-semibold text-board-pine">
              {item}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
