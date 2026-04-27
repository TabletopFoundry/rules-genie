import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getConversationHistory, getGameById } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  sessionId: z.string().trim().min(1).max(100),
  gameId: z.string().trim().min(1).max(100)
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = schema.safeParse({
    sessionId: searchParams.get('sessionId'),
    gameId: searchParams.get('gameId')
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Missing sessionId or gameId.' }, { status: 400 });
  }

  try {
    // Validate gameId before DB operations to avoid FK-violation 500s (P0-2)
    const game = getGameById(parsed.data.gameId);
    if (!game) {
      return NextResponse.json(
        { error: 'That game is not in the RulesGenie catalog.' },
        { status: 400 }
      );
    }

    const items = getConversationHistory(parsed.data.sessionId, parsed.data.gameId);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Could not load conversation.' }, { status: 500 });
  }
}
