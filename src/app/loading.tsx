export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="rounded-[32px] border border-board-forest/10 bg-white px-8 py-10 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-board-forest">Loading</p>
        <h1 className="mt-3 text-3xl font-bold text-board-pine">Setting the table…</h1>
        <p className="mt-2 text-slate-600">RulesGenie is gathering your games, recent rulings, and quick-start notes.</p>
      </div>
    </div>
  );
}
