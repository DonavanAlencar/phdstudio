import React from 'react';
import { createVariants } from '../../utils';

/**
 * Variantes tipográficas Label — uppercase exclusivamente via token `phd-type-label`.
 */
const labelVariants = createVariants({
  base: 'phd-type-label phd-font-features-body inline-block',
  variants: {
    tone: {
      default: 'phd-type-color-tertiary',
      nav: 'phd-type-color-secondary',
    },
    disabled: {
      true: 'text-phd-disabled cursor-not-allowed',
      false: '',
    },
    spacing: {
      none: '',
      default: 'mb-phd-stack-xs',
    },
  },
  defaultVariants: {
    tone: 'default',
    disabled: 'false' as const,
    spacing: 'none',
  },
});

export type LabelTone = 'default' | 'nav';
export type LabelSpacing = 'none' | 'default';

export interface LabelProps extends React.HTMLAttributes<HTMLElement> {
  /** Associação com input (renderiza `<label>` quando definido). */
  htmlFor?: string;
  /** Elemento — `label` quando `htmlFor` presente; caso contrário `span`. */
  as?: 'label' | 'span';
  /** Tom: formulário (`tertiary`) ou navegação (`secondary`). */
  tone?: LabelTone;
  /** Estado desabilitado — `text-phd-disabled`. */
  disabled?: boolean;
  /** Margem inferior antes de input associado. */
  spacing?: LabelSpacing;
}

/**
 * CES-009 — `phd-type-label`
 *
 * **Objetivo:** Rótulos UI, caps de navegação, metadados e tags textuais.
 *
 * **Contexto de uso:** Labels de formulário (`htmlFor` obrigatório), links Navbar,
 * micro labels de spotlight. Uppercase via `--phd-text-transform-uppercase` no token —
 * nunca classe `uppercase` inline.
 *
 * **Restrições:** 12px; tracking +0.06em via token; proibido CAPS em parágrafos longos;
 * hierarquia silenciosa (tertiary/secondary).
 */
export const Label = React.forwardRef<HTMLElement, LabelProps>(function Label(
  {
    as,
    tone = 'default',
    disabled = false,
    spacing = 'none',
    className,
    children,
    htmlFor,
    ...props
  },
  ref,
) {
  const Component: React.ElementType =
    as ?? (htmlFor != null ? 'label' : 'span');

  const classes = labelVariants({
    tone: tone as LabelTone,
    disabled: disabled ? ('true' as const) : ('false' as const),
    spacing: spacing as LabelSpacing,
    class: className,
  });

  return (
    <Component ref={ref} className={classes} htmlFor={htmlFor} {...props}>
      {children}
    </Component>
  );
});

Label.displayName = 'Label';
