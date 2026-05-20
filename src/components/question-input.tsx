'use client';

import { useCallback, useRef } from 'react';

export function QuestionInput({
  question,
  setQuestion,
  loading,
  gameName,
  onSubmit
}: {
  question: string;
  setQuestion: (value: string) => void;
  loading: boolean;
  gameName: string;
  onSubmit: (question?: string) => void | Promise<void>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!loading && question.trim()) {
        onSubmit();
      }
    }
  }

  return (
    <div className="mt-6 rounded-[28px] border border-board-forest/10 bg-slate-50 p-4">
      <label className="sr-only" htmlFor="rules-question">
        Ask a rules question
      </label>
      <textarea
        ref={textareaRef}
        id="rules-question"
        rows={1}
        value={question}
        onChange={(event) => {
          setQuestion(event.target.value);
          autoResize();
        }}
        onKeyDown={handleKeyDown}
        placeholder={`Ask a ${gameName} rules question…`}
        className="min-h-[48px] w-full resize-none rounded-3xl border border-board-forest/10 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-board-gold transition focus-visible:ring-2"
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">Press Enter to send · Shift+Enter for new line</p>
        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={loading || !question.trim()}
          className="rounded-full bg-board-pine px-6 py-3 text-sm font-semibold text-white transition hover:bg-board-pine/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-board-pine/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:ring-offset-2"
        >
          {loading ? 'Answering…' : 'Ask RulesGenie'}
        </button>
      </div>
    </div>
  );
}
