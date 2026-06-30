import React from 'react';
import { createVariants } from '../../utils';

/**
 * Variantes tipográficas Display — escala e espaçamento via tokens DDS.
 * @see docs/design/PHD_Engineering_Design_System.md §1.8
 */
const displayVariants = createVariants({
  base: 'phd-font-features-display',
  variants: {
    scale: {
      'display-xl': 'phd-type-display-xl phd-type-color-primary',
      display: 'phd-type-display phd-type-color-primary',
    },
    spacing: {
      none: '',
      default: 'mb-phd-stack-md',
      hero: 'mb-phd-stack-lg',
    },
  },
  defaultVariants: {
    scale: 'display-xl',
    spacing: 'default',
  },
});

export type DisplayScale = 'display-xl' | 'display';
export type DisplaySpacing = 'none' | 'default' | 'hero';

export interface DisplayProps extends React.HTMLAttributes<HTMLElement> {
  /** Elemento semântico — padrão `h1` (CES-005: um único h1 por página no hero). */
  as?: React.ElementType;
  /** Escala responsiva DDS — `display-xl` (hero) ou `display`. */
  scale?: DisplayScale;
  /** Margem inferior tokenizada — `hero` para above-the-fold. */
  spacing?: DisplaySpacing;
}

/**
 * CES-005 — `phd-type-display`
 *
 * **Objetivo:** Títulos de máximo impacto — hero, landing above-the-fold.
 *
 * **Contexto de uso:** Hierarquia primária (hastes verticais do ambigrama). Um único
 * `<Display as="h1">` por viewport no hero. Seguido por `Heading` ou `Body`.
 *
 * **Accent inline:** Composição via filhos — `<span className="text-phd-accent-brand">`
 * (cor sólida). Nunca gradiente (`bg-clip-text`).
 *
 * **Restrições:** Sem container; sem material; peso e tracking exclusivamente dos tokens;
 * família Michroma via `--phd-font-role-display`.
 */
export const Display = React.forwardRef<HTMLElement, DisplayProps>(function Display(
  {
    as: Component = 'h1',
    scale = 'display-xl',
    spacing = 'default',
    className,
    children,
    ...props
  },
  ref,
) {
  const classes = displayVariants({
    scale: scale as DisplayScale,
    spacing: spacing as DisplaySpacing,
    class: className,
  });

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
});

Display.displayName = 'Display';
