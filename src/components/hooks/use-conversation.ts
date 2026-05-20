'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { AskResponseSchema, ConversationHistorySchema } from '@/lib/api-schemas';
import { safeJsonParse } from '@/lib/fetch-utils';
import type { ConversationErrorKind } from '@/lib/ux';
import type { QaRecord } from '@/types';

/**
 * Manages conversation state: fetching history, submitting questions, and tracking loading/error/suggestions.
 */
export function useConversation(sessionId: string, gameId: string) {
  const [history, setHistory] = useState<QaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [errorState, setErrorState] = useState<{
    message: string;
    kind: ConversationErrorKind;
    retryPrompt?: string;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const initialQuestionFired = useRef(false);
  const historyAbortControllerRef = useRef<AbortController | null>(null);
  const askAbortControllerRef = useRef<AbortController | null>(null);
  const askTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSubmittedPromptRef = useRef('');
  const previousScopeRef = useRef({ sessionId: '', gameId: '' });

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

  useEffect(() => {
    const previousScope = previousScopeRef.current;
    const scopeChanged = previousScope.sessionId !== sessionId || previousScope.gameId !== gameId;

    if (!scopeChanged) {
      return;
    }

    previousScopeRef.current = { sessionId, gameId };
    setHistory([]);
    setSuggestions([]);
    setErrorState(null);
    setHydrating(Boolean(gameId));
  }, [gameId, sessionId]);

  const loadConversation = useCallback(async () => {
    if (!gameId) {
      cancelPendingAsk();
      historyAbortControllerRef.current?.abort();
      setHistory([]);
      setSuggestions([]);
      setErrorState(null);
      setHydrating(false);
      return;
    }

    if (!sessionId) {
      setHydrating(true);
      return;
    }

    cancelPendingAsk();

    historyAbortControllerRef.current?.abort();
    const controller = new AbortController();
    historyAbortControllerRef.current = controller;

    setErrorState(null);
    setHydrating(true);

    try {
      const response = await fetch(`/api/session?sessionId=${sessionId}&gameId=${gameId}`, { signal: controller.signal });
      if (!response.ok) {
        throw new Error('Could not load conversation history.');
      }
      const raw = await safeJsonParse<unknown>(response, 'Could not load conversation history.');
      const payload = ConversationHistorySchema.parse(raw);
      setHistory(payload.items as QaRecord[]);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setErrorState({
        message: reason instanceof Error ? reason.message : 'Could not load conversation history.',
        kind: 'history'
      });
    } finally {
      if (historyAbortControllerRef.current === controller) {
        historyAbortControllerRef.current = null;
      }
      setHydrating(false);
    }
  }, [cancelPendingAsk, gameId, sessionId]);

  // Fetch conversation history when session/game change
  useEffect(() => {
    void loadConversation();

    return () => {
      historyAbortControllerRef.current?.abort();
      historyAbortControllerRef.current = null;
    };
  }, [loadConversation]);

  useEffect(() => {
    return () => {
      historyAbortControllerRef.current?.abort();
      abortPendingAsk();
    };
  }, [abortPendingAsk]);

  const askQuestion = useCallback(async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || !sessionId || !gameId) return false;

    lastSubmittedPromptRef.current = trimmedPrompt;
    cancelPendingAsk();
    setLoading(true);
    setErrorState(null);
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
        body: JSON.stringify({ sessionId, gameId, question: trimmedPrompt }),
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
      return true;
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') {
        if (timedOut) {
          setErrorState({
            message: 'The request timed out. Please try again.',
            kind: 'ask',
            retryPrompt: trimmedPrompt
          });
        }
      } else {
        setErrorState({
          message: reason instanceof Error ? reason.message : 'RulesGenie could not answer right now.',
          kind: 'ask',
          retryPrompt: trimmedPrompt
        });
      }
      return false;
    } finally {
      if (askAbortControllerRef.current === askController) {
        askAbortControllerRef.current = null;
      }
      clearAskTimeout();
      setLoading(false);
    }
  }, [cancelPendingAsk, clearAskTimeout, gameId, sessionId]);

  const retryLastAction = useCallback(() => {
    if (!errorState) return;

    if (errorState.kind === 'history') {
      void loadConversation();
      return;
    }

    const retryPrompt = errorState.retryPrompt ?? lastSubmittedPromptRef.current;
    if (retryPrompt) {
      void askQuestion(retryPrompt);
    }
  }, [askQuestion, errorState, loadConversation]);

  const resetConversation = useCallback(() => {
    cancelPendingAsk();
    setHistory([]);
    setSuggestions([]);
    setErrorState(null);
  }, [cancelPendingAsk]);

  return {
    history,
    loading,
    hydrating,
    error: errorState?.message ?? '',
    errorKind: errorState?.kind,
    retryPrompt: errorState?.retryPrompt,
    suggestions,
    setSuggestions,
    askQuestion,
    retryLastAction,
    resetConversation,
    cancelAskRequest: cancelPendingAsk,
    initialQuestionFired
  };
}
