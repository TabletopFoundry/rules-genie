import type { Citation } from '@/types';

export function CitationList({ citations }: { citations: Citation[] }) {
  if (!citations.length) {
    return null;
  }

  return (
    <ul role="list" className="flex flex-wrap gap-2">
      {citations.map((citation, index) => (
        <li key={`${citation.source}-${index}`} className="rounded-2xl border border-board-forest/10 bg-board-canvas px-3 py-2 text-xs text-slate-600">
          <p className="font-semibold text-board-pine">{citation.source}</p>
          <p>
            p.{citation.page} · {citation.section}
          </p>
          {citation.note ? <p>{citation.note}</p> : null}
        </li>
      ))}
    </ul>
  );
}
