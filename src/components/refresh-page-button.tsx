'use client';

import { useRouter } from 'next/navigation';

export function RefreshPageButton({
  label,
  className
}: {
  label: string;
  className?: string | undefined;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className={className}
    >
      {label}
    </button>
  );
}
