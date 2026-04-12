import { NextResponse } from 'next/server';
import { z } from 'zod';

import { saveFeedback } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  sessionId: z.string().min(1),
  qaPairId: z.string().min(1),
  rating: z.enum(['up', 'down']),
  reason: z.string().optional()
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid feedback payload.' }, { status: 400 });
  }

  return NextResponse.json(saveFeedback(parsed.data));
}
