'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';

import { FeedbackResponseSchema } from '@/lib/api-schemas';
import { safeJsonParse } from '@/lib/fetch-utils';
import type { QaRecord } from '@/types';

const reasons = ['incorrect ruling', 'wrong edition', 'unclear explanation', 'bad citation'];

export function FeedbackControls({ qaPair }: { qaPair: QaRecord }) {
  const [rating, setRating] = useState<QaRecord['feedbackRating']>(qaPair.feedbackRating ?? null);
  const [reason, setReason] = useState(qaPair.feedbackReason ?? '');
  const [statusMessage, setStatusMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const reasonSelectRef = useRef<HTMLSelectElement>(null);
  const showReasonPicker = rating === 'down' || Boolean(reason);

  useEffect(() => {
    if (rating === 'down' && !reason) {
      reasonSelectRef.current?.focus();
    }
  }, [rating, reason]);

  async function submit(nextRating: 'up' | 'down', nextReason?: string) {
    setError('');
    setStatusMessage('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: qaPair.sessionId,
          qaPairId: qaPair.id,
          rating: nextRating,
          reason: nextReason
        })
      });
      const raw = await safeJsonParse<{ success?: boolean; error?: string }>(response, 'Could not save feedback.');
      if (!response.ok) {
        throw new Error(raw.error ?? 'Could not save feedback.');
      }

      FeedbackResponseSchema.parse(raw);
      setRating(nextRating);
      setReason(nextReason ?? '');
      setStatusMessage(
        nextRating === 'up'
          ? 'Marked as helpful.'
          : nextReason
            ? 'Saved — thanks for the specific note.'
            : 'Saved — add a reason if you want to tell us what missed the mark.'
      );
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
          onClick={() => startTransition(() => submit('down', reason || undefined))}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${rating === 'down' ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-board-forest/15 bg-white text-slate-600'}`}
          disabled={isPending}
          aria-pressed={rating === 'down'}
        >
          <ThumbsDown className="h-4 w-4" /> Needs work
        </button>
      </div>
      {showReasonPicker ? (
        <label className="block text-xs text-slate-500">
          Add a reason if it missed the mark.
          <select
            ref={reasonSelectRef}
            aria-label="Feedback reason"
            value={reason}
            onChange={(event) => {
              const nextReason = event.target.value;
              setReason(nextReason);
              if (rating === 'down') {
                startTransition(() => submit('down', nextReason || undefined));
              }
            }}
            className="mt-2 w-full rounded-2xl border border-board-forest/15 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
          >
            <option value="">Select a reason</option>
            {reasons.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-xs text-slate-500">Choose “Needs work” if you want to add a reason for a weak ruling.</p>
      )}
      {statusMessage ? (
        <p className="text-xs text-emerald-700" role="status">
          {statusMessage}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
