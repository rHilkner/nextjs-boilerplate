'use client';

import React from 'react';
import { Button, ButtonProps } from '../common/Button';

export interface LogoutButtonProps extends Omit<ButtonProps, 'children'> {
  redirectUrl?: string;
  children?: React.ReactNode;
}

export function LogoutButton({
  redirectUrl,
  children = 'Sign out',
  ...props
}: LogoutButtonProps): React.ReactElement {
  const handleLogout = async () => {
    const url = `/api/auth/logout${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`;
    window.location.href = url;
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      {...props}
    >
      {children}
    </Button>
  );
}