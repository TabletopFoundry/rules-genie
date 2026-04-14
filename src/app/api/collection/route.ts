import { NextResponse } from 'next/server';
import { z } from 'zod';

import { toggleCollection } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({ gameId: z.string().min(1) });

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Missing gameId.' }, { status: 400 });
  }

  return NextResponse.json(toggleCollection(parsed.data.gameId));
}
