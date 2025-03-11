import { z } from "zod";

// PUBLIC ENVIRONMENT VARIABLES (Frontend Safe)
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// PRIVATE ENVIRONMENT VARIABLES (Backend Only)
const privateEnvSchema = publicEnvSchema.extend({
  // Authentication
  JWT_SECRET: z.string().min(32).default("your-super-secret-jwt-key-at-least-32-chars"),
  JWT_EXPIRY: z.string().default("7d"),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  APP_URL: z.string().default("http://localhost:3000"),
  
  // Logging
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  
  // Database
  DEBUG_PRISMA: z.enum(["1", "0"]).default("0"),
});

// Parse environments separately to avoid exposure
export const public_env_vars = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
});

export const env_vars = privateEnvSchema.parse({
  // Public vars first
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
  
  // Private vars
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  APP_URL: process.env.APP_URL,
  
  LOG_LEVEL: process.env.LOG_LEVEL,
  
  DEBUG_PRISMA: process.env.DEBUG_PRISMA,
});