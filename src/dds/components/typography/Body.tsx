import React from 'react';
import { createVariants } from '../../utils';

/**
 * Variantes tipográficas Body — tamanho e tom via tokens DDS.
 */
const bodyVariants = createVariants({
  base: 'phd-font-features-body',
  variants: {
    size: {
      lg: 'phd-type-body-lg',
      default: 'phd-type-body',
      sm: 'phd-type-body-sm',
    },
    tone: {
      default: 'phd-type-color-secondary',
      muted: 'phd-type-color-tertiary',
      emphasis: 'phd-type-color-primary',
    },
    prose: {
      true: 'phd-type-prose',
      false: '',
    },
    spacing: {
      none: '',
      default: 'mb-phd-stack-sm',
    },
  },
  defaultVariants: {
    size: 'default',
    tone: 'default',
    prose: 'false' as const,
    spacing: 'none',
  },
});

export type BodySize = 'lg' | 'default' | 'sm';
export type BodyTone = 'default' | 'muted' | 'emphasis';
export type BodySpacing = 'none' | 'default';

export interface BodyProps extends React.HTMLAttributes<HTMLElement> {
  /** Elemento semântico — padrão `p`; use `span` para inline. */
  as?: React.ElementType;
  /** Escala: `lg` (body-lg), `default` (body), `sm` (body-sm). */
  size?: BodySize;
  /** Atalho CES — equivalente a `tone="muted"`. */
  muted?: boolean;
  /** Atalho CES — equivalente a `tone="emphasis"`. */
  emphasis?: boolean;
  /** Tom hierárquico por opacidade (nunca gray Tailwind). */
  tone?: BodyTone;
  /** Limita largura a 65ch para leitura longa. */
  prose?: boolean;
  /** Margem inferior entre parágrafos. */
  spacing?: BodySpacing;
}

/**
 * CES-007 — `phd-type-body`
 *
 * **Objetivo:** Texto corrido, descrições e parágrafos de apoio.
 *
 * **Contexto de uso:** Subtítulos de seção, corpo de cards, hero abaixo do Display.
 * Tom padrão `text-phd-secondary` (70%).
 *
 * **Restrições:** Mínimo 16px no tamanho default; proibido `font-light`; hierarquia por
 * opacidade (`text-phd-*`), não por cor decorativa.
 */
export const Body = React.forwardRef<HTMLElement, BodyProps>(function Body(
  {
    as: Component = 'p',
    size = 'default',
    muted = false,
    emphasis = false,
    tone: toneProp,
    prose = false,
    spacing = 'none',
    className,
    children,
    ...props
  },
  ref,
) {
  const tone: BodyTone =
    toneProp ?? (muted ? 'muted' : emphasis ? 'emphasis' : 'default');

  const classes = bodyVariants({
    size: size as BodySize,
    tone: tone as BodyTone,
    prose: prose ? ('true' as const) : ('false' as const),
    spacing: spacing as BodySpacing,
    class: className,
  });

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
});

Body.displayName = 'Body';
