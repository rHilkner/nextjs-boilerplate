/**
 * User data structure
 */
export interface User {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  permissions?: string[];
  name?: string;
  avatar?: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}