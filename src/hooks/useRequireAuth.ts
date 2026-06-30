import { useAuth } from '@/contexts/AuthContext';
import { useAuthRedirect } from '@/contexts/AuthRedirectContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import type { PendingActionPayload } from '@/types/auth-redirect';

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const { saveRedirect } = useAuthRedirect();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = useCallback(
    (action?: string, pendingAction?: PendingActionPayload) => {
      if (!isAuthenticated) {
        // Save full redirect state to sessionStorage
        saveRedirect({
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
          scrollY: window.scrollY,
          pendingAction,
          timestamp: Date.now(),
        });

        navigate('/login', {
          state: {
            from: location.pathname + location.search + location.hash,
            message: action
              ? `Please login to ${action}`
              : 'Please login to continue',
          },
        });
        return false;
      }
      return true;
    },
    [isAuthenticated, navigate, location.pathname, location.search, location.hash, saveRedirect]
  );

  return { requireAuth, isAuthenticated };
}
