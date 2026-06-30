import React from 'react';
import { cn, createVariants } from '../../utils';

const inputVariants = createVariants({
  base: cn(
    'w-full min-h-[48px] px-phd-compact',
    'phd-material-recesso phd-focus-ring phd-transition-fast',
    'font-phd-body text-phd-primary placeholder:text-phd-tertiary',
    'border border-phd-border-default',
    'hover:border-phd-border-strong',
    'focus-visible:shadow-phd-focus focus-visible:outline-none',
    'disabled:opacity-[var(--phd-opacity-disabled)] disabled:cursor-not-allowed',
  ),
  variants: {
    state: {
      default: '',
      error: 'border-phd-state-error phd-motion-shake-error',
      success: 'border-phd-state-success',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: 'default' | 'error' | 'success';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { state = 'default', className, 'aria-invalid': ariaInvalid, ...props },
  ref,
) {
  const isError = state === 'error' || ariaInvalid === true;

  return (
    <input
      ref={ref}
      className={inputVariants({
        state: isError ? 'error' : state === 'success' ? 'success' : 'default',
        class: className,
      })}
      aria-invalid={isError || undefined}
      {...props}
    />
  );
});

Input.displayName = 'Input';
