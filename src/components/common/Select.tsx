'use client';

import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  isFullWidth?: boolean;
  id?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      isFullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

    // Base classes
    const baseSelectClasses = 'px-4 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';
    
    // Error classes
    const errorClasses = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300';
    
    // Width classes
    const widthClasses = isFullWidth ? 'w-full' : '';

    return (
      <div className={`${isFullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={`
            ${baseSelectClasses}
            ${errorClasses}
            ${widthClasses}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
        
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="mt-1 text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';