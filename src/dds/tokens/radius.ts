/**
 * Radius tokens — chanfro 60°, squircle, circular.
 * @see docs/design/PHD_Engineering_Design_System.md §1.6
 */

export const radius = {
  none: 'var(--phd-radius-none)',
  chamferSm: 'var(--phd-radius-chamfer-sm)',
  chamferMd: 'var(--phd-radius-chamfer-md)',
  chamferLg: 'var(--phd-radius-chamfer-lg)',
  squircleSm: 'var(--phd-radius-squircle-sm)',
  squircleMd: 'var(--phd-radius-squircle-md)',
  full: 'var(--phd-radius-full)',
} as const;

/** Clip-path polygons para chanfro hexagonal (60°) */
export const chamferClip = {
  sm: 'var(--phd-chamfer-clip-sm)',
  md: 'var(--phd-chamfer-clip-md)',
  lg: 'var(--phd-chamfer-clip-lg)',
} as const;
