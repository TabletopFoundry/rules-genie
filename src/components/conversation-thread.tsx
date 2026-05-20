'use client';

import { BookmarkToggle } from '@/components/bookmark-toggle';
import { CitationList } from '@/components/citation-list';
import { FeedbackControls } from '@/components/feedback-controls';
import { StatusPill } from '@/components/status-pill';
import type { QaRecord } from '@/types';

export function ConversationThread({
  history,
  hydrating,
  loading,
  error,
  errorActionLabel,
  errorActionHint,
  onRetry,
  suggestions,
  onSuggestionClick
}: {
  history: QaRecord[];
  hydrating: boolean;
  loading: boolean;
  error: string;
  errorActionLabel?: string | undefined;
  errorActionHint?: string | undefined;
  onRetry?: (() => void) | undefined;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}) {
  return (
    <div className="mt-6 space-y-5">
      {hydrating ? <p className="text-sm text-slate-500" role="status">Loading your conversation…</p> : null}
      {!hydrating && !history.length ? (
        <div className="rounded-[28px] border border-dashed border-board-forest/20 bg-board-canvas p-8 text-sm text-slate-600">
          No questions yet. Start with one of the example prompts or type a rules dispute below.
        </div>
      ) : null}
      {history.map((item, index) => (
        <article key={item.id} className="space-y-4 rounded-[28px] border border-board-forest/10 p-5">
          <h4 className="sr-only">Question {index + 1}: {item.question.slice(0, 80)}</h4>
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
        </article>
      ))}
      {loading ? (
        <div className="animate-pulse rounded-[28px] border border-board-forest/10 bg-board-canvas p-5 text-sm text-slate-600" role="status">
          Searching the rules reference and drafting a concise ruling…
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          <p>{error}</p>
          {errorActionLabel && onRetry ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
              >
                {errorActionLabel}
              </button>
              {errorActionHint ? <p className="text-xs text-rose-700/80">{errorActionHint}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {suggestions.length > 0 && !loading ? (
        <div className="rounded-2xl bg-board-canvas p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Suggested follow-ups</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className="rounded-full border border-board-forest/10 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-board-forest/30 hover:text-board-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
