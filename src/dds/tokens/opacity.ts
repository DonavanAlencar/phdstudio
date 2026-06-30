/**
 * Opacity e blur tokens.
 * @see docs/design/PHD_Engineering_Design_System.md §1.11
 */

export const opacity = {
  full: 'var(--phd-opacity-full)',
  high: 'var(--phd-opacity-high)',
  medium: 'var(--phd-opacity-medium)',
  low: 'var(--phd-opacity-low)',
  subtle: 'var(--phd-opacity-subtle)',
  faint: 'var(--phd-opacity-faint)',
  ghost: 'var(--phd-opacity-ghost)',
  disabled: 'var(--phd-opacity-disabled)',
} as const;

export const blur = {
  none: 'var(--phd-blur-none)',
  sm: 'var(--phd-blur-sm)',
  md: 'var(--phd-blur-md)',
  lg: 'var(--phd-blur-lg)',
  xl: 'var(--phd-blur-xl)',
} as const;
