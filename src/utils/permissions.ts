/**
 * Permission utility functions
 */

export type UserRole = 'user' | 'admin' | 'editor';

export interface User {
  id: string;
  role: UserRole;
  permissions?: string[];
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  
  if (role === 'user') {
    return true; // All authenticated users have 'user' role
  }
  
  return user.role === role;
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  // Admins have all permissions
  if (user.role === 'admin') {
    return true;
  }
  
  // Check specific permissions
  return user.permissions?.includes(permission) || false;
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  
  // Admins have all permissions
  if (user.role === 'admin') {
    return true;
  }
  
  // Check specific permissions
  return permissions.every(permission => 
    user.permissions?.includes(permission) || false
  );
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  
  // Admins have all permissions
  if (user.role === 'admin') {
    return true;
  }
  
  // Check specific permissions
  return permissions.some(permission => 
    user.permissions?.includes(permission) || false
  );
}

/**
 * Get list of permissions for a specific role
 */
export function getRolePermissions(role: UserRole): string[] {
  switch (role) {
    case 'admin':
      return ['*']; // All permissions
    case 'editor':
      return [
        'read:content',
        'write:content',
        'delete:content',
        'read:users',
      ];
    case 'user':
      return [
        'read:content',
        'read:profile',
        'write:profile',
      ];
    default:
      return [];
  }
}