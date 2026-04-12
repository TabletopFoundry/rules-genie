'use client';

import { useState, useTransition } from 'react';

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

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          const response = await fetch('/api/collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId })
          });
          const payload = (await response.json()) as { active: boolean };
          setActive(payload.active);
          onToggle?.(payload.active);
        });
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition',
        active ? 'border-board-forest bg-board-forest text-white' : 'border-board-forest/20 bg-white text-board-pine hover:border-board-forest/40',
        className
      )}
      disabled={isPending}
    >
      {isPending ? 'Saving…' : active ? 'In collection' : 'Add to collection'}
    </button>
  );
}
