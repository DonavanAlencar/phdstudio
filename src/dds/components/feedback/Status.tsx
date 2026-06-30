import React from 'react';
import { Label } from '../typography/Label';
import { cn, createVariants } from '../../utils';

export type StatusState = 'live' | 'idle' | 'success' | 'error';

const dotVariants = createVariants({
  base: 'shrink-0 h-2 w-2 rounded-phd-full',
  variants: {
    state: {
      live: 'bg-phd-data-live shadow-phd-glow-live',
      idle: 'bg-phd-text-tertiary',
      success: 'bg-phd-state-success',
      error: 'bg-phd-state-error',
    },
  },
  defaultVariants: {
    state: 'idle',
  },
});

export interface StatusProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: StatusState;
  label: React.ReactNode;
}

export const Status = React.forwardRef<HTMLDivElement, StatusProps>(function Status(
  { state = 'idle', label, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('inline-flex items-center gap-phd-inline-xs', className)}
      role={state === 'live' ? 'status' : undefined}
      aria-live={state === 'live' ? 'polite' : undefined}
      {...props}
    >
      <span className={dotVariants({ state: state as StatusState })} aria-hidden="true" />
      <Label as="span" spacing="none">
        {label}
      </Label>
    </div>
  );
});

Status.displayName = 'Status';
