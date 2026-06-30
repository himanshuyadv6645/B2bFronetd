import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthTokens } from '@/types/user';
import { authService } from '@/services/auth.service';
import { getTokens, setTokens, clearTokens, setLoggingOut } from '@/config/api';
import { clearCachedLocation } from '@/services/location.service';
import { queryClient } from '@/lib/queryClient';
import toast from 'react-hot-toast';

const AUTH_REDIRECT_KEY = 'b2b_auth_redirect';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBuyer: boolean;
  isSeller: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; confirm_password: string; role: 'buyer' | 'seller'; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokensState] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;
  const isAdmin = user?.role === 'admin';
  const isBuyer = user?.role === 'buyer';
  const isSeller = user?.role === 'seller';

  const refreshUser = useCallback(async () => {
    try {
      const storedTokens = getTokens();
      if (!storedTokens) {
        setIsLoading(false);
        return;
      }

      setTokensState(storedTokens);
      const userData = await authService.getProfile();
      setUser(userData);
    } catch {
      clearTokens();
      setTokensState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    setTokens(result.tokens);
    setTokensState(result.tokens);
    setUser(result.user);
  };

  const register = async (data: { email: string; password: string; confirm_password: string; role: 'buyer' | 'seller'; phone?: string }) => {
    const result = await authService.register(data);
    setTokens(result.tokens);
    setTokensState(result.tokens);
    setUser(result.user);
  };

  const logout = async () => {
    // Set flag FIRST to prevent 401 interceptor from redirecting to /login
    setLoggingOut(true);

    try {
      if (tokens?.refresh) {
        await authService.logout(tokens.refresh);
      }
    } finally {
      // Clear only AUTHENTICATED queries — keep public queries (products, categories, brands, homepage)
      const authenticatedKeys = [
        'cart', 'wishlist', 'notifications', 'buyer', 'seller',
        'seller-dashboard', 'seller-pricing', 'seller-inventory', 'seller-orders', 'seller-profile', 'seller-warehouses',
        'admin-dashboard', 'users', 'approvals',
      ];
      authenticatedKeys.forEach((key) => {
        queryClient.removeQueries({ queryKey: [key] });
      });

      // Clear tokens and user state
      clearTokens();
      setTokensState(null);
      setUser(null);
      clearCachedLocation();
      sessionStorage.removeItem(AUTH_REDIRECT_KEY);

      // Simple notification — no forced redirect, no Login button
      toast.success('Logged out successfully', { duration: 3000, position: 'top-center' });

      // Reset flag after a short delay so any lingering 401s don't trigger redirect
      setTimeout(() => setLoggingOut(false), 1000);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoading,
        isAuthenticated,
        isAdmin,
        isBuyer,
        isSeller,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
