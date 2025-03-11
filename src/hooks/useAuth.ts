'use client';

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/components/auth/AuthProvider';

/**
 * Hook for accessing authentication state and methods
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}