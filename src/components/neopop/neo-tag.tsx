'use client';

import React from 'react';

export interface NeoTagProps {
  children: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function NeoTag({
  children,
  color = '#111827',
  backgroundColor = '#F3F4F6',
  borderColor,
  icon,
  className = '',
}: NeoTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight ${className}`}
      style={{
        backgroundColor,
        color,
        border: borderColor ? `1px solid ${borderColor}` : 'none',
      }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
