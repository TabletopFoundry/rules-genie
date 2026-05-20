'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ConversationThread } from '@/components/conversation-thread';
import { useConversation } from '@/components/hooks/use-conversation';
import { useRulesSession } from '@/components/hooks/use-rules-session';
import { QuestionInput } from '@/components/question-input';
import {
  describeAssistantMode,
  getConversationErrorAction,
  resolveRequestedGameId,
  type AssistantModePreference
} from '@/lib/ux';
import type { GameRecord } from '@/types';

export function ChatInterface({
  games,
  initialGameId,
  initialQuestion,
  preferredMode
}: {
  games: GameRecord[];
  initialGameId?: string | undefined;
  initialQuestion?: string | undefined;
  preferredMode: AssistantModePreference;
}) {
  const initialSelection = useMemo(() => resolveRequestedGameId(games, initialGameId), [games, initialGameId]);
  const [selectedGameId, setSelectedGameId] = useState(initialSelection.selectedGameId);
  const [question, setQuestion] = useState(initialQuestion ?? '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const validSelectedGameId = useMemo(
    () => resolveRequestedGameId(games, selectedGameId).selectedGameId,
    [games, selectedGameId]
  );

  useEffect(() => {
    if (validSelectedGameId !== selectedGameId) {
      setSelectedGameId(validSelectedGameId);
    }
  }, [selectedGameId, validSelectedGameId]);

  const selectedGame = useMemo(
    () => games.find((game) => game.id === validSelectedGameId),
    [games, validSelectedGameId]
  );

  const { sessionId, sessionGameId, clearSession } = useRulesSession(validSelectedGameId);
  const activeSessionId = sessionGameId === validSelectedGameId ? sessionId : '';
  const {
    history,
    loading,
    hydrating,
    error,
    errorKind,
    retryPrompt,
    suggestions,
    setSuggestions,
    askQuestion,
    retryLastAction,
    resetConversation,
    initialQuestionFired
  } = useConversation(activeSessionId, validSelectedGameId);

  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = conversationEndRef.current?.parentElement;
    if (!el) {
      conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const threshold = 150;
    const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    if (isNearBottom) {
      conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history.length, loading]);

  useEffect(() => {
    if (initialQuestion && activeSessionId && !hydrating && !initialQuestionFired.current) {
      initialQuestionFired.current = true;
      void askQuestion(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId, hydrating, initialQuestion]);

  async function handleAsk(prefilledQuestion?: string) {
    const prompt = (prefilledQuestion ?? question).trim();
    if (!prompt || !selectedGame || !activeSessionId) return;
    const didAsk = await askQuestion(prompt);
    setQuestion(didAsk ? '' : prompt);
  }

  function handleClearSession() {
    clearSession();
    resetConversation();
    setQuestion('');
  }

  function handleSuggestionClick(suggestion: string) {
    setQuestion(suggestion);
    setSuggestions([]);
    void handleAsk(suggestion);
  }

  const lastItem = history.length > 0 ? history[history.length - 1] : undefined;
  const lastMode = lastItem?.mode;
  const modeMeta = describeAssistantMode(preferredMode, lastMode);
  const errorAction = error && errorKind ? getConversationErrorAction(errorKind, retryPrompt) : null;
  const savedRulingsLabel = history.length === 1 ? '1 saved ruling' : `${history.length} saved rulings`;

  if (!selectedGame) {
    const missingSharedGame = initialSelection.requestedGameMissing && initialSelection.requestedGameId;

    return (
      <div className="rounded-[32px] border border-dashed border-board-forest/20 bg-white p-8 shadow-card sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-board-forest">
          {missingSharedGame ? 'Shared link needs a new game pick' : 'No supported games available'}
        </p>
        <h2 className="mt-3 text-3xl font-bold text-board-pine">
          {missingSharedGame ? 'Choose a supported game before asking for a ruling.' : 'No supported games available'}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          {missingSharedGame
            ? `“${missingSharedGame}” is not in the current catalog. Pick one of the supported games below so RulesGenie can ground the answer in the right rules set.`
            : 'The catalog is empty right now, but you can head home or check the library again later.'}
        </p>
        {missingSharedGame ? (
          <label className="mt-6 block text-sm font-semibold text-board-pine">
            Supported game
            <select
              value={selectedGameId}
              onChange={(event) => setSelectedGameId(event.target.value)}
              className="mt-2 w-full max-w-xl rounded-2xl border border-board-forest/10 px-4 py-3 text-sm text-slate-700 outline-none ring-board-gold transition focus-visible:ring-2"
            >
              <option value="">Choose a supported game</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {missingSharedGame && initialQuestion ? (
          <p className="mt-4 text-sm text-board-pine">
            Your shared question is still queued and will be ready once you choose a supported game.
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/games"
            className="inline-flex rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-board-pine/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
          >
            Browse supported games
          </Link>
          <Link
            href={missingSharedGame ? '/quick-start' : '/'}
            className="inline-flex rounded-full border border-board-forest/15 px-5 py-3 text-sm font-semibold text-board-pine transition hover:bg-board-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
          >
            {missingSharedGame ? 'Open quick-start' : 'Go home'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center gap-2 rounded-2xl border border-board-forest/10 bg-white px-4 py-3 text-sm font-semibold text-board-pine shadow-card transition hover:bg-board-mist xl:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
        aria-expanded={sidebarOpen}
        aria-controls="chat-sidebar"
      >
        <span>{sidebarOpen ? '▼' : '▶'}</span>
        <span>Session controls &amp; game selector</span>
        <span className="ml-auto text-xs text-slate-500">{selectedGame.name}</span>
      </button>

      <aside
        id="chat-sidebar"
        className={`space-y-5 rounded-[32px] border border-board-forest/10 bg-white p-5 shadow-card xl:sticky xl:top-24 xl:h-fit ${sidebarOpen ? 'block' : 'hidden xl:block'}`}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-board-forest">Session</p>
          <h2 className="mt-2 text-2xl font-bold text-board-pine">Rules Q&A</h2>
          <p className="mt-2 text-sm text-slate-600">
            Choose a supported game, then ask plain-English rules questions with session memory and visible citations.
          </p>
        </div>
        <label className="block text-sm font-semibold text-board-pine">
          Supported game
          <select
            value={validSelectedGameId}
            onChange={(event) => setSelectedGameId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-board-forest/10 px-4 py-3 text-sm text-slate-700 outline-none ring-board-gold transition focus-visible:ring-2"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-2xl border border-board-forest/10 bg-board-canvas p-4 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full ${modeMeta.badgeTone} px-3 py-1 text-xs font-semibold text-board-pine`}>
              {modeMeta.badgeLabel}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-board-pine">
              {history.length ? savedRulingsLabel : 'New local session'}
            </span>
          </div>
          <p className="mt-3">{modeMeta.description}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Session memory</p>
          <p className="mt-1">
            {history.length
              ? `${savedRulingsLabel} for ${selectedGame.name} live on this device. “New session” clears only this game's local thread.`
              : `Questions for ${selectedGame.name} stay on this device until you start a new session.`}
          </p>
        </div>
        <div className="rounded-2xl bg-board-canvas p-4">
          <p className="text-sm font-semibold text-board-pine">{selectedGame.name}</p>
          <p className="mt-1 text-sm text-slate-600">{selectedGame.tagline}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Example prompts</p>
          <div className="mt-3 flex flex-col gap-2">
            {selectedGame.exampleQuestions.map((example) => (
              <button
                key={example}
                type="button"
                aria-label={`Ask: ${example}`}
                onClick={() => {
                  setQuestion(example);
                  void handleAsk(example);
                }}
                className="rounded-2xl border border-board-forest/10 bg-white px-3 py-3 text-left text-sm text-slate-600 transition hover:border-board-forest/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleClearSession}
          className="w-full rounded-2xl border border-board-forest/10 px-4 py-3 text-sm font-semibold text-board-pine transition hover:border-board-forest/30 hover:bg-board-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
        >
          New session
        </button>
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
          <div className={`rounded-full ${modeMeta.badgeTone} px-4 py-2 text-sm font-semibold text-board-pine`}>
            {modeMeta.badgeLabel} {loading ? '· answering…' : 'ready'}
          </div>
          {lastMode === 'fallback' ? (
            <p className="w-full text-xs text-amber-700">
              Live AI was unavailable for the last request, so RulesGenie showed a best-effort demo answer.
            </p>
          ) : null}
        </div>

        {initialSelection.requestedGameMissing ? (
          <div
            className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            role="status"
          >
            That shared link asked for <span className="font-semibold">“{initialSelection.requestedGameId}”</span>,
            which is not in the current catalog. You selected <span className="font-semibold">{selectedGame.name}</span>{' '}
            to continue with a supported rules set.
            <Link href="/games" className="ml-2 font-semibold text-amber-900 underline underline-offset-4">
              Browse supported games
            </Link>
          </div>
        ) : null}

        <ConversationThread
          history={history}
          hydrating={hydrating}
          loading={loading}
          error={error}
          errorActionLabel={errorAction?.label}
          errorActionHint={errorAction?.hint}
          onRetry={errorAction ? retryLastAction : undefined}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
        <div ref={conversationEndRef} />

        <QuestionInput
          question={question}
          setQuestion={setQuestion}
          loading={loading}
          gameName={selectedGame.name}
          onSubmit={handleAsk}
        />
      </section>
    </div>
  );
}
