import React from 'react';
import { Card } from '@/components/common/Card';
import { LoginButton } from '@/components/auth/LoginButton';
import { authRoutes } from '@/config/auth';
import { metadata as rootMetadata } from '@/app/layout';

export const metadata = {
  ...rootMetadata,
  title: 'Sign In - Next.js SaaS Boilerplate',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string; error?: string };
}) {
  const redirectUrl = searchParams?.redirect || authRoutes.signInRedirect;
  const errorMessage = searchParams?.error;

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 sm:px-10">
          {errorMessage && (
            <div className="mb-4 p-4 text-sm bg-red-50 text-red-600 rounded-md">
              {errorMessage === 'OAuthAccountNotLinked'
                ? 'This email is already associated with another provider.'
                : 'An error occurred during sign in. Please try again.'}
            </div>
          )}

          <div className="space-y-4">
            <LoginButton
              provider="google"
              redirectUrl={redirectUrl}
              className="w-full"
            />
            
            <div className="mt-4 text-sm text-center text-gray-600">
              We only support Google authentication at this time
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}