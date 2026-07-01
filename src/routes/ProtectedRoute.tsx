import { Navigate, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthRedirect } from '@/contexts/AuthRedirectContext';
import { PageLoading } from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'buyer' | 'seller' | 'admin'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { saveRedirect } = useAuthRedirect();
  const location = useLocation();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    saveRedirect({
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      scrollY: window.scrollY,
      timestamp: Date.now(),
    });

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search + location.hash,
          message: 'Please login to continue',
        }}
      />
    );
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { getAndClearRedirect } = useAuthRedirect();
  // Resolve the post-login destination exactly ONCE per mount. getAndClearRedirect
  // consumes a one-time value from sessionStorage, and React 19 StrictMode double-
  // invokes render — without this guard the 2nd invocation would get null and fall
  // back to home, dropping the saved product URL the user came from.
  const target = useRef<string | null>(null);

  if (isLoading) {
    return <PageLoading />;
  }

  if (isAuthenticated && user?.role) {
    if (target.current === null) {
      const redirectState = getAndClearRedirect();
      if (redirectState) {
        target.current = redirectState.pathname + redirectState.search + redirectState.hash;
        // Restore scroll after navigation
        const scrollY = redirectState.scrollY;
        requestAnimationFrame(() => window.scrollTo(0, scrollY));
        // NOTE: pending action stays in sessionStorage for target component to execute on mount
      } else {
        target.current = user.role === 'buyer' ? '/' : `/${user.role}/dashboard`;
      }
    }
    return <Navigate to={target.current} replace />;
  }

  return <>{children}</>;
}
