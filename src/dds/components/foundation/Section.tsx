import React from 'react';
import { cn } from '../../utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Preserva âncoras existentes (#problema, #contato, etc.) */
  id?: string;
  /** Margem superior para âncoras com navbar fixa — default scroll-mt-28 (~112px) */
  scrollMargin?: boolean;
  /** Vincula aria-labelledby ao header da seção */
  labelledBy?: string;
  /** Conteúdo decorativo absoluto (overlays legados preservados na migração) */
  decor?: React.ReactNode;
  as?: 'section' | 'div';
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(function Section(
  {
    id,
    scrollMargin = true,
    labelledBy,
    decor,
    as: Component = 'section',
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <Component
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={cn('relative overflow-hidden', scrollMargin && 'scroll-mt-28', className)}
      {...props}
    >
      {decor}
      {children}
    </Component>
  );
});

Section.displayName = 'Section';
