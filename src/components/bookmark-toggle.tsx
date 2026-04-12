'use client';

import { Bookmark } from 'lucide-react';
import { useState, useTransition } from 'react';

import { cn } from '@/lib/utils';

export function BookmarkToggle({ qaPairId, initialActive = false }: { qaPairId: string; initialActive?: boolean }) {
  const [active, setActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qaPairId })
          });
          const payload = (await response.json()) as { active: boolean };
          setActive(payload.active);
        });
      }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition',
        active ? 'border-board-gold bg-board-gold/20 text-board-pine' : 'border-board-forest/15 bg-white text-slate-600'
      )}
      disabled={isPending}
    >
      <Bookmark className={cn('h-4 w-4', active && 'fill-current')} />
      {isPending ? 'Saving…' : active ? 'Saved' : 'Save answer'}
    </button>
  );
}
