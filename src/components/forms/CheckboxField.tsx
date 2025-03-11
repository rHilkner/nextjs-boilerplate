'use client';

import React from 'react';
import { Controller, UseFormReturn, FieldValues, Path, FieldError } from 'react-hook-form';
import { Checkbox, CheckboxProps } from '../common/Checkbox';

export interface CheckboxFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField<TFieldValues extends FieldValues = FieldValues>({
  name,
  form,
  label,
  helperText,
  ...props
}: CheckboxFieldProps<TFieldValues>): React.ReactElement {
  const error = form.formState.errors[name] as FieldError | undefined;
  const errorMessage = error?.message;
  
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Checkbox
          {...props}
          id={`field-${name}`}
          checked={field.value}
          onChange={e => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
          name={field.name}
          label={label}
          error={errorMessage}
          helperText={helperText}
          aria-invalid={!!error}
        />
      )}
    />
  );
}