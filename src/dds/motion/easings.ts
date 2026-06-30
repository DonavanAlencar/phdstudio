/**
 * Motion Foundation — curvas de easing DDS.
 */

export const easings = {
  /** Alias semântico — curva padrão de interface */
  standard: 'var(--phd-ease-standard)',
  /** Alias semântico — desaceleração (entrada) */
  decelerate: 'var(--phd-ease-decelerate)',
  /** Alias semântico — aceleração (saída) */
  accelerate: 'var(--phd-ease-accelerate)',
  default: 'var(--phd-ease-default)',
  enter: 'var(--phd-ease-enter)',
  exit: 'var(--phd-ease-exit)',
  spring: 'var(--phd-ease-spring)',
  linear: 'var(--phd-ease-linear)',
} as const;

export const easingBezier = {
  standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  default: 'cubic-bezier(0.16, 1, 0.3, 1)',
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  linear: 'linear',
} as const;

export type EasingToken = keyof typeof easings;
