import { NextResponse } from 'next/server';
import { z } from 'zod';

import { saveFeedback } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  sessionId: z.string().trim().min(1).max(100),
  qaPairId: z.string().trim().min(1).max(100),
  rating: z.enum(['up', 'down']),
  reason: z.string().trim().max(500).optional()
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
    return NextResponse.json({ error: 'Invalid feedback payload.' }, { status: 400 });
  }

  try {
    return NextResponse.json(saveFeedback(parsed.data));
  } catch {
    return NextResponse.json({ error: 'Failed to save feedback.' }, { status: 500 });
  }
}
