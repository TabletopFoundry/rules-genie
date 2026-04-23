'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { ConversationThread } from '@/components/conversation-thread';
import { useConversation } from '@/components/hooks/use-conversation';
import { useRulesSession } from '@/components/hooks/use-rules-session';
import { QuestionInput } from '@/components/question-input';
import type { GameRecord } from '@/types';

export function ChatInterface({ games, initialGameId, initialQuestion }: { games: GameRecord[]; initialGameId?: string | undefined; initialQuestion?: string | undefined }) {
  const [selectedGameId, setSelectedGameId] = useState(initialGameId ?? games[0]?.id ?? '');
  const [question, setQuestion] = useState(initialQuestion ?? '');

  const selectedGame = useMemo(() => games.find((game) => game.id === selectedGameId) ?? games[0], [games, selectedGameId]);

  const { sessionId, clearSession } = useRulesSession(selectedGameId);
  const {
    history,
    loading,
    hydrating,
    error,
    suggestions,
    setSuggestions,
    askQuestion,
    resetConversation,
    initialQuestionFired
  } = useConversation(sessionId, selectedGameId);

  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom only when user is already near the bottom
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

  // Auto-submit initial question from ?q= param after session is ready
  useEffect(() => {
    if (initialQuestion && sessionId && !hydrating && !initialQuestionFired.current) {
      initialQuestionFired.current = true;
      void askQuestion(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, sessionId, hydrating]);

  function handleAsk(prefilledQuestion?: string) {
    const prompt = (prefilledQuestion ?? question).trim();
    if (!prompt || !selectedGame || !sessionId) return;
    void askQuestion(prompt);
    setQuestion('');
  }

  function handleClearSession() {
    clearSession();
    resetConversation();
    setQuestion('');
  }

  function handleSuggestionClick(suggestion: string) {
    setQuestion(suggestion);
    setSuggestions([]);
    void askQuestion(suggestion);
  }

  const lastItem = history.length > 0 ? history[history.length - 1] : undefined;
  const lastMode = lastItem?.mode;
  const modeLabel = lastMode === 'openai' ? 'AI mode' : lastMode === 'fallback' ? 'Fallback mode' : 'Demo mode';
  const modeBg = lastMode === 'openai' ? 'bg-green-100' : lastMode === 'fallback' ? 'bg-amber-100' : 'bg-board-gold/15';

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
            className="mt-2 w-full rounded-2xl border border-board-forest/10 px-4 py-3 text-sm text-slate-700 outline-none ring-board-gold transition focus-visible:ring-2"
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
                aria-label={`Ask: ${example}`}
                onClick={() => {
                  setQuestion(example);
                  handleAsk(example);
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
          <div className={`rounded-full ${modeBg} px-4 py-2 text-sm font-semibold text-board-pine`}>
            {modeLabel} {loading ? '· answering…' : 'ready'}
          </div>
          {lastMode === 'fallback' && (
            <p className="w-full text-xs text-amber-700">AI unavailable — showing a best-effort demo answer.</p>
          )}
        </div>

        <ConversationThread
          history={history}
          hydrating={hydrating}
          loading={loading}
          error={error}
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
