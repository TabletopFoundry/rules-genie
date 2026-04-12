import { NextResponse } from 'next/server';
import { z } from 'zod';

import { toggleBookmark } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({ qaPairId: z.string().min(1) });

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Missing qaPairId.' }, { status: 400 });
  }

  return NextResponse.json(toggleBookmark(parsed.data.qaPairId));
}
