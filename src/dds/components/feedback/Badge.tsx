import React from 'react';
import { cn, createVariants } from '../../utils';

export type BadgeVariant = 'brand' | 'creative' | 'insights' | 'success' | 'warning';

const badgeVariants = createVariants({
  base: cn(
    'inline-flex items-center justify-center h-6 px-phd-2 phd-chamfer-sm',
    'phd-type-label phd-font-features-body uppercase',
  ),
  variants: {
    variant: {
      brand: 'bg-phd-accent-brand-muted text-phd-accent-brand',
      creative: 'bg-phd-accent-creative-muted text-phd-accent-creative',
      insights: 'bg-phd-accent-insights-muted text-phd-accent-insights',
      success: 'bg-phd-state-success-muted text-phd-state-success',
      warning: 'bg-phd-state-warning-muted text-phd-state-warning',
    },
  },
  defaultVariants: {
    variant: 'brand',
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'brand', className, children, ...props },
  ref,
) {
  return (
    <span ref={ref} className={badgeVariants({ variant: variant as BadgeVariant, class: className })} {...props}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
