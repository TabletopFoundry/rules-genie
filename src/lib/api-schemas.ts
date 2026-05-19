import { z } from 'zod';

/** Schema for /api/ask response — validates key fields, passes through the rest. */
export const AskResponseSchema = z.object({
  item: z
    .object({
      id: z.string(),
      sessionId: z.string(),
      question: z.string(),
      answer: z.string()
    })
    .passthrough()
    .optional(),
  suggestions: z.array(z.string()).optional(),
  error: z.string().optional()
});

/** Schema for /api/session (conversation history) response. */
export const ConversationHistorySchema = z.object({
  items: z.array(
    z
      .object({
        id: z.string(),
        sessionId: z.string(),
        question: z.string(),
        answer: z.string()
      })
      .passthrough()
  )
});

/** Schema for toggle responses (bookmarks, collection). */
export const ToggleResponseSchema = z.object({
  active: z.boolean()
});

/** Schema for feedback success responses. */
export const FeedbackResponseSchema = z.object({
  success: z.boolean()
});
