import { cn } from '@/lib/utils';

export type ActionFeedbackTone = 'success' | 'error' | 'info';

const toneClasses: Record<ActionFeedbackTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-board-forest/10 bg-board-canvas text-slate-600'
};

export function ActionFeedback({
  message,
  tone = 'info',
  className,
  onDismiss
}: {
  message?: string | undefined;
  tone?: ActionFeedbackTone | undefined;
  className?: string | undefined;
  onDismiss?: (() => void) | undefined;
}) {
  if (!message) {
    return null;
  }

  const isError = tone === 'error';

  return (
    <div
      className={cn('rounded-2xl border px-4 py-3 text-sm', toneClasses[tone], className)}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
    >
      <div className={cn('flex gap-3', onDismiss ? 'items-start justify-between' : 'items-start')}>
        <p className="leading-6">{message}</p>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs font-semibold text-current underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-gold focus-visible:rounded"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
