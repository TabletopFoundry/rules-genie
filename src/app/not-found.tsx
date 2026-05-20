import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-lg rounded-[32px] border border-board-forest/10 bg-white px-8 py-10 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-board-forest">Not found</p>
        <h1 className="mt-3 text-3xl font-bold text-board-pine">Page not found.</h1>
        <p className="mt-3 text-sm text-slate-600">The page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex rounded-full bg-board-pine px-5 py-3 text-sm font-semibold text-white">
            Go to homepage
          </Link>
          <Link
            href="/games"
            className="inline-flex rounded-full border border-board-forest/15 px-5 py-3 text-sm font-semibold text-board-pine transition hover:bg-board-canvas"
          >
            Browse games
          </Link>
        </div>
      </div>
    </div>
  );
}
