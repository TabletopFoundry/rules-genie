import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getConversation } from '@/lib/db';

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

  const items = getConversation(parsed.data.sessionId, parsed.data.gameId);
  return NextResponse.json({ items });
}
