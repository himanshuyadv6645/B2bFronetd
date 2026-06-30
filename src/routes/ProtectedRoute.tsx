import { Navigate, useLocation } from 'react-router-dom';
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

  if (isLoading) {
    return <PageLoading />;
  }

  if (isAuthenticated && user?.role) {
    const redirectState = getAndClearRedirect();
    if (redirectState) {
      const targetUrl = redirectState.pathname + redirectState.search + redirectState.hash;
      // Restore scroll after navigation
      requestAnimationFrame(() => {
        window.scrollTo(0, redirectState.scrollY);
      });
      // NOTE: pending action stays in sessionStorage for target component to execute on mount
      return <Navigate to={targetUrl} replace />;
    }

    const redirectPath = user.role === 'buyer' ? '/' : `/${user.role}/dashboard`;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
