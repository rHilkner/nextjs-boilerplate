'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useUser } from '@/hooks/useUser';

interface WithPermissionProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function WithPermission({ permission, children, fallback = null }: WithPermissionProps) {
  const { isLoading } = useUser();
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  // While loading, render nothing
  if (isLoading) {
    return null;
  }
  
  // Check permissions
  const hasAccess = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);
  
  // If user has permission, render children, otherwise render fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

interface WithRoleProps {
  role: 'ADMIN' | 'CUSTOMER';
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 */
export function WithRole({ role, children, fallback = null }: WithRoleProps) {
  const { isLoading } = useUser();
  const { hasRole } = usePermissions();
  
  // While loading, render nothing
  if (isLoading) {
    return null;
  }
  
  // If user has role, render children, otherwise render fallback
  return hasRole(role) ? <>{children}</> : <>{fallback}</>;
}