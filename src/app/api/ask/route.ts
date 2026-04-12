import { NextResponse } from 'next/server';
import { z } from 'zod';

import { answerRulesQuestion } from '@/lib/ai';
import { getConversation, saveQaPair } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  sessionId: z.string().min(1),
  gameId: z.string().min(1),
  question: z.string().min(3).max(500)
});

export async function POST(request: Request) {
  const payload = await request.json();
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

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'RulesGenie could not answer right now.' },
      { status: 500 }
    );
  }
}
