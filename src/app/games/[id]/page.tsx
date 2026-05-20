import type { Metadata } from 'next';
import Link from 'next/link';

import { CollectionToggle } from '@/components/collection-toggle';
import { GameCover } from '@/components/game-cover';
import { SectionHeading } from '@/components/section-heading';
import { getCollectionGameIds, getGameById } from '@/lib/db';
import { getMissingGameRecovery } from '@/lib/ux';
import { getComplexityLabel } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const game = getGameById(id);
  if (!game) return { title: 'Game Not Found — RulesGenie' };
  return {
    title: `${game.name} — RulesGenie`,
    description: `${game.tagline}. ${game.description.slice(0, 120)}`,
    openGraph: {
      title: `${game.name} — RulesGenie`,
      description: game.tagline,
      type: 'article'
    },
    twitter: { card: 'summary', title: `${game.name} — RulesGenie`, description: game.tagline }
  };
}

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGameById(id);

  if (!game) {
    const recovery = getMissingGameRecovery(id);

    return (
      <div className="grid min-h-[60vh] place-items-center pb-8">
        <div className="max-w-2xl rounded-[32px] border border-board-forest/10 bg-white px-8 py-10 text-center shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-board-forest">{recovery.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold text-board-pine">{recovery.title}</h1>
          <p className="mt-3 text-sm text-slate-600">{recovery.description}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/games"
              className="inline-flex rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-board-pine/90"
            >
              {recovery.browseLabel}
            </Link>
            <Link
              href="/ask"
              className="inline-flex rounded-full border border-board-forest/15 px-5 py-3 text-sm font-semibold text-board-pine transition hover:bg-board-mist"
            >
              {recovery.askLabel}
            </Link>
            <Link
              href="/quick-start"
              className="inline-flex rounded-full border border-board-forest/15 px-5 py-3 text-sm font-semibold text-board-pine transition hover:bg-board-mist"
            >
              {recovery.quickStartLabel}
            </Link>
          </div>
        </div>
      </div>
    );
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
            <Link key={item} href={`/ask?game=${game.id}&q=${encodeURIComponent(item)}`} className="rounded-full border border-board-forest/15 px-4 py-2 text-sm font-semibold text-board-pine transition hover:bg-board-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold">
              {item}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
