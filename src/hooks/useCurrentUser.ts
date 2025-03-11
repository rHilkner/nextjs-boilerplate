'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/components/auth/types';

/**
 * Fetch the current authenticated user
 */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          // Return null for 401 - not authenticated
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
      }
    },
  });
}

/**
 * Hook for logging out the current user
 */
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate the current user query
      queryClient.setQueryData(['currentUser'], null);
      // Redirect to home page
      window.location.href = '/';
    },
  });
}