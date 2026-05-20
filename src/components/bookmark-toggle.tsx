'use client';

import { Bookmark } from 'lucide-react';
import { useState, useTransition } from 'react';

import { ActionFeedback } from '@/components/action-feedback';
import { ToggleResponseSchema } from '@/lib/api-schemas';
import { safeJsonParse } from '@/lib/fetch-utils';
import { cn } from '@/lib/utils';

export function BookmarkToggle({ qaPairId, initialActive = false }: { qaPairId: string; initialActive?: boolean }) {
  const [active, setActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => {
          setFeedback(null);
          startTransition(async () => {
            try {
              const response = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qaPairId })
              });
              if (!response.ok) throw new Error('Could not save bookmark.');
              const raw = await safeJsonParse<unknown>(response, 'Could not save bookmark.');
              const payload = ToggleResponseSchema.parse(raw);
              setActive(payload.active);
              setFeedback({
                tone: 'success',
                message: payload.active ? 'Saved to your dashboard bookmarks.' : 'Removed from saved answers.'
              });
            } catch (err) {
              setFeedback({
                tone: 'error',
                message: err instanceof Error ? err.message : 'Could not save bookmark.'
              });
            }
          });
        }}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition',
          active ? 'border-board-gold bg-board-gold/20 text-board-pine' : 'border-board-forest/15 bg-white text-slate-600'
        )}
        disabled={isPending}
        aria-pressed={active}
      >
        <Bookmark className={cn('h-4 w-4', active && 'fill-current')} />
        {isPending ? 'Saving…' : active ? 'Saved' : 'Save answer'}
      </button>
      <ActionFeedback message={feedback?.message} tone={feedback?.tone} className="text-xs" />
    </div>
  );
}
