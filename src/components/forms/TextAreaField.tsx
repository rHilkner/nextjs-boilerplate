'use client';

import React from 'react';
import { Controller, UseFormReturn, FieldValues, Path, FieldError } from 'react-hook-form';
import { TextArea } from '../common/TextArea';

export interface TextAreaFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function TextAreaField<TFieldValues extends FieldValues = FieldValues>({
  name,
  form,
  label,
  helperText,
  ...props
}: TextAreaFieldProps<TFieldValues>): React.ReactElement {
  const error = form.formState.errors[name] as FieldError | undefined;
  const errorMessage = error?.message;
  
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <TextArea
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