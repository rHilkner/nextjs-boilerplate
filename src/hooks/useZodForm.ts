'use client';

import { useForm, UseFormProps, UseFormReturn, SubmitHandler, DefaultValues, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema, TypeOf } from 'zod';
import { useState } from 'react';
import { fetchApi } from '@/hooks/useApi';

/**
 * A custom hook that wraps react-hook-form with zod schema validation
 */
export function useZodForm<TSchema extends ZodSchema<unknown>>(
  props: { 
    schema: TSchema; 
    defaultValues?: DefaultValues<any>;
    [key: string]: any;
  }
) {
  const { schema, ...formProps } = props;

  return useForm({
    ...formProps,
    resolver: zodResolver(schema),
  });
}

export interface UseZodFormSubmitProps<TResponse = unknown> {
  schema: ZodSchema<unknown>;
  defaultValues?: any;
  onSuccess?: (data: TResponse) => void;
  onError?: (error: Error) => void;
  apiUrl?: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

/**
 * A hook for handling form submission with API integration
 */
export function useZodFormSubmit<TResponse = unknown>({
  schema,
  defaultValues,
  onSuccess,
  onError,
  apiUrl,
  method = 'POST',
}: UseZodFormSubmitProps<TResponse>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<TResponse | null>(null);

  const form = useZodForm({
    schema,
    defaultValues,
  });

  const handleSubmit = async (formData: any) => {
    if (!apiUrl) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await fetchApi<TResponse>(apiUrl, {
        method,
        body: formData,
      });
      
      setResponse(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj.message);
      
      if (onError) {
        onError(errorObj);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    error,
    response,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}