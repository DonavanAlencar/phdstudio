import React from 'react';
import { cn, createVariants } from '../../utils';

/**
 * Variantes tipográficas Mono — dados, KPIs e métricas com nums tabulares.
 */
const monoVariants = createVariants({
  base: cn('phd-type-color-primary', 'phd-font-features-data', 'phd-font-variant-tabular'),
  variants: {
    size: {
      default: 'phd-type-mono',
      lg: 'phd-type-mono-lg',
    },
    live: {
      true: 'text-phd-data-live shadow-phd-glow-live',
      false: '',
    },
    align: {
      left: '',
      right: 'text-right',
    },
  },
  defaultVariants: {
    size: 'default',
    live: 'false' as const,
    align: 'left',
  },
});

export type MonoSize = 'default' | 'lg';
export type MonoAlign = 'left' | 'right';

export interface MonoProps extends React.HTMLAttributes<HTMLElement> {
  /** Elemento semântico — padrão `span`; use `data` para valores machine-readable. */
  as?: React.ElementType;
  /** Escala `mono` ou `mono-lg` (KPI grande). */
  size?: MonoSize;
  /** Dado ao vivo — accent + glow funcional (CES-008). */
  live?: boolean;
  /** Alinhamento à direita em contextos métricos/tabular. */
  align?: MonoAlign;
}

/**
 * CES-008 — `phd-type-mono`
 *
 * **Objetivo:** Dados, métricas, valores exatos e timestamps — precisão de engenharia.
 *
 * **Contexto de uso:** KPIs, métricas Insights, logs, valores em tabelas. JetBrains Mono
 * via `--phd-font-role-mono`.
 *
 * **Restrições:** Números sempre monospace; tabular + lining nums ativos por padrão;
 * proibido odometer; sem gradiente. `live` ativa `aria-live="polite"`.
 */
export const Mono = React.forwardRef<HTMLElement, MonoProps>(function Mono(
  {
    as: Component = 'span',
    size = 'default',
    live = false,
    align = 'left',
    className,
    children,
    ...props
  },
  ref,
) {
  const classes = monoVariants({
    size: size as MonoSize,
    live: live ? ('true' as const) : ('false' as const),
    align: align as MonoAlign,
    class: className,
  });

  return (
    <Component
      ref={ref}
      className={classes}
      aria-live={live ? 'polite' : undefined}
      {...props}
    >
      {children}
    </Component>
  );
});

Mono.displayName = 'Mono';
