import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  description,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.25em] text-board-forest">{eyebrow}</p> : null}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-board-pine sm:text-4xl">{title}</h2>
        {description ? <p className="max-w-3xl text-base text-slate-600 sm:text-lg">{description}</p> : null}
      </div>
    </div>
  );
}
