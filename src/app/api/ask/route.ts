import { NextResponse } from 'next/server';
import { z } from 'zod';

import { answerRulesQuestion } from '@/lib/ai';
import { getConversation, saveQaPair } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  sessionId: z.string().trim().min(1).max(100),
  gameId: z.string().trim().min(1).max(100),
  question: z.string().trim().min(3).max(500)
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
    return NextResponse.json({ error: 'Please select a supported game and enter a longer question.' }, { status: 400 });
  }

  try {
    const history = getConversation(parsed.data.sessionId, parsed.data.gameId);
    const answer = await answerRulesQuestion({
      gameId: parsed.data.gameId,
      question: parsed.data.question,
      history
    });

    const item = saveQaPair({
      sessionId: parsed.data.sessionId,
      gameId: parsed.data.gameId,
      question: parsed.data.question,
      answer: answer.answer,
      citations: answer.citations,
      confidence: answer.confidence,
      status: answer.status,
      mode: answer.mode
    });

    return NextResponse.json({ item, suggestions: answer.suggestions });
  } catch (error) {
    // Log actual error server-side but never leak internal details to the client
    console.error('[api/ask] Unexpected error:', error);
    return NextResponse.json(
      { error: 'RulesGenie could not answer right now.' },
      { status: 500 }
    );
  }
}
