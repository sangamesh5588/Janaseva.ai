'use client';

import React from 'react';
import { Button as CredButton } from '@cred/neopop-web/lib/components';
import { mainColors } from '@cred/neopop-web/lib/primitives';

export interface NeoButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'dark' | 'danger';
  size?: 'small' | 'medium' | 'big';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function NeoButton({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  icon,
  className = '',
  type = 'button',
}: NeoButtonProps) {
  // Map variant to NeoPOP button color configuration
  const colorMode = variant === 'dark' ? 'dark' : 'light';

  let colorConfig = {
    backgroundColor: mainColors.green,
    borderColor: mainColors.black,
    color: mainColors.black,
    edgeColor: mainColors.black,
  };

  if (variant === 'secondary') {
    colorConfig = {
      backgroundColor: mainColors.white,
      borderColor: mainColors.black,
      color: mainColors.black,
      edgeColor: mainColors.black,
    };
  } else if (variant === 'dark') {
    colorConfig = {
      backgroundColor: mainColors.black,
      borderColor: mainColors.white,
      color: mainColors.white,
      edgeColor: '#333333',
    };
  } else if (variant === 'danger') {
    colorConfig = {
      backgroundColor: mainColors.red,
      borderColor: mainColors.black,
      color: mainColors.white,
      edgeColor: mainColors.black,
    };
  }

  return (
    <div
      className={`inline-block select-none ${fullWidth ? 'w-full flex [&>button]:w-full [&>div]:w-full' : ''} ${className}`}
    >
      <CredButton
        variant={variant === 'primary' ? 'primary' : 'secondary'}
        kind="elevated"
        size={size}
        colorMode={colorMode}
        colorConfig={colorConfig}
        onClick={onClick}
        disabled={disabled}
      >
        <span className="flex items-center justify-center gap-2 font-bold tracking-wide">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </span>
      </CredButton>
    </div>
  );
}
