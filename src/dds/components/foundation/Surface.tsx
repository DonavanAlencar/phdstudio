import React from 'react';
import { cn, createVariants } from '../../utils';

export type SurfaceMaterial =
  | 'obsidian'
  | 'graphite'
  | 'graphite-raised'
  | 'glass'
  | 'recessed'
  | 'metal-accent';

export type SurfacePadding = 'none' | 'compact' | 'default' | 'spacious';
export type SurfaceChamfer = 'none' | 'sm' | 'md' | 'lg';
export type SurfaceState = 'default' | 'hover' | 'active' | 'selected' | 'disabled' | 'error';

const surfaceVariants = createVariants({
  base: cn(
    'relative',
    'phd-transition-material duration-phd-fast ease-phd-standard',
  ),
  variants: {
    material: {
      obsidian: 'bg-phd-surface-obsidian shadow-phd-none',
      graphite: cn(
        'bg-phd-surface-graphite-deep border border-phd-border-subtle',
        '[box-shadow:var(--phd-shadow-contact),var(--phd-highlight-edge),var(--phd-highlight-edge-left)]',
      ),
      'graphite-raised': cn(
        'bg-phd-surface-graphite-raised border border-phd-border-default',
        '[box-shadow:var(--phd-shadow-raised),var(--phd-highlight-edge)]',
      ),
      glass: 'phd-material-vidro-fume',
      recessed: 'phd-material-recesso',
      'metal-accent': 'phd-material-metal-accent',
    },
    padding: {
      none: '',
      compact: 'p-phd-compact',
      default: 'p-phd-default',
      spacious: 'p-phd-spacious',
    },
    chamfer: {
      none: '',
      sm: 'phd-chamfer-sm',
      md: 'phd-chamfer-md',
      lg: 'phd-chamfer-lg',
    },
    interactive: {
      true: cn(
        'hover:bg-phd-surface-graphite hover:shadow-phd-raised phd-overlay-hover',
        'phd-transition-hover-elevation phd-transition-material',
      ),
      false: '',
    },
    state: {
      default: '',
      hover: '',
      active: 'phd-overlay-active phd-motion-press',
      selected: 'phd-overlay-selected border-phd-border-accent',
      disabled: 'opacity-[var(--phd-opacity-disabled)] shadow-phd-none pointer-events-none',
      error: 'border-phd-state-error',
    },
  },
  compoundVariants: [
    {
      material: 'graphite',
      interactive: 'true',
      class: cn(
        'hover:bg-phd-surface-graphite',
        '[box-shadow:var(--phd-shadow-raised),var(--phd-highlight-edge),var(--phd-highlight-edge-left)]',
      ),
    },
  ],
  defaultVariants: {
    material: 'graphite',
    padding: 'none',
    chamfer: 'none',
    interactive: 'false',
    state: 'default',
  },
});

export interface SurfaceProps extends React.HTMLAttributes<HTMLElement> {
  /** @deprecated Use `material` — alias CES */
  variant?: SurfaceMaterial;
  material?: SurfaceMaterial;
  padding?: SurfacePadding;
  chamfer?: SurfaceChamfer;
  interactive?: boolean;
  state?: SurfaceState;
  as?: React.ElementType;
}

export const Surface = React.forwardRef<HTMLElement, SurfaceProps>(function Surface(
  {
    variant,
    material: materialProp,
    padding = 'none',
    chamfer = 'none',
    interactive = false,
    state = 'default',
    as: Component = 'div',
    className,
    children,
    ...props
  },
  ref,
) {
  const material = materialProp ?? variant ?? 'graphite';
  const structuralChamfer =
    chamfer !== 'none'
      ? chamfer
      : material === 'recessed' || material === 'obsidian'
        ? 'none'
        : 'md';

  const classes = surfaceVariants({
    material,
    padding: padding as 'none' | 'compact' | 'default' | 'spacious',
    chamfer: structuralChamfer as 'none' | 'sm' | 'md' | 'lg',
    interactive: interactive ? 'true' : 'false',
    state: state as 'default' | 'hover' | 'active' | 'selected' | 'disabled' | 'error',
    class: className,
  });

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
});

Surface.displayName = 'Surface';
