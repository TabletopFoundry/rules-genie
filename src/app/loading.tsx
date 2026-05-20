import Link from 'next/link';

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center" aria-live="polite" role="status">
      <div className="rounded-[32px] border border-board-forest/10 bg-white px-8 py-10 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-board-forest">Loading</p>
        <h1 className="mt-3 text-3xl font-bold text-board-pine">Setting the table…</h1>
        <p className="mt-2 text-slate-600">RulesGenie is gathering your games, recent rulings, and quick-start notes.</p>
        <div className="mx-auto mt-6 flex justify-center gap-2">
          <span className="h-3 w-3 animate-bounce rounded-full bg-board-pine [animation-delay:0ms]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-board-gold [animation-delay:150ms]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-board-berry [animation-delay:300ms]" />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/games"
            className="inline-flex rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-board-pine/90"
          >
            Browse supported games
          </Link>
          <Link
            href="/quick-start"
            className="inline-flex rounded-full border border-board-forest/15 px-5 py-3 text-sm font-semibold text-board-pine transition hover:bg-board-canvas"
          >
            Open quick-start
          </Link>
        </div>
      </div>
    </div>
  );
}
