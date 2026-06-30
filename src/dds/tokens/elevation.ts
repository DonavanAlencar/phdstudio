/**
 * Elevation tokens — sombras, highlights e glow funcional.
 * @see docs/design/PHD_Engineering_Design_System.md §1.10
 */

export const shadow = {
  none: 'var(--phd-shadow-none)',
  contact: 'var(--phd-shadow-contact)',
  raised: 'var(--phd-shadow-raised)',
  elevated: 'var(--phd-shadow-elevated)',
  accent: 'var(--phd-shadow-accent)',
  inset: 'var(--phd-shadow-inset)',
  insetDeep: 'var(--phd-shadow-inset-deep)',
} as const;

export const highlight = {
  edge: 'var(--phd-highlight-edge)',
  edgeLeft: 'var(--phd-highlight-edge-left)',
  glass: 'var(--phd-highlight-glass)',
} as const;

export const glow = {
  focus: 'var(--phd-glow-focus)',
  processing: 'var(--phd-glow-processing)',
  live: 'var(--phd-glow-live)',
  connection: 'var(--phd-glow-connection)',
} as const;

export const elevation = {
  shadow,
  highlight,
  glow,
  level: {
    0: shadow.none,
    1: shadow.contact,
    2: shadow.raised,
    3: shadow.elevated,
  },
} as const;
