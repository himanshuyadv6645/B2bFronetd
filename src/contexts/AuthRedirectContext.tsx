/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, type ReactNode } from 'react';
import type { AuthRedirectState, PendingActionPayload } from '@/types/auth-redirect';

const STORAGE_KEY = 'b2b_auth_redirect';
const ACTION_KEY = 'b2b_pending_action';
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

interface AuthRedirectContextType {
  saveRedirect: (state: AuthRedirectState) => void;
  getRedirect: () => AuthRedirectState | null;
  clearRedirect: () => void;
  getAndClearRedirect: () => AuthRedirectState | null;
  savePendingAction: (action: PendingActionPayload) => void;
  getAndClearPendingAction: () => PendingActionPayload | null;
}

const AuthRedirectContext = createContext<AuthRedirectContextType | undefined>(undefined);

export function AuthRedirectProvider({ children }: { children: ReactNode }) {
  const saveRedirect = useCallback((state: AuthRedirectState) => {
    try {
      // Save redirect metadata (without pending action) for GuestRoute to read
      const { pendingAction, ...meta } = state;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
      // Save pending action separately so it persists after getAndClearRedirect
      if (pendingAction) {
        sessionStorage.setItem(ACTION_KEY, JSON.stringify(pendingAction));
      }
    } catch {
      // ignore
    }
  }, []);

  const getRedirect = useCallback((): AuthRedirectState | null => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const state: AuthRedirectState = JSON.parse(raw);
      if (Date.now() - state.timestamp > EXPIRY_MS) {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(ACTION_KEY);
        return null;
      }
      return state;
    } catch {
      return null;
    }
  }, []);

  const clearRedirect = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(ACTION_KEY);
  }, []);

  const getAndClearRedirect = useCallback((): AuthRedirectState | null => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const state: AuthRedirectState = JSON.parse(raw);
      if (Date.now() - state.timestamp > EXPIRY_MS) {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(ACTION_KEY);
        return null;
      }
      // Restore pending action from separate key
      const actionRaw = sessionStorage.getItem(ACTION_KEY);
      if (actionRaw) {
        state.pendingAction = JSON.parse(actionRaw);
      }
      // Clear metadata but keep action for target component
      sessionStorage.removeItem(STORAGE_KEY);
      return state;
    } catch {
      return null;
    }
  }, []);

  const savePendingAction = useCallback((action: PendingActionPayload) => {
    try {
      sessionStorage.setItem(ACTION_KEY, JSON.stringify(action));
    } catch {
      // ignore
    }
  }, []);

  const getAndClearPendingAction = useCallback((): PendingActionPayload | null => {
    try {
      const raw = sessionStorage.getItem(ACTION_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(ACTION_KEY);
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthRedirectContext.Provider value={{
      saveRedirect,
      getRedirect,
      clearRedirect,
      getAndClearRedirect,
      savePendingAction,
      getAndClearPendingAction,
    }}>
      {children}
    </AuthRedirectContext.Provider>
  );
}

export function useAuthRedirect() {
  const ctx = useContext(AuthRedirectContext);
  if (!ctx) throw new Error('useAuthRedirect must be used within AuthRedirectProvider');
  return ctx;
}
