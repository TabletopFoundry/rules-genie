'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { QaRecord } from '@/types';

/** Safely parse a JSON response, returning a fallback message on non-JSON bodies. */
async function safeJsonParse<T>(response: Response, fallbackError: string): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(fallbackError);
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(fallbackError);
  }
}

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

    setHydrating(true);
    fetch(`/api/session?sessionId=${sessionId}&gameId=${gameId}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Could not load conversation history.');
        }
        return safeJsonParse<{ items: QaRecord[] }>(response, 'Could not load conversation history.');
      })
      .then((payload) => setHistory(payload.items))
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

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, gameId, question: prompt })
      });

      const payload = await safeJsonParse<{ item?: QaRecord; suggestions?: string[]; error?: string }>(
        response,
        'RulesGenie could not answer right now.'
      );
      if (!response.ok || !payload.item) {
        throw new Error(payload.error ?? 'RulesGenie could not answer right now.');
      }

      setHistory((current) => [...current, payload.item as QaRecord]);
      if (payload.suggestions?.length) {
        setSuggestions(payload.suggestions);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'RulesGenie could not answer right now.');
    } finally {
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
