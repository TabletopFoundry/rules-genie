'use client';

import { useEffect, useState } from 'react';

function makeSessionKey(gameId: string) {
  return `rulesgenie-session:${gameId}`;
}

function createSessionId() {
  if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Manages per-game session IDs via localStorage.
 * Returns the current sessionId and a function to clear/reset the session.
 */
export function useRulesSession(gameId: string) {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    if (!gameId) return;
    const storageKey = makeSessionKey(gameId);
    const existing = window.localStorage.getItem(storageKey);
    const nextSessionId = existing ?? createSessionId();
    if (!existing) {
      window.localStorage.setItem(storageKey, nextSessionId);
    }
    setSessionId(nextSessionId);
  }, [gameId]);

  function clearSession() {
    if (!gameId) return;
    const storageKey = makeSessionKey(gameId);
    window.localStorage.removeItem(storageKey);
    const newId = createSessionId();
    window.localStorage.setItem(storageKey, newId);
    setSessionId(newId);
  }

  return { sessionId, clearSession };
}
