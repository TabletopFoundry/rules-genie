'use client';

import { useState, useTransition } from 'react';

import { ToggleResponseSchema } from '@/lib/api-schemas';
import { safeJsonParse } from '@/lib/fetch-utils';
import { cn } from '@/lib/utils';

export function CollectionToggle({
  gameId,
  initialActive = false,
  className,
  onToggle
}: {
  gameId: string;
  initialActive?: boolean;
  className?: string;
  onToggle?: (active: boolean) => void;
}) {
  const [active, setActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  return (
    <div className={cn('inline-flex flex-col items-start gap-1', className)}>
    <button
      type="button"
      onClick={() => {
        setError('');
        startTransition(async () => {
          try {
            const response = await fetch('/api/collection', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ gameId })
            });
            if (!response.ok) throw new Error('Could not update collection.');
            const raw = await safeJsonParse<unknown>(response, 'Could not update collection.');
            const payload = ToggleResponseSchema.parse(raw);
            setActive(payload.active);
            onToggle?.(payload.active);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update collection.');
          }
        });
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition',
        active ? 'border-board-forest bg-board-forest text-white' : 'border-board-forest/20 bg-white text-board-pine hover:border-board-forest/40'
      )}
      disabled={isPending}
      aria-pressed={active}
    >
      {isPending ? 'Saving…' : active ? 'In collection' : 'Add to collection'}
    </button>
    {error && <p className="text-xs text-rose-600" role="alert">{error}</p>}
    </div>
  );
}
