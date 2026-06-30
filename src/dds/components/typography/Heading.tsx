import React from 'react';
import { createVariants } from '../../utils';

/**
 * Variantes tipográficas Heading — escala derivada exclusivamente dos tokens DDS.
 */
const headingVariants = createVariants({
  base: 'phd-font-features-display',
  variants: {
    scale: {
      display: 'phd-type-display phd-type-color-primary',
      'heading-1': 'phd-type-heading-1 phd-type-color-primary',
      'heading-2': 'phd-type-heading-2 phd-type-color-primary',
      'heading-3': 'phd-type-heading-3 phd-type-color-primary',
      title: 'phd-type-title phd-type-color-primary',
    },
    centered: {
      true: 'text-center',
      false: '',
    },
    spacing: {
      none: '',
      default: 'mb-phd-stack-sm',
    },
  },
  defaultVariants: {
    scale: 'heading-1',
    centered: 'false' as const,
    spacing: 'default',
  },
});

export type HeadingLevel = 2 | 3 | 4;
export type HeadingScale = 'display' | 'heading-1' | 'heading-2' | 'heading-3' | 'title';
export type HeadingSpacing = 'none' | 'default';

const LEVEL_TAG: Record<HeadingLevel, 'h2' | 'h3' | 'h4'> = {
  2: 'h2',
  3: 'h3',
  4: 'h4',
};

const LEVEL_DEFAULT_SCALE: Record<HeadingLevel, HeadingScale> = {
  2: 'heading-1',
  3: 'heading-2',
  4: 'heading-3',
};

export interface HeadingProps extends React.HTMLAttributes<HTMLElement> {
  /** Nível semântico h2–h4 (CES-006). */
  level: HeadingLevel;
  /** Sobrescreve escala padrão do nível — ex.: `display` em spotlights. */
  scale?: HeadingScale;
  /** Alinhamento centralizado (exceção CES para section headers). */
  centered?: boolean;
  /** Margem inferior tokenizada. */
  spacing?: HeadingSpacing;
  /** Elemento semântico — padrão derivado de `level`. */
  as?: React.ElementType;
}

/**
 * CES-006 — `phd-type-heading`
 *
 * **Objetivo:** Títulos de seção e subseção (h2–h4).
 *
 * **Contexto de uso:** Section headers, títulos de card, taglines subordinadas ao Display.
 * Peso semibold (600) embutido nos tokens `phd-type-heading-*`.
 *
 * **Restrições:** Proibido `font-black` (900) e `tracking-tight` ad-hoc; sem CAPS em blocos
 * longos; hierarquia semântica sem saltos de nível.
 */
export const Heading = React.forwardRef<HTMLElement, HeadingProps>(function Heading(
  {
    level,
    scale,
    centered = false,
    spacing = 'default',
    as,
    className,
    children,
    ...props
  },
  ref,
) {
  const Component = as ?? LEVEL_TAG[level];
  const resolvedScale = scale ?? LEVEL_DEFAULT_SCALE[level];

  const classes = headingVariants({
    scale: resolvedScale as HeadingScale,
    centered: centered ? ('true' as const) : ('false' as const),
    spacing: spacing as HeadingSpacing,
    class: className,
  });

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
});

Heading.displayName = 'Heading';
