import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';

import '@/app/globals.css';
import { SiteHeader } from '@/components/site-header';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: {
    default: 'RulesGenie',
    template: '%s — RulesGenie'
  },
  description: 'AI-powered board game rules assistant with citations, quick starts, and a personal dashboard.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  manifest: '/site.webmanifest',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'RulesGenie',
    title: 'RulesGenie — AI Board Game Rules Assistant',
    description: 'Stop flipping through rulebooks. Get instant AI-powered rulings with citations for popular board games.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RulesGenie',
    description: 'AI-powered board game rules assistant with citations.'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-board-canvas text-slate-900`}>
        <div className="min-h-screen bg-grid">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-board-pine focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
          <footer className="border-t border-board-forest/10 bg-white/70">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <p>RulesGenie MVP · Built for fast mid-game rulings.</p>
              <p>Demo mode works without API keys. Add OpenAI credentials for production-style answers.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
