'use client';

import React from 'react';
import { Controller, UseFormReturn, FieldValues, Path, FieldError } from 'react-hook-form';
import { Select, SelectProps, SelectOption } from '../common/Select';

export interface SelectFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  label?: string;
  options: SelectOption[];
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SelectField<TFieldValues extends FieldValues = FieldValues>({
  name,
  form,
  label,
  options,
  helperText,
  ...props
}: SelectFieldProps<TFieldValues>): React.ReactElement {
  const error = form.formState.errors[name] as FieldError | undefined;
  const errorMessage = error?.message;
  
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Select
          {...field}
          {...props}
          id={`field-${name}`}
          options={options}
          label={label}
          error={errorMessage}
          helperText={helperText}
          aria-invalid={!!error}
        />
      )}
    />
  );
}