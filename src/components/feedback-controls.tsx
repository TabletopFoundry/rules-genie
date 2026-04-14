'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState, useTransition } from 'react';

import type { QaRecord } from '@/types';

const reasons = ['incorrect ruling', 'wrong edition', 'unclear explanation', 'bad citation'];

export function FeedbackControls({ qaPair }: { qaPair: QaRecord }) {
  const [rating, setRating] = useState<QaRecord['feedbackRating']>(qaPair.feedbackRating ?? null);
  const [reason, setReason] = useState(qaPair.feedbackReason ?? '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  async function submit(nextRating: 'up' | 'down', nextReason?: string) {
    setError('');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: qaPair.sessionId, qaPairId: qaPair.id, rating: nextRating, reason: nextReason })
      });
      if (!response.ok) throw new Error('Could not save feedback.');
      setRating(nextRating);
      if (nextReason !== undefined) {
        setReason(nextReason);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save feedback.');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => startTransition(() => submit('up'))}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${rating === 'up' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-board-forest/15 bg-white text-slate-600'}`}
          disabled={isPending}
          aria-pressed={rating === 'up'}
        >
          <ThumbsUp className="h-4 w-4" /> Helpful
        </button>
        <button
          type="button"
          onClick={() => startTransition(() => submit('down', reason || reasons[0]))}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${rating === 'down' ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-board-forest/15 bg-white text-slate-600'}`}
          disabled={isPending}
          aria-pressed={rating === 'down'}
        >
          <ThumbsDown className="h-4 w-4" /> Needs work
        </button>
      </div>
      <label className="block text-xs text-slate-500">
        If it missed the mark, pick a reason.
        <select
          value={reason}
          onChange={(event) => {
            const nextReason = event.target.value;
            setReason(nextReason);
            if (rating === 'down') {
              startTransition(() => submit('down', nextReason));
            }
          }}
          className="mt-2 w-full rounded-2xl border border-board-forest/15 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="">Select a reason</option>
          {reasons.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="text-xs text-rose-600" role="alert">{error}</p>}
    </div>
  );
}
