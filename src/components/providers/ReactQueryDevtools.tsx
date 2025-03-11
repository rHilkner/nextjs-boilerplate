'use client';

import { useState, useEffect } from 'react';

/**
 * A component that dynamically loads React Query Devtools only in development
 * and only on the client-side to avoid SSR issues
 */
export function ReactQueryDevtoolsProduction() {
  // This state will hold the devtools component once loaded/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [DevtoolsComponent, setDevtoolsComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Skip loading in production
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    
    // Dynamically import the devtools
    const importDevtools = async () => {
      try {
        const devtoolsModule = await import('@tanstack/react-query-devtools');
        setDevtoolsComponent(() => devtoolsModule.ReactQueryDevtools);
      } catch (e) {
        console.error('Could not load React Query Devtools', e);
      }
    };

    importDevtools();
  }, []);

  // Render the devtools if loaded, otherwise render nothing
  return DevtoolsComponent ? <DevtoolsComponent initialIsOpen={false} /> : null;
}