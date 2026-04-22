'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const links = [
  { href: '/ask', label: 'Ask Rules' },
  { href: '/games', label: 'Games' },
  { href: '/quick-start', label: 'Quick Start' },
  { href: '/dashboard', label: 'Dashboard' }
];

/** Return all focusable elements within a container. */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mobileOpen && menuRef.current) {
      const firstLink = menuRef.current.querySelector('a');
      firstLink?.focus();
    }
  }, [mobileOpen]);

  // Focus trap: keep Tab cycling within the mobile drawer while open
  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab' && menuRef.current) {
        const focusable = getFocusableElements(menuRef.current);
        // Include the close button in the trap
        if (triggerRef.current) focusable.unshift(triggerRef.current);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-board-forest/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:rounded-2xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-board-pine text-xl text-white">🎲</div>
          <div>
            <p className="text-lg font-black tracking-tight text-board-pine">RulesGenie</p>
            <p className="text-xs text-slate-500">AI-powered board game rules assistant</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 text-sm font-semibold text-slate-600 sm:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 transition hover:bg-board-mist hover:text-board-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold">
              {link.label}
            </Link>
          ))}
          <span className="rounded-full bg-board-gold/20 px-3 py-2 text-board-pine">Demo user</span>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          ref={triggerRef}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-board-mist sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen ? (
        <nav
          ref={menuRef}
          aria-label="Main navigation"
          className="border-t border-board-forest/10 bg-white px-4 pb-4 pt-2 sm:hidden"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setMobileOpen(false);
              triggerRef.current?.focus();
            }
          }}
        >
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-board-mist hover:text-board-pine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
              >
                {link.label}
              </Link>
            ))}
            <span className="mt-1 rounded-2xl bg-board-gold/20 px-4 py-3 text-sm font-semibold text-board-pine">Demo user</span>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
