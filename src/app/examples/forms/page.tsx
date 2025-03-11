'use client';

import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { UserProfileForm } from '@/components/forms/examples/UserProfileForm';
import { UserProfileFormData } from "@/lib/schemas";

/**
 * Example page that demonstrates how to use the form components
 */
export default function FormsExamplePage() {
  const [submittedData, setSubmittedData] = useState<UserProfileFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UserProfileFormData) => {
    setIsSubmitting(true);
    
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmittedData(data);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Form Components Example</h1>
        <p className="mt-2 text-lg text-gray-600">
          This example demonstrates how to build forms using React Hook Form and Zod validation.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">User Profile Form</h2>
            <UserProfileForm 
              onSubmit={handleSubmit} 
              isSubmitting={isSubmitting}
            />
          </Card>
        </div>
        
        <div>
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Form Data</h2>
            {submittedData ? (
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-96">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 italic">Submit the form to see the data here</p>
            )}
          </Card>
          
          <div className="mt-8">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Form Features</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Type-safe form validation with Zod</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Real-time form validation</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Error messages from schema definitions</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Form state management with React Hook Form</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Accessibility features built-in</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}