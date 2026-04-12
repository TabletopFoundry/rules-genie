import { cn, getStatusClasses, getStatusLabel } from '@/lib/utils';
import type { AiStatus } from '@/types';

export function StatusPill({ status, className }: { status: AiStatus; className?: string }) {
  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', getStatusClasses(status), className)}>{getStatusLabel(status)}</span>;
}
