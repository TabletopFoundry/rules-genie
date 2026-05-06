'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { QaRecord } from '@/types';
import { AskResponseSchema, ConversationHistorySchema } from '@/lib/api-schemas';
import { safeJsonParse } from '@/lib/fetch-utils';

/**
 * Manages conversation state: fetching history, submitting questions, and tracking loading/error/suggestions.
 */
export function useConversation(sessionId: string, gameId: string) {
  const [history, setHistory] = useState<QaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const initialQuestionFired = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch conversation history when session/game change
  useEffect(() => {
    if (!sessionId || !gameId) return;

    // Cancel any in-flight history fetch (e.g. rapid game switching)
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setError('');
    setHydrating(true);
    fetch(`/api/session?sessionId=${sessionId}&gameId=${gameId}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Could not load conversation history.');
        }
        return safeJsonParse<unknown>(response, 'Could not load conversation history.');
      })
      .then((raw) => {
        const payload = ConversationHistorySchema.parse(raw);
        setHistory(payload.items as QaRecord[]);
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError(reason instanceof Error ? reason.message : 'Could not load conversation history.');
      })
      .finally(() => setHydrating(false));

    return () => controller.abort();
  }, [gameId, sessionId]);

  const askQuestion = useCallback(async (prompt: string) => {
    if (!prompt || !sessionId || !gameId) return;

    setLoading(true);
    setError('');
    setSuggestions([]);

    const askController = new AbortController();
    const askTimeout = setTimeout(() => askController.abort(), 20_000);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, gameId, question: prompt }),
        signal: askController.signal
      });

      const raw = await safeJsonParse<unknown>(
        response,
        'RulesGenie could not answer right now.'
      );
      const payload = AskResponseSchema.parse(raw);
      if (!response.ok || !payload.item) {
        throw new Error(payload.error ?? 'RulesGenie could not answer right now.');
      }

      setHistory((current) => [...current, payload.item as QaRecord]);
      if (payload.suggestions?.length) {
        setSuggestions(payload.suggestions);
      }
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') {
        setError('The request timed out. Please try again.');
      } else {
        setError(reason instanceof Error ? reason.message : 'RulesGenie could not answer right now.');
      }
    } finally {
      clearTimeout(askTimeout);
      setLoading(false);
    }
  }, [gameId, sessionId]);

  const resetConversation = useCallback(() => {
    setHistory([]);
    setSuggestions([]);
    setError('');
  }, []);

  return {
    history,
    loading,
    hydrating,
    error,
    suggestions,
    setSuggestions,
    askQuestion,
    resetConversation,
    initialQuestionFired
  };
}
