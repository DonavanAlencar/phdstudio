/**
 * Spacing tokens — ritmo Fibonacci sobre PHDU.
 * @see docs/design/PHD_Engineering_Design_System.md §1.2
 */

export const spaceInline = {
  xs: 'var(--phd-space-inline-xs)',
  sm: 'var(--phd-space-inline-sm)',
  md: 'var(--phd-space-inline-md)',
} as const;

export const spaceStack = {
  xs: 'var(--phd-space-stack-xs)',
  sm: 'var(--phd-space-stack-sm)',
  md: 'var(--phd-space-stack-md)',
  lg: 'var(--phd-space-stack-lg)',
  xl: 'var(--phd-space-stack-xl)',
  '2xl': 'var(--phd-space-stack-2xl)',
} as const;

export const padding = {
  compact: 'var(--phd-padding-compact)',
  default: 'var(--phd-padding-default)',
  spacious: 'var(--phd-padding-spacious)',
  page: 'var(--phd-padding-page)',
} as const;

export const spacing = {
  phdu: {
    0: 'var(--phd-phdu-0)',
    1: 'var(--phd-phdu-1)',
    2: 'var(--phd-phdu-2)',
    3: 'var(--phd-phdu-3)',
    5: 'var(--phd-phdu-5)',
    8: 'var(--phd-phdu-8)',
    13: 'var(--phd-phdu-13)',
    21: 'var(--phd-phdu-21)',
  },
  inline: spaceInline,
  stack: spaceStack,
  padding,
} as const;
