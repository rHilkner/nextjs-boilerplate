/**
 * Environment configuration
 */
import { public_env_vars, env_vars } from '@/lib/env-vars';

// Define the current environment
const environment = public_env_vars.NODE_ENV;

// Define the base URL for the application
const baseUrl = public_env_vars.NEXT_PUBLIC_APP_URL;

// Define the API URL
const apiUrl = `${baseUrl}/api`;

// Define debug mode
const isDebugMode = env_vars.LOG_LEVEL === 'debug';

// Define whether the app is running in production
const isProduction = environment === 'production';

// Define whether the app is running in development
const isDevelopment = environment === 'development';

// Define whether the app is running in test
const isTest = environment === 'test';

// Export environment variables
export const env = {
  environment,
  baseUrl,
  apiUrl,
  isDebugMode,
  isProduction,
  isDevelopment,
  isTest,
  
  // Define whether the app is running on the server
  isServer: typeof window === 'undefined',
  
  // Define whether the app is running on the client
  isClient: typeof window !== 'undefined',
};

// Export a type for environment variables
export type Environment = typeof env;