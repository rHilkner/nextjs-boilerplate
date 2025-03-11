'use client';

import { useState, useCallback } from 'react';
import { env } from '@/config/environment';

interface ApiOptions<T = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: T;
  credentials?: RequestCredentials;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: (path: string, options?: ApiOptions) => Promise<T | null>;
}

/**
 * Custom hook for making API requests
 * Uses the environment configuration for the API URL
 */
export function useApi<T = unknown>(): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (path: string, options?: ApiOptions): Promise<T | null> => {
      // Reset state
      setLoading(true);
      setError(null);

      try {
        const url = path.startsWith('http') ? path : `${env.apiUrl}${path}`;
        
        // Default options
        const defaultOptions: RequestInit = {
          method: options?.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          credentials: options?.credentials || 'include',
        };

        // Add body if provided
        if (options?.body) {
          defaultOptions.body = JSON.stringify(options.body);
        }

        // Make the request
        const response = await fetch(url, defaultOptions);

        // Handle non-2xx responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `API error: ${response.status} ${response.statusText}`
          );
        }

        // Parse response
        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, fetchData };
}

/**
 * Helper function for making one-off API requests without using the hook
 */
export async function fetchApi<T = unknown, B = unknown>(
  path: string,
  options?: ApiOptions<B>
): Promise<T> {
  const url = path.startsWith('http') ? path : `${env.apiUrl}${path}`;
  
  // Default options
  const defaultOptions: RequestInit = {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: options?.credentials || 'include',
  };

  // Add body if provided
  if (options?.body) {
    defaultOptions.body = JSON.stringify(options.body);
  }

  // Make the request
  const response = await fetch(url, defaultOptions);

  // Handle non-2xx responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `API error: ${response.status} ${response.statusText}`
    );
  }

  // Parse response
  return await response.json();
}