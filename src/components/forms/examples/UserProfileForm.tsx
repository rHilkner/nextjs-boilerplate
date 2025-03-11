'use client';

import React from 'react';
import { z } from 'zod';
import { Button } from '@/components/common/Button';
import { FormContainer } from '@/components/forms/Form';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { CheckboxField } from '@/components/forms/CheckboxField';
import { TextAreaField } from '@/components/forms/TextAreaField';

// Define the form schema using Zod
const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  role: z.enum(['user', 'admin', 'editor'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  department: z.string().min(1, 'Please select a department'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  notify: z.boolean().default(false),
  acceptTerms: z.boolean()
    .refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
});

// Infer the TypeScript type from the schema
type UserProfileFormData = z.infer<typeof userProfileSchema>;

// Options for the department select field
const departmentOptions = [
  { value: '', label: 'Select a department' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Customer Support' },
  { value: 'hr', label: 'Human Resources' },
];

// Options for the role select field
const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Administrator' },
];

interface UserProfileFormProps {
  onSubmit: (data: UserProfileFormData) => void;
  defaultValues?: Partial<UserProfileFormData>;
  isSubmitting?: boolean;
}

/**
 * Example user profile form using React Hook Form with Zod validation
 */
export function UserProfileForm({ onSubmit, defaultValues, isSubmitting }: UserProfileFormProps) {
  return (
    <FormContainer
      schema={userProfileSchema}
      defaultValues={{
        name: '',
        email: '',
        phone: '',
        role: 'user',
        department: '',
        bio: '',
        notify: false,
        acceptTerms: false,
        ...defaultValues,
      }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              name="name"
              label="Full Name"
              form={form}
              placeholder="Enter your full name"
              required
            />
            
            <FormField
              name="email"
              label="Email Address"
              form={form}
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              name="phone"
              label="Phone Number"
              form={form}
              placeholder="(123) 456-7890"
              helperText="Optional. We'll only use this for account recovery."
            />
            
            <SelectField
              name="role"
              label="Role"
              form={form}
              options={roleOptions}
              required
            />
          </div>
          
          <SelectField
            name="department"
            label="Department"
            form={form}
            options={departmentOptions}
            helperText="Select the department you belong to"
            required
          />
          
          <TextAreaField
            name="bio"
            label="Bio"
            form={form}
            placeholder="Tell us a bit about yourself..."
            helperText="Maximum 500 characters"
            rows={4}
          />
          
          <div className="space-y-2">
            <CheckboxField
              name="notify"
              label="Receive email notifications"
              form={form}
              helperText="We'll send you updates about your account and new features"
            />
            
            <CheckboxField
              name="acceptTerms"
              label="I accept the terms and conditions"
              form={form}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting || form.formState.isSubmitting}>
              Save Profile
            </Button>
          </div>
        </>
      )}
    </FormContainer>
  );
}