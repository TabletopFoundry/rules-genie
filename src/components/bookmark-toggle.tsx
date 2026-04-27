'use client';

import { Bookmark } from 'lucide-react';
import { useState, useTransition } from 'react';

import { ToggleResponseSchema } from '@/lib/api-schemas';
import { safeJsonParse } from '@/lib/fetch-utils';
import { cn } from '@/lib/utils';

export function BookmarkToggle({ qaPairId, initialActive = false }: { qaPairId: string; initialActive?: boolean }) {
  const [active, setActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  return (
    <div className="inline-flex flex-col items-start gap-1">
    <button
      type="button"
      onClick={() => {
        setError('');
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
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save bookmark.');
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
    {error && <p className="text-xs text-rose-600" role="alert">{error}</p>}
    </div>
  );
}
