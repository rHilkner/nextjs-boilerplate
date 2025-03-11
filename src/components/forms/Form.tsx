'use client';

import React from 'react';
import { FieldValues, UseFormReturn, SubmitHandler, DefaultValues } from 'react-hook-form';
import { ZodSchema, TypeOf } from 'zod';
import { useZodForm } from '@/hooks/useZodForm';

export interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  form?: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: React.ReactNode;
  className?: string;
  id?: string;
  resetOnSubmit?: boolean;
}

export function Form<TFieldValues extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  className,
  id,
  resetOnSubmit = false,
}: FormProps<TFieldValues>): React.ReactElement {
  const handleSubmit = async (data: TFieldValues) => {
    await onSubmit(data);
    
    if (resetOnSubmit && form) {
      form.reset();
    }
  };

  const isSubmitting = form?.formState.isSubmitting;

  return (
    <form id={id} className={className} onSubmit={form?.handleSubmit(handleSubmit)}>
      <div className="space-y-4">
        {isSubmitting && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {form?.formState.errors.root?.message && (
          <div className="mb-4 p-4 text-sm bg-red-50 text-red-600 rounded-md">
            {form.formState.errors.root?.message?.toString()}
          </div>
        )}
        
        {children}
      </div>
    </form>
  );
}

export interface FormContainerProps {
  schema: ZodSchema<unknown>;
  defaultValues?: any;
  onSubmit: SubmitHandler<any>;
  children: (form: any) => React.ReactNode;
  className?: string;
  id?: string;
  resetOnSubmit?: boolean;
}

export function FormContainer({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  id,
  resetOnSubmit = false,
}: FormContainerProps): React.ReactElement {
  const form = useZodForm({
    schema,
    defaultValues,
  });

  return (
    <Form
      form={form}
      onSubmit={onSubmit}
      className={className}
      id={id}
      resetOnSubmit={resetOnSubmit}
    >
      {children(form)}
    </Form>
  );
}