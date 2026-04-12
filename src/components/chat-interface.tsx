'use client';

import { useEffect, useMemo, useState } from 'react';

import { BookmarkToggle } from '@/components/bookmark-toggle';
import { CitationList } from '@/components/citation-list';
import { FeedbackControls } from '@/components/feedback-controls';
import { StatusPill } from '@/components/status-pill';
import type { GameRecord, QaRecord } from '@/types';

function makeSessionKey(gameId: string) {
  return `rulesgenie-session:${gameId}`;
}

function createSessionId() {
  if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ChatInterface({ games, initialGameId }: { games: GameRecord[]; initialGameId?: string }) {
  const [selectedGameId, setSelectedGameId] = useState(initialGameId ?? games[0]?.id ?? '');
  const [sessionId, setSessionId] = useState('');
  const [history, setHistory] = useState<QaRecord[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [error, setError] = useState('');

  const selectedGame = useMemo(() => games.find((game) => game.id === selectedGameId) ?? games[0], [games, selectedGameId]);

  useEffect(() => {
    if (!selectedGameId) return;
    const storageKey = makeSessionKey(selectedGameId);
    const existing = window.localStorage.getItem(storageKey);
    const nextSessionId = existing ?? createSessionId();
    if (!existing) {
      window.localStorage.setItem(storageKey, nextSessionId);
    }
    setSessionId(nextSessionId);
  }, [selectedGameId]);

  useEffect(() => {
    if (!sessionId || !selectedGameId) return;

    setHydrating(true);
    fetch(`/api/session?sessionId=${sessionId}&gameId=${selectedGameId}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Could not load conversation history.');
        }
        return (await response.json()) as { items: QaRecord[] };
      })
      .then((payload) => setHistory(payload.items))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load conversation history.'))
      .finally(() => setHydrating(false));
  }, [selectedGameId, sessionId]);

  async function askQuestion(prefilledQuestion?: string) {
    const prompt = (prefilledQuestion ?? question).trim();
    if (!prompt || !selectedGame || !sessionId) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, gameId: selectedGame.id, question: prompt })
      });

      const payload = (await response.json()) as { item?: QaRecord; error?: string };
      if (!response.ok || !payload.item) {
        throw new Error(payload.error ?? 'RulesGenie could not answer right now.');
      }

      setHistory((current) => [...current, payload.item as QaRecord]);
      setQuestion('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'RulesGenie could not answer right now.');
    } finally {
      setLoading(false);
    }
  }

  if (!selectedGame) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="space-y-5 rounded-[32px] border border-board-forest/10 bg-white p-5 shadow-card xl:sticky xl:top-24 xl:h-fit">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-board-forest">Session</p>
          <h2 className="mt-2 text-2xl font-bold text-board-pine">Rules Q&A</h2>
          <p className="mt-2 text-sm text-slate-600">Choose a supported game, then ask plain-English rules questions with session memory and visible citations.</p>
        </div>
        <label className="block text-sm font-semibold text-board-pine">
          Supported game
          <select
            value={selectedGameId}
            onChange={(event) => setSelectedGameId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-board-forest/10 px-4 py-3 text-sm text-slate-700 outline-none ring-board-gold transition focus:ring-2"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-2xl bg-board-canvas p-4">
          <p className="text-sm font-semibold text-board-pine">{selectedGame.name}</p>
          <p className="mt-1 text-sm text-slate-600">{selectedGame.tagline}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Example prompts</p>
          <div className="mt-3 flex flex-col gap-2">
            {selectedGame.exampleQuestions.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setQuestion(example);
                  void askQuestion(example);
                }}
                className="rounded-2xl border border-board-forest/10 bg-white px-3 py-3 text-left text-sm text-slate-600 transition hover:border-board-forest/30"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-board-forest/10 p-4 text-sm text-slate-600">
          <p className="font-semibold text-board-pine">Quick-start reminders</p>
          <ul className="mt-3 space-y-2">
            {selectedGame.quickStart.slice(0, 3).map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="rounded-[32px] border border-board-forest/10 bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-board-forest/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-board-forest">Conversation</p>
            <h3 className="mt-2 text-2xl font-bold text-board-pine">{selectedGame.name}</h3>
          </div>
          <div className="rounded-full bg-board-gold/15 px-4 py-2 text-sm font-semibold text-board-pine">
            Demo mode {loading ? '· answering…' : 'ready'}
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {hydrating ? <p className="text-sm text-slate-500">Loading your conversation…</p> : null}
          {!hydrating && !history.length ? (
            <div className="rounded-[28px] border border-dashed border-board-forest/20 bg-board-canvas p-8 text-sm text-slate-600">
              No questions yet. Start with one of the example prompts or type a rules dispute below.
            </div>
          ) : null}
          {history.map((item) => (
            <div key={item.id} className="space-y-4 rounded-[28px] border border-board-forest/10 p-5">
              <div className="rounded-3xl bg-board-pine px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Player asked</p>
                <p className="mt-2 text-base font-semibold">{item.question}</p>
              </div>
              <div className="space-y-4 rounded-3xl bg-board-canvas px-5 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StatusPill status={item.status} />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Confidence {Math.round(item.confidence * 100)}%</p>
                </div>
                <p className="text-sm leading-7 text-slate-700">{item.answer}</p>
                <CitationList citations={item.citations} />
                {item.bookmarked !== undefined ? <BookmarkToggle qaPairId={item.id} initialActive={item.bookmarked} /> : null}
                {item.feedbackRating !== undefined ? <FeedbackControls qaPair={item} /> : null}
              </div>
            </div>
          ))}
          {loading ? (
            <div className="rounded-[28px] border border-board-forest/10 bg-board-canvas p-5 text-sm text-slate-600">
              Searching the rules reference and drafting a concise ruling…
            </div>
          ) : null}
          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        </div>

        <div className="mt-6 rounded-[28px] border border-board-forest/10 bg-slate-50 p-4">
          <label className="sr-only" htmlFor="rules-question">
            Ask a rules question
          </label>
          <textarea
            id="rules-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={`Ask a ${selectedGame.name} rules question…`}
            className="min-h-[130px] w-full rounded-3xl border border-board-forest/10 bg-white px-4 py-4 text-sm text-slate-700 outline-none ring-board-gold transition focus:ring-2"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Conversation history is remembered per game session on this device.</p>
            <button
              type="button"
              onClick={() => void askQuestion()}
              disabled={loading || !question.trim()}
              className="rounded-full bg-board-pine px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? 'Answering…' : 'Ask RulesGenie'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
