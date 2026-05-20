import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { AiStatus, GameRecord } from '../types';

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export const COMPLEXITY_GATEWAY_MAX = 2.2;
export const COMPLEXITY_MIDWEIGHT_MAX = 3.2;

export function getComplexityLabel(value: number) {
  if (value < COMPLEXITY_GATEWAY_MAX) return 'Gateway';
  if (value < COMPLEXITY_MIDWEIGHT_MAX) return 'Midweight';
  return 'Strategy-heavy';
}

export function getStatusLabel(status: AiStatus) {
  switch (status) {
    case 'grounded':
      return 'Citation-backed';
    case 'conflicting':
      return 'Conflicting sources';
    case 'strategy':
      return 'Non-official guidance';
    default:
      return 'Needs clarification';
  }
}

export function getStatusClasses(status: AiStatus) {
  switch (status) {
    case 'grounded':
      return 'bg-emerald-100 text-emerald-900';
    case 'conflicting':
      return 'bg-amber-100 text-amber-900';
    case 'strategy':
      return 'bg-sky-100 text-sky-900';
    default:
      return 'bg-rose-100 text-rose-900';
  }
}

export function getGameCover(game: Pick<GameRecord, 'name' | 'palette' | 'icon'>) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${game.palette[0]}" />
      <stop offset="55%" stop-color="${game.palette[1]}" />
      <stop offset="100%" stop-color="${game.palette[2]}" />
    </linearGradient>
  </defs>
  <rect width="600" height="800" rx="36" fill="url(#bg)"/>
  <circle cx="480" cy="140" r="120" fill="rgba(255,255,255,0.18)" />
  <circle cx="140" cy="640" r="170" fill="rgba(255,255,255,0.12)" />
  <text x="64" y="180" font-size="100">${game.icon}</text>
  <text x="64" y="420" fill="#ffffff" font-family="Arial, sans-serif" font-size="48" font-weight="700">${escapeXml(game.name)}</text>
  <text x="64" y="480" fill="rgba(255,255,255,0.84)" font-family="Arial, sans-serif" font-size="24">RulesGenie Library</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function timeAgo(value: string) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'unknown';
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
