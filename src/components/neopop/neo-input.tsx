'use client';

import React from 'react';

export interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function NeoInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}: NeoInputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-neutral-800">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-white text-neutral-900 font-medium rounded-xl border border-neutral-200 py-3 px-3.5 shadow-sm focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 focus:outline-none transition-all placeholder:text-neutral-400 text-sm ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500 ring-2 ring-red-100' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <span className="text-xs font-semibold text-red-600 mt-0.5">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-neutral-500 mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
}

export interface NeoTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function NeoTextArea({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: NeoTextAreaProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-neutral-800">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full bg-white text-neutral-900 font-medium rounded-xl border border-neutral-200 p-3.5 shadow-sm focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 focus:outline-none transition-all placeholder:text-neutral-400 text-sm min-h-[90px] ${
          error ? 'border-red-500 ring-2 ring-red-100' : ''
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-xs font-semibold text-red-600 mt-0.5">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-neutral-500 mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
}
