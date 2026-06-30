import React from 'react';
import { cn, createVariants } from '../../utils';

export type DividerOrientation = 'horizontal' | 'vertical' | 'diagonal';
export type DividerEmphasis = 'subtle' | 'default' | 'accent' | 'active';

const dividerVariants = createVariants({
  base: 'shrink-0 border-0',
  variants: {
    orientation: {
      horizontal: 'w-full border-t my-phd-stack-md h-0',
      vertical: 'h-full border-l mx-phd-inline-sm self-stretch w-0',
      diagonal:
        'w-full border-t my-phd-stack-md h-0 origin-left rotate-[60deg] max-w-phd-content',
    },
    emphasis: {
      subtle: 'border-phd-border-subtle',
      default: 'border-phd-border-default',
      accent: 'border-phd-border-accent',
      active: 'border-phd-border-accent shadow-phd-glow-connection',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    emphasis: 'subtle',
  },
});

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: DividerOrientation;
  emphasis?: DividerEmphasis;
  /** Oculta divisor diagonal em viewports menores que md */
  hideDiagonalOnMobile?: boolean;
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    emphasis = 'subtle',
    hideDiagonalOnMobile = true,
    className,
    ...props
  },
  ref,
) {
  const ariaOrientation = orientation === 'vertical' ? 'vertical' : 'horizontal';

  return (
    <hr
      ref={ref}
      role="separator"
      aria-orientation={ariaOrientation}
      className={cn(
        dividerVariants({
          orientation: orientation as DividerOrientation,
          emphasis: emphasis as DividerEmphasis,
        }),
        orientation === 'diagonal' && hideDiagonalOnMobile && 'hidden md:block',
        className,
      )}
      {...props}
    />
  );
});

Divider.displayName = 'Divider';
