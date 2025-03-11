'use client';

import React, { forwardRef } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  id?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-invalid={!!error}
            aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
            {...props}
          />
        </div>
        <div className="ml-2 text-sm">
          {label && (
            <label htmlFor={checkboxId} className="font-medium text-gray-700">
              {label}
            </label>
          )}
          
          {error && (
            <p id={`${checkboxId}-error`} className="mt-1 text-xs text-red-600">
              {error}
            </p>
          )}
          
          {!error && helperText && (
            <p id={`${checkboxId}-helper`} className="mt-1 text-xs text-gray-500">
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';