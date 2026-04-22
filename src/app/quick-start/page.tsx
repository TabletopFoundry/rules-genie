import type { Metadata } from 'next';

import { QuickStartExplorer } from '@/components/quick-start-explorer';
import { SectionHeading } from '@/components/section-heading';
import { listGames } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Quick Start — RulesGenie',
  description: 'Compressed rules summaries and step-by-step setup guides for faster board game teaches.',
  openGraph: { title: 'Quick Start — RulesGenie', description: 'Teach the game faster with condensed rules summaries.' },
  twitter: { card: 'summary', title: 'Quick Start — RulesGenie', description: 'Teach the game faster with condensed rules summaries.' }
};

export default async function QuickStartPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const initialGameId = typeof params.game === 'string' ? params.game : undefined;
  const games = listGames();

  return (
    <div className="space-y-8 pb-8">
      <SectionHeading
        eyebrow="Quick-start mode"
        title="Teach the game faster"
        description="Use a condensed rules summary and step-by-step setup guide before you open the live assistant for edge cases."
      />
      <QuickStartExplorer games={games} initialGameId={initialGameId} />
    </div>
  );
}
