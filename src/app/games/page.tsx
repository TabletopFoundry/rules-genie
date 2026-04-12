import { LibraryBrowser } from '@/components/library-browser';
import { SectionHeading } from '@/components/section-heading';
import { getCollectionGameIds, listGames } from '@/lib/db';

export default function GamesPage() {
  const games = listGames();
  const collectionIds = Array.from(getCollectionGameIds());

  return (
    <div className="space-y-8 pb-8">
      <SectionHeading
        eyebrow="Game library"
        title="Browse the supported catalog"
        description="Search by title, filter by complexity or player count, and jump into quick-start summaries or full rules chat."
      />
      <LibraryBrowser games={games} initialCollectionIds={collectionIds} />
    </div>
  );
}
