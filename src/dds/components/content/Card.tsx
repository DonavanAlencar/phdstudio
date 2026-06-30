import React from 'react';
import { Surface, type SurfaceProps } from '../foundation/Surface';
import { cn, createVariants } from '../../utils';

export type CardAccent = 'brand' | 'creative' | 'insights' | 'flow';

export interface CardProps extends Omit<SurfaceProps, 'material' | 'as'> {
  featured?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const cardIconVariants = createVariants({
  base: cn(
    'inline-flex items-center justify-center p-phd-compact phd-chamfer-sm',
    'border',
  ),
  variants: {
    accent: {
      brand: 'bg-phd-accent-brand-muted border-phd-border-accent text-phd-accent-brand',
      creative: 'bg-phd-accent-creative-muted border-phd-accent-creative text-phd-accent-creative',
      insights: 'bg-phd-accent-insights-muted border-phd-accent-insights text-phd-accent-insights',
      flow: 'bg-phd-accent-flow-muted border-phd-accent-flow text-phd-accent-flow',
    },
  },
  defaultVariants: {
    accent: 'brand',
  },
});

export interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: CardAccent;
  className?: string;
  children?: React.ReactNode;
}

function CardRoot(
  { featured = false, padding = 'default', chamfer, interactive = true, className, ...props }: CardProps,
  ref: React.Ref<HTMLElement>,
) {
  return (
    <Surface
      ref={ref}
      as="article"
      material="graphite"
      padding={padding}
      chamfer={chamfer ?? (featured ? 'lg' : 'md')}
      interactive={interactive}
      className={cn('flex flex-col gap-phd-stack-sm', className)}
      {...props}
    />
  );
}

function CardIcon({ accent = 'brand', className, children, ...props }: CardIconProps) {
  return (
    <div className={cardIconVariants({ accent: accent as CardAccent, class: className })} {...props}>
      {children}
    </div>
  );
}

export const Card = Object.assign(React.forwardRef(CardRoot), {
  Icon: CardIcon,
});

Card.displayName = 'Card';
