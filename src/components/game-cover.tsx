import Image from 'next/image';

import type { GameRecord } from '@/types';
import { cn, getGameCover } from '@/lib/utils';

export function GameCover({ game, className }: { game: GameRecord; className?: string }) {
  return (
    <Image
      src={getGameCover(game)}
      alt={`${game.name} cover art`}
      width={600}
      height={800}
      unoptimized
      className={cn('w-full rounded-3xl object-cover', className)}
    />
  );
}
