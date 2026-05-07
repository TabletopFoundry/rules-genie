'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { AskResponseSchema, ConversationHistorySchema } from '@/lib/api-schemas';
import { safeJsonParse } from '@/lib/fetch-utils';
import type { QaRecord } from '@/types';

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
  const historyAbortControllerRef = useRef<AbortController | null>(null);
  const askAbortControllerRef = useRef<AbortController | null>(null);
  const askTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAskTimeout = useCallback(() => {
    if (askTimeoutRef.current) {
      clearTimeout(askTimeoutRef.current);
      askTimeoutRef.current = null;
    }
  }, []);

  const abortPendingAsk = useCallback(() => {
    askAbortControllerRef.current?.abort();
    askAbortControllerRef.current = null;
    clearAskTimeout();
  }, [clearAskTimeout]);

  const cancelPendingAsk = useCallback(() => {
    abortPendingAsk();
    setLoading(false);
  }, [abortPendingAsk]);

  // Fetch conversation history when session/game change
  useEffect(() => {
    if (!sessionId || !gameId) return;

    cancelPendingAsk();

    // Cancel any in-flight history fetch (e.g. rapid game switching)
    historyAbortControllerRef.current?.abort();
    const controller = new AbortController();
    historyAbortControllerRef.current = controller;

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
      .finally(() => {
        if (historyAbortControllerRef.current === controller) {
          historyAbortControllerRef.current = null;
        }
        setHydrating(false);
      });

    return () => {
      controller.abort();
      if (historyAbortControllerRef.current === controller) {
        historyAbortControllerRef.current = null;
      }
    };
  }, [cancelPendingAsk, gameId, sessionId]);

  useEffect(() => {
    return () => {
      historyAbortControllerRef.current?.abort();
      abortPendingAsk();
    };
  }, [abortPendingAsk]);

  const askQuestion = useCallback(async (prompt: string) => {
    if (!prompt || !sessionId || !gameId) return;

    cancelPendingAsk();
    setLoading(true);
    setError('');
    setSuggestions([]);

    const askController = new AbortController();
    askAbortControllerRef.current = askController;
    let timedOut = false;
    askTimeoutRef.current = setTimeout(() => {
      timedOut = true;
      askController.abort();
    }, 20_000);

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
        if (timedOut) {
          setError('The request timed out. Please try again.');
        }
      } else {
        setError(reason instanceof Error ? reason.message : 'RulesGenie could not answer right now.');
      }
    } finally {
      if (askAbortControllerRef.current === askController) {
        askAbortControllerRef.current = null;
      }
      clearAskTimeout();
      setLoading(false);
    }
  }, [cancelPendingAsk, clearAskTimeout, gameId, sessionId]);

  const resetConversation = useCallback(() => {
    cancelPendingAsk();
    setHistory([]);
    setSuggestions([]);
    setError('');
  }, [cancelPendingAsk]);

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
