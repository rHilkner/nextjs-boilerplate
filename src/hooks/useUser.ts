'use client';

import { useAuth } from './useAuth';

/**
 * Hook for accessing the current authenticated user
 */
export function useUser() {
  const { user, isLoading } = useAuth();
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isLoading,
  };
}