import Link from 'next/link';

const links = [
  { href: '/ask', label: 'Ask Rules' },
  { href: '/games', label: 'Games' },
  { href: '/quick-start', label: 'Quick Start' },
  { href: '/dashboard', label: 'Dashboard' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-board-forest/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-board-pine text-xl text-white">🎲</div>
          <div>
            <p className="text-lg font-black tracking-tight text-board-pine">RulesGenie</p>
            <p className="text-xs text-slate-500">AI-powered board game rules assistant</p>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-semibold text-slate-600">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 transition hover:bg-board-mist hover:text-board-pine">
              {link.label}
            </Link>
          ))}
          <span className="rounded-full bg-board-gold/20 px-3 py-2 text-board-pine">Demo user</span>
        </nav>
      </div>
    </header>
  );
}
