'use client';

import React from 'react';

export interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function NeoCard({
  children,
  className = '',
  onClick,
  interactive = false,
}: NeoCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-sm transition-all ${
        interactive
          ? 'cursor-pointer hover:border-neutral-300 hover:shadow active:scale-[0.99]'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
