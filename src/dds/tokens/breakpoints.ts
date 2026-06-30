/**
 * Breakpoint tokens DDS.
 * @see docs/design/PHD_Engineering_Design_System.md §1.4
 */

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const containers = {
  full: 'var(--phd-container-full)',
  wide: 'var(--phd-container-wide)',
  content: 'var(--phd-container-content)',
  narrow: 'var(--phd-container-narrow)',
  micro: 'var(--phd-container-micro)',
} as const;

export const grid = {
  columnsDesktop: 12,
  columnsTablet: 8,
  columnsMobile: 4,
  gutter: 'var(--phd-grid-gutter)',
  margin: 'var(--phd-grid-margin)',
  maxWidth: 'var(--phd-grid-max-width)',
} as const;
