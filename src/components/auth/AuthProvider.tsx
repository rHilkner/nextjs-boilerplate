'use client';

import { createContext, useCallback, ReactNode } from 'react';
import { AuthState, User } from './types';
import { useCurrentUser, useLogout } from '@/hooks/useCurrentUser';

export interface AuthContextType extends AuthState {
  login: (redirectTo?: string) => void;
  logout: () => void;
}

// Create auth context with default values
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Use React Query to fetch the current user
  const { 
    data: user = null,
    isLoading,
    error
  } = useCurrentUser();
  
  // Use React Query for logout
  const { mutate: logoutMutation } = useLogout();

  // Login function - redirects to Google OAuth flow
  const login = useCallback((redirectTo?: string) => {
    // Encode the redirect URL in the state parameter
    const state = redirectTo ? encodeURIComponent(redirectTo) : '';
    
    // Redirect to the login endpoint
    window.location.href = `/api/auth/login?state=${state}`;
  }, []);

  // Logout function using the mutation
  const logout = useCallback(() => {
    logoutMutation();
  }, [logoutMutation]);

  const contextValue: AuthContextType = {
    user: user as User | null,
    isLoading,
    error: error ? String(error) : null,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}