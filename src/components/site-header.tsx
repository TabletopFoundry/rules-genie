'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { href: '/ask', label: 'Ask Rules' },
  { href: '/games', label: 'Games' },
  { href: '/quick-start', label: 'Quick Start' },
  { href: '/dashboard', label: 'Dashboard' }
];

function isActiveLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Return all focusable elements within a container. */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeLink = links.find((link) => isActiveLink(pathname, link.href));

  function closeMobileMenu(restoreFocus = false) {
    setMobileOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  useEffect(() => {
    if (mobileOpen) {
      closeButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  // Focus trap: keep Tab cycling within the mobile drawer while open
  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab' && menuRef.current) {
        const focusable = getFocusableElements(menuRef.current);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!first || !last) return;

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
          {links.map((link) => {
            const active = isActiveLink(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold ${active ? 'bg-board-mist text-board-pine' : 'hover:bg-board-mist hover:text-board-pine'}`}
              >
                {link.label}
              </Link>
            );
          })}
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
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav backdrop + drawer */}
      {mobileOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 sm:hidden" aria-hidden="true" onClick={() => closeMobileMenu(true)} />
          <div className="relative z-50 sm:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-navigation-title">
            <nav
              id="mobile-navigation"
              ref={menuRef}
              aria-label="Main navigation"
              className="border-t border-board-forest/10 bg-white px-4 pb-4 pt-2"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  closeMobileMenu(true);
                }
              }}
            >
              <div className="mb-3 flex items-start justify-between gap-3 rounded-2xl bg-board-canvas px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-board-forest">Navigation</p>
                  <p id="mobile-navigation-title" className="mt-1 text-lg font-bold text-board-pine">
                    {activeLink?.label ?? 'RulesGenie'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Demo user · Jump back into your next rules flow.</p>
                </div>
                <button
                  type="button"
                  ref={closeButtonRef}
                  onClick={() => closeMobileMenu(true)}
                  className="rounded-full border border-board-forest/15 px-4 py-2 text-sm font-semibold text-board-pine transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {links.map((link) => {
                  const active = isActiveLink(pathname, link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold ${active ? 'bg-board-mist text-board-pine' : 'text-slate-600 hover:bg-board-mist hover:text-board-pine'}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <span className="mt-1 rounded-2xl bg-board-gold/20 px-4 py-3 text-sm font-semibold text-board-pine">Demo user</span>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
