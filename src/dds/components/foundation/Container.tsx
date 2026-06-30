import React from 'react';
import { cn, createVariants } from '../../utils';

export type ContainerVariant = 'full' | 'wide' | 'content' | 'narrow' | 'micro';

/** `compact` preserva equivalência com `px-4` legado (phdu-2) durante migração */
export type ContainerPaddingX = 'page' | 'compact' | 'none';

const containerVariants = createVariants({
  base: 'relative mx-auto w-full',
  variants: {
    variant: {
      full: 'max-w-full',
      wide: 'max-w-phd-wide',
      content: 'max-w-phd-content',
      narrow: 'max-w-phd-narrow',
      micro: 'max-w-phd-micro',
    },
    paddingX: {
      page: 'px-phd-page',
      compact: 'px-phd-2',
      none: '',
    },
  },
  defaultVariants: {
    variant: 'wide',
    paddingX: 'page',
  },
});

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ContainerVariant;
  paddingX?: ContainerPaddingX;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { variant = 'wide', paddingX = 'page', className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={containerVariants({
        variant: variant as ContainerVariant,
        paddingX: paddingX as ContainerPaddingX,
        class: className,
      })}
      {...props}
    >
      {children}
    </div>
  );
});

Container.displayName = 'Container';
