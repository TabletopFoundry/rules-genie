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

/** In-memory fallback when localStorage is unavailable (Safari private browsing, quota exceeded). */
const memoryStore = new Map<string, string>();

function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}

function storageRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    memoryStore.delete(key);
  }
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
    const existing = storageGet(storageKey);
    const nextSessionId = existing ?? createSessionId();
    if (!existing) {
      storageSet(storageKey, nextSessionId);
    }
    setSessionId(nextSessionId);
  }, [gameId]);

  function clearSession() {
    if (!gameId) return;
    const storageKey = makeSessionKey(gameId);
    storageRemove(storageKey);
    const newId = createSessionId();
    storageSet(storageKey, newId);
    setSessionId(newId);
  }

  return { sessionId, clearSession };
}
