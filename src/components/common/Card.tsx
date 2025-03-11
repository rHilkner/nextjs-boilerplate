'use client';

import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  hoverable?: boolean;
  bordered?: boolean;
}

export function Card({
  title,
  subtitle,
  children,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  hoverable = false,
  bordered = true,
}: CardProps): React.ReactElement {
  // Base classes
  const baseClasses = 'bg-white rounded-lg overflow-hidden shadow-sm';
  
  // Hoverable classes
  const hoverableClasses = hoverable ? 'transition-shadow hover:shadow-md' : '';
  
  // Border classes
  const borderClasses = bordered ? 'border border-gray-200' : '';

  return (
    <div className={`${baseClasses} ${hoverableClasses} ${borderClasses} ${className}`}>
      {(title || subtitle) && (
        <div className={`px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      <div className={`px-6 py-4 ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
}