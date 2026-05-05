import { NextResponse } from 'next/server';
import { z } from 'zod';

import { removeBookmark, toggleBookmark } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  qaPairId: z.string().trim().min(1).max(100),
  action: z.enum(['toggle', 'remove']).default('toggle')
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Missing qaPairId.' }, { status: 400 });
  }

  try {
    if (parsed.data.action === 'remove') {
      return NextResponse.json(removeBookmark(parsed.data.qaPairId));
    }
    return NextResponse.json(toggleBookmark(parsed.data.qaPairId));
  } catch {
    return NextResponse.json({ error: 'Failed to toggle bookmark.' }, { status: 500 });
  }
}
