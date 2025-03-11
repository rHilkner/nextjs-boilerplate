'use client';

import {useForm, DefaultValues, FieldValues, UseFormReturn} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { useState } from 'react';
import { fetchApi } from '@/hooks/useApi';

/**
 * A custom hook that wraps react-hook-form with zod schema validation
 */
export function useZodForm<TFieldValues extends FieldValues = FieldValues>(
  props: { 
    schema: ZodSchema<TFieldValues>;
    defaultValues?: DefaultValues<TFieldValues>;
    [key: string]: unknown;
  }
): UseFormReturn<TFieldValues> {
  const { schema, ...formProps } = props;

  return useForm({
    ...formProps,
    resolver: zodResolver(schema),
  });
}

export interface UseZodFormSubmitProps<TFieldValues extends FieldValues = FieldValues> {
  schema: ZodSchema<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  onSuccess?: (data: TFieldValues) => void;
  onError?: (error: Error) => void;
  apiUrl?: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

/**
 * A hook for handling form submission with API integration
 */
export function useZodFormSubmit<TFieldValues extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  onSuccess,
  onError,
  apiUrl,
  method = 'POST',
}: UseZodFormSubmitProps<TFieldValues>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<TFieldValues | null>(null);

  const form = useZodForm({
    schema,
    defaultValues,
  });

  const handleSubmit = async (formData: unknown) => {
    if (!apiUrl) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await fetchApi<TFieldValues>(apiUrl, {
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