'use client';

import React from 'react';
import { Controller, UseFormReturn, FieldValues, Path, FieldError } from 'react-hook-form';
import { Input, InputProps } from '../common/Input';

export interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  label?: string;
  helperText?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormField<TFieldValues extends FieldValues = FieldValues>({
  name,
  form,
  label,
  helperText,
  ...props
}: FormFieldProps<TFieldValues>): React.ReactElement {
  const error = form.formState.errors[name] as FieldError | undefined;
  const errorMessage = error?.message;
  
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Input
          {...field}
          {...props}
          id={`field-${name}`}
          name={name}
          label={label}
          error={errorMessage}
          helperText={helperText}
          aria-invalid={!!error}
        />
      )}
    />
  );
}