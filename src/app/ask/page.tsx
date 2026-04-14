import { ChatInterface } from '@/components/chat-interface';
import { SectionHeading } from '@/components/section-heading';
import { listGames } from '@/lib/db';

export default async function AskPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const initialGameId = typeof params.game === 'string' ? params.game : undefined;
  const initialQuestion = typeof params.q === 'string' ? params.q : undefined;
  const games = listGames();

  return (
    <div className="space-y-8 pb-8">
      <SectionHeading
        eyebrow="Rules assistant"
        title="Ask a rules question and keep the game moving"
        description="Demo mode works out of the box. Add an OpenAI key later if you want production-style generation grounded in the same curated context."
      />
      <ChatInterface games={games} initialGameId={initialGameId} initialQuestion={initialQuestion} />
    </div>
  );
}
