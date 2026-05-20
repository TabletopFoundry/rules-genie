'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { ActionFeedback } from '@/components/action-feedback';
import { CitationList } from '@/components/citation-list';
import { StatusPill } from '@/components/status-pill';
import { ToggleResponseSchema } from '@/lib/api-schemas';
import { safeJsonParse } from '@/lib/fetch-utils';
import { getBookmarkPendingSummary, getCollectionPendingSummary } from '@/lib/ux';
import { timeAgo } from '@/lib/utils';
import type { DashboardSnapshot, GameRecord } from '@/types';

export function DashboardClient({
  initialSnapshot,
  games
}: {
  initialSnapshot: DashboardSnapshot;
  games: GameRecord[];
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [addingGameId, setAddingGameId] = useState<string | null>(null);
  const [pendingCollectionIds, setPendingCollectionIds] = useState<string[]>([]);
  const [pendingBookmarkIds, setPendingBookmarkIds] = useState<string[]>([]);
  const [mutationFeedback, setMutationFeedback] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);

  const addableGames = useMemo(
    () => games.filter((game) => !snapshot.collection.some((owned) => owned.id === game.id)),
    [games, snapshot.collection]
  );

  async function toggleCollection(gameId: string) {
    setMutationFeedback(null);
    try {
      const response = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });

      if (!response.ok) {
        throw new Error('Could not update your collection. Please try again.');
      }

      const raw = await safeJsonParse<unknown>(response, 'Could not update your collection. Please try again.');
      const payload = ToggleResponseSchema.parse(raw);
      const game = games.find((item) => item.id === gameId);
      if (!game) return;

      setSnapshot((current) => ({
        ...current,
        collection: payload.active
          ? [...current.collection, game].sort((a, b) => a.name.localeCompare(b.name))
          : current.collection.filter((item) => item.id !== gameId)
      }));
      setMutationFeedback({
        tone: 'success',
        message: payload.active ? `${game.name} added to your collection.` : `${game.name} removed from your collection.`
      });
    } catch (err) {
      setMutationFeedback({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      });
    }
  }

  async function removeBookmark(qaPairId: string) {
    setMutationFeedback(null);
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qaPairId, action: 'remove' })
      });

      if (!response.ok) {
        throw new Error('Could not remove bookmark. Please try again.');
      }

      const raw = await safeJsonParse<unknown>(response, 'Could not remove bookmark.');
      const payload = ToggleResponseSchema.parse(raw);

      if (payload.active) {
        return;
      }

      setSnapshot((current) => ({
        ...current,
        bookmarks: current.bookmarks.filter((item) => item.id !== qaPairId),
        recentQuestions: current.recentQuestions.map((item) =>
          item.id === qaPairId ? { ...item, bookmarked: false } : item
        )
      }));
      setMutationFeedback({
        tone: 'success',
        message: 'Bookmark removed from saved answers.'
      });
    } catch (err) {
      setMutationFeedback({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      });
    }
  }

  async function handleAddGame() {
    if (!selectedGameId) return;
    const gameId = selectedGameId;
    setAddingGameId(gameId);
    try {
      await toggleCollection(gameId);
      setSelectedGameId('');
    } finally {
      setAddingGameId(null);
    }
  }

  async function handleRemoveCollection(gameId: string) {
    setPendingCollectionIds((current) => (current.includes(gameId) ? current : [...current, gameId]));
    try {
      await toggleCollection(gameId);
    } finally {
      setPendingCollectionIds((current) => current.filter((id) => id !== gameId));
    }
  }

  async function handleRemoveBookmark(qaPairId: string) {
    setPendingBookmarkIds((current) => (current.includes(qaPairId) ? current : [...current, qaPairId]));
    try {
      await removeBookmark(qaPairId);
    } finally {
      setPendingBookmarkIds((current) => current.filter((id) => id !== qaPairId));
    }
  }

  const addingGameName = addingGameId ? games.find((game) => game.id === addingGameId)?.name : undefined;

  return (
    <div className="space-y-8">
      <ActionFeedback
        message={mutationFeedback?.message}
        tone={mutationFeedback?.tone}
        onDismiss={() => setMutationFeedback(null)}
      />
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[32px] border border-board-forest/10 bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-board-forest">Mock auth</p>
          <h2 className="mt-3 text-3xl font-bold text-board-pine">
            Welcome back, {snapshot.profile.name.split(' ')[0]}.
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Your dashboard keeps a lightweight local history in SQLite. Use it to manage your collection, revisit recent
            rulings, and save the answers you want at the table.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-board-mist px-4 py-2 font-semibold text-board-pine">
              {snapshot.profile.email}
            </span>
            <span className="rounded-full bg-board-gold/20 px-4 py-2 font-semibold text-board-pine">
              {snapshot.profile.mode}
            </span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-[28px] border border-board-forest/10 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">Collection</p>
            <p className="mt-2 text-3xl font-black text-board-pine">{snapshot.collection.length}</p>
          </div>
          <div className="rounded-[28px] border border-board-forest/10 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">Recent questions</p>
            <p className="mt-2 text-3xl font-black text-board-pine">{snapshot.recentQuestions.length}</p>
          </div>
          <div className="rounded-[28px] border border-board-forest/10 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">Saved answers</p>
            <p className="mt-2 text-3xl font-black text-board-pine">{snapshot.bookmarks.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/ask"
          className="rounded-[28px] border border-board-forest/10 bg-white p-5 shadow-card transition hover:border-board-forest/20 hover:bg-board-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-board-forest">Quick action</p>
          <h3 className="mt-3 text-xl font-bold text-board-pine">Ask for a ruling</h3>
          <p className="mt-2 text-sm text-slate-600">
            Jump back into the assistant with your saved local session history.
          </p>
        </Link>
        <Link
          href="/quick-start"
          className="rounded-[28px] border border-board-forest/10 bg-white p-5 shadow-card transition hover:border-board-forest/20 hover:bg-board-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-board-forest">Quick action</p>
          <h3 className="mt-3 text-xl font-bold text-board-pine">Teach a game faster</h3>
          <p className="mt-2 text-sm text-slate-600">
            Open the quick-start explorer when you need setup reminders before play.
          </p>
        </Link>
        <Link
          href="/games"
          className="rounded-[28px] border border-board-forest/10 bg-white p-5 shadow-card transition hover:border-board-forest/20 hover:bg-board-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-board-forest">Quick action</p>
          <h3 className="mt-3 text-xl font-bold text-board-pine">Browse the catalog</h3>
          <p className="mt-2 text-sm text-slate-600">
            Find another supported title, then add it to your collection or open its detail page.
          </p>
        </Link>
      </section>

      <section className="rounded-[32px] border border-board-forest/10 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-board-pine">Manage your collection</h3>
            <p className="text-sm text-slate-600">Add games you want fast access to during game night.</p>
            <p className="mt-2 text-xs text-slate-500" aria-live="polite">
              {getCollectionPendingSummary(addingGameName, pendingCollectionIds.length)}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedGameId}
              onChange={(event) => setSelectedGameId(event.target.value)}
              aria-label="Choose a game to add to your collection"
              className="w-full sm:min-w-[240px] rounded-2xl border border-board-forest/10 px-4 py-3 text-sm text-slate-700 outline-none ring-board-gold transition focus:ring-2"
            >
              <option value="">Choose a game to add</option>
              {addableGames.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedGameId || Boolean(addingGameId)}
              onClick={() => void handleAddGame()}
              className="rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-board-pine/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-board-pine/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
            >
              {addingGameId ? 'Adding…' : 'Add game'}
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.collection.map((game) => (
            <div key={game.id} className="rounded-[28px] border border-board-forest/10 bg-board-canvas p-5">
              <p className="text-sm font-semibold text-board-forest">{game.category}</p>
              <h4 className="mt-2 text-xl font-bold text-board-pine">{game.name}</h4>
              <p className="mt-2 text-sm text-slate-600">{game.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/ask?game=${game.id}`}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-board-pine transition hover:bg-board-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
                >
                  Open assistant
                </Link>
                <button
                  type="button"
                  aria-label={`Remove ${game.name} from collection`}
                  disabled={pendingCollectionIds.includes(game.id)}
                  onClick={() => void handleRemoveCollection(game.id)}
                  className="rounded-full border border-board-forest/15 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-board-mist hover:text-board-pine disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
                >
                  {pendingCollectionIds.includes(game.id) ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
          {!snapshot.collection.length ? (
            <div className="rounded-[28px] border border-dashed border-board-forest/20 p-8 text-sm text-slate-500">
              <p>No games saved yet. Add one above to build your library.</p>
              <Link
                href="/games"
                className="mt-4 inline-flex rounded-full bg-board-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-board-pine/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
              >
                Browse supported games
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-board-forest/10 bg-white p-6 shadow-card">
          <h3 className="text-2xl font-bold text-board-pine">Recent questions</h3>
          <div className="mt-5 space-y-4">
            {snapshot.recentQuestions.map((item) => {
              const game = games.find((gameEntry) => gameEntry.id === item.gameId);
              return (
                <div key={item.id} className="rounded-2xl border border-board-forest/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-board-forest">{game?.name ?? 'Supported game'}</p>
                    <span className="text-xs text-slate-400">{timeAgo(item.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-board-pine">{item.question}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <StatusPill status={item.status} />
                    <Link
                      href={`/ask?game=${item.gameId}`}
                      className="text-sm font-semibold text-board-forest transition hover:text-board-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:rounded"
                    >
                      Continue asking →
                    </Link>
                    <Link
                      href={`/quick-start?game=${item.gameId}`}
                      className="text-sm font-semibold text-slate-500 transition hover:text-board-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:rounded"
                    >
                      Open quick-start
                    </Link>
                  </div>
                </div>
              );
            })}
            {!snapshot.recentQuestions.length ? (
              <div className="rounded-2xl border border-dashed border-board-forest/20 p-5 text-sm text-slate-500">
                <p>Ask a rules question to see it here.</p>
                <Link
                  href="/ask"
                  className="mt-3 inline-flex rounded-full bg-board-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-board-pine/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
                >
                  Open the assistant
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[32px] border border-board-forest/10 bg-white p-6 shadow-card">
          <h3 className="text-2xl font-bold text-board-pine">Saved answers</h3>
          <p className="mt-2 text-sm text-slate-600" aria-live="polite">
            {getBookmarkPendingSummary(pendingBookmarkIds.length)}
          </p>
          <div className="mt-5 space-y-4">
            {snapshot.bookmarks.map((item) => {
              const game = games.find((gameEntry) => gameEntry.id === item.gameId);
              return (
                <div key={item.id} className="rounded-2xl border border-board-forest/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-board-forest">{game?.name ?? 'Supported game'}</p>
                    <button
                      type="button"
                      aria-label={`Remove bookmark for: ${item.question.slice(0, 60)}`}
                      disabled={pendingBookmarkIds.includes(item.id)}
                      onClick={() => void handleRemoveBookmark(item.id)}
                      className="text-xs font-semibold text-slate-500 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:rounded"
                    >
                      {pendingBookmarkIds.includes(item.id) ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-board-pine">{item.question}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                  <div className="mt-3">
                    <CitationList citations={item.citations} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                      href={`/ask?game=${item.gameId}`}
                      className="text-sm font-semibold text-board-forest transition hover:text-board-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:rounded"
                    >
                      Open assistant →
                    </Link>
                    <Link
                      href={`/quick-start?game=${item.gameId}`}
                      className="text-sm font-semibold text-slate-500 transition hover:text-board-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:rounded"
                    >
                      Review quick-start
                    </Link>
                  </div>
                </div>
              );
            })}
            {!snapshot.bookmarks.length ? (
              <div className="rounded-2xl border border-dashed border-board-forest/20 p-5 text-sm text-slate-500">
                <p>Bookmark answers from the chat screen to keep them handy.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="/ask"
                    className="inline-flex rounded-full bg-board-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-board-pine/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
                  >
                    Open the assistant
                  </Link>
                  <Link
                    href="/quick-start"
                    className="inline-flex rounded-full border border-board-forest/15 px-4 py-2 text-sm font-semibold text-board-pine transition hover:bg-board-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
                  >
                    Browse quick-starts
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
