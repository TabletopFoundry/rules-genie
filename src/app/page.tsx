import Link from 'next/link';
import { BookOpen, LibraryBig, MessageCircleQuestion, Sparkles } from 'lucide-react';

import { FeatureCard } from '@/components/feature-card';
import { GameCard } from '@/components/game-card';
import { SectionHeading } from '@/components/section-heading';
import { getCollectionGameIds, getFeaturedGames } from '@/lib/db';

export default function HomePage() {
  const featuredGames = getFeaturedGames();
  const collectionIds = Array.from(getCollectionGameIds());

  return (
    <div className="space-y-16 pb-10">
      <section className="grid gap-8 overflow-hidden rounded-[40px] border border-board-forest/10 bg-white px-6 py-10 shadow-card lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-14">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-board-gold/20 px-4 py-2 text-sm font-semibold text-board-pine">MVP ready · mock mode included</span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight text-board-pine sm:text-6xl">
              Stop flipping through rulebooks. Get the ruling in seconds.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              RulesGenie is your AI-powered board game rules assistant with visible citations, a searchable game library, fast quick-start guides, and a lightweight personal dashboard for saved answers.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/ask" className="inline-flex rounded-full bg-board-pine px-6 py-3 text-sm font-semibold text-white">
              Try the assistant
            </Link>
            <Link href="/games" className="inline-flex rounded-full border border-board-forest/15 px-6 py-3 text-sm font-semibold text-board-pine">
              Browse supported games
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-board-canvas p-4">
              <p className="text-sm text-slate-500">Supported games</p>
              <p className="mt-2 text-3xl font-black text-board-pine">20</p>
            </div>
            <div className="rounded-3xl bg-board-canvas p-4">
              <p className="text-sm text-slate-500">Works without keys</p>
              <p className="mt-2 text-3xl font-black text-board-pine">Demo</p>
            </div>
            <div className="rounded-3xl bg-board-canvas p-4">
              <p className="text-sm text-slate-500">Quick-start lessons</p>
              <p className="mt-2 text-3xl font-black text-board-pine">Included</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[32px] bg-board-pine p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">What you can do</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/85">
              <li>• Ask natural-language rules questions for popular modern board games.</li>
              <li>• Inspect source citations by page and section.</li>
              <li>• Browse a curated game library with filters and detail pages.</li>
              <li>• Save favorite answers and revisit them on the dashboard.</li>
            </ul>
          </div>
          <div className="rounded-[32px] border border-board-forest/10 bg-board-canvas p-6 text-board-pine">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-board-forest">Try this first</p>
            <p className="mt-3 text-2xl font-bold">“Can I draw a face-up locomotive first?”</p>
            <p className="mt-3 text-sm text-slate-600">RulesGenie will answer instantly in demo mode, then remember the exchange in your session history.</p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Why players use it"
          title="Built for fast rulings at the table"
          description="The MVP focuses on the jobs players actually need during setup, play, and teach moments."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard icon={<MessageCircleQuestion className="h-6 w-6" />} title="Rules Q&A" description="Chat-style answers with game-aware session memory and source citations." />
          <FeatureCard icon={<LibraryBig className="h-6 w-6" />} title="Game library" description="Search and filter a curated list of popular board games with rich metadata." />
          <FeatureCard icon={<BookOpen className="h-6 w-6" />} title="Quick-start mode" description="Compressed rules summaries and setup guides for faster teaches." />
          <FeatureCard icon={<Sparkles className="h-6 w-6" />} title="Saved answers" description="Mock-auth dashboard for collections, recent questions, and bookmarks." />
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Featured catalog"
          title="Start with proven favorites"
          description="Jump right into the assistant with a library of modern classics and evergreen hits."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredGames.map((game) => (
            <GameCard key={game.id} game={game} inCollection={collectionIds.includes(game.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}
