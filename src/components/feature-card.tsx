import type { ReactNode } from 'react';

export function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-board-forest/10 bg-white p-6 shadow-card">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-board-gold/15 text-board-pine" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-board-pine">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
