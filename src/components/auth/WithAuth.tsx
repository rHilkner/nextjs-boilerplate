'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

interface WithAuthProps {
  children: React.ReactNode;
}

/**
 * Component that protects routes requiring authentication
 */
export function WithAuth({ children }: WithAuthProps) {
  const { isLoading, isAuthenticated } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if we're not loading and the user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(pathname || '')}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show children only if authenticated
  return isAuthenticated ? <>{children}</> : null;
}