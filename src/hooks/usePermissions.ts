'use client';

import { useAuth } from './useAuth';

/**
 * Hook for checking user permissions
 */
export function usePermissions() {
  const { user } = useAuth();
  
  /**
   * Check if the user has the specified role
   */
  const hasRole = (role: 'ADMIN' | 'CUSTOMER') => {
    return user?.role === role;
  };
  
  /**
   * Check if the user has the specified permission
   */
  const hasPermission = (permission: string) => {
    if (!user || !user.permissions) {
      return false;
    }
    
    return user.permissions.includes(permission);
  };
  
  /**
   * Check if the user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]) => {
    if (!user || !user.permissions) {
      return false;
    }
    
    return permissions.some(permission => user.permissions?.includes(permission));
  };
  
  /**
   * Check if the user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]) => {
    if (!user || !user.permissions) {
      return false;
    }
    
    return permissions.every(permission => user.permissions?.includes(permission));
  };
  
  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: hasRole('ADMIN'),
  };
}