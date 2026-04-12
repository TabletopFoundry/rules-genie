import { DashboardClient } from '@/components/dashboard-client';
import { SectionHeading } from '@/components/section-heading';
import { getDashboardSnapshot, listGames } from '@/lib/db';

export default function DashboardPage() {
  const snapshot = getDashboardSnapshot();
  const games = listGames();

  return (
    <div className="space-y-8 pb-8">
      <SectionHeading
        eyebrow="Dashboard"
        title="Your saved collection and rules history"
        description="Mock auth keeps the experience simple for the MVP while still demonstrating persistence for collections, recent questions, and bookmarks."
      />
      <DashboardClient initialSnapshot={snapshot} games={games} />
    </div>
  );
}
