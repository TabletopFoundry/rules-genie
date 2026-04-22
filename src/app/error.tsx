'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="alert" aria-live="assertive">
      <div className="max-w-lg rounded-[32px] border border-rose-200 bg-white px-8 py-10 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">Unexpected error</p>
        <h1 className="mt-3 text-3xl font-bold text-board-pine">RulesGenie hit a snag.</h1>
        <p className="mt-3 text-sm text-slate-600">{process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong while loading the app.'}</p>
        {error.digest && <p className="mt-2 text-xs text-slate-400">Reference: {error.digest}</p>}
        <button type="button" onClick={reset} className="mt-6 rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white">
          Try again
        </button>
      </div>
    </div>
  );
}
