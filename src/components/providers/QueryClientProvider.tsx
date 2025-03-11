'use client';

import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { ReactQueryDevtoolsProduction } from './ReactQueryDevtools';

interface QueryClientProviderProps {
  children: ReactNode;
}

/**
 * Provider component for React Query
 */
export function QueryClientProvider({ children }: QueryClientProviderProps) {
  // Create a new query client instance for each client session
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      },
    },
  }));

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
      {/* Dynamically loads devtools only on client-side and in development */}
      <ReactQueryDevtoolsProduction />
    </TanstackQueryClientProvider>
  );
}