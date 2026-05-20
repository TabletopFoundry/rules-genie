import Link from 'next/link';

import { getMissingGameRecovery } from '@/lib/ux';

export default function GameNotFound() {
  const recovery = getMissingGameRecovery();

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-2xl rounded-[32px] border border-board-forest/10 bg-white px-8 py-10 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-board-forest">{recovery.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold text-board-pine">{recovery.title}</h1>
        <p className="mt-3 text-sm text-slate-600">{recovery.description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/games" className="inline-flex rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white">
            {recovery.browseLabel}
          </Link>
          <Link
            href="/ask"
            className="inline-flex rounded-full border border-board-forest/15 px-5 py-3 text-sm font-semibold text-board-pine transition hover:bg-board-mist"
          >
            {recovery.askLabel}
          </Link>
          <Link
            href="/quick-start"
            className="inline-flex rounded-full border border-board-forest/15 px-5 py-3 text-sm font-semibold text-board-pine transition hover:bg-board-mist"
          >
            {recovery.quickStartLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
