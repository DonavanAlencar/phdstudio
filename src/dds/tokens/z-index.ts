/**
 * Z-index scale DDS — camadas de profundidade semântica.
 */

export const zIndex = {
  base: 'var(--phd-z-base)',
  raised: 'var(--phd-z-raised)',
  dropdown: 'var(--phd-z-dropdown)',
  sticky: 'var(--phd-z-sticky)',
  overlay: 'var(--phd-z-overlay)',
  modal: 'var(--phd-z-modal)',
  popover: 'var(--phd-z-popover)',
  toast: 'var(--phd-z-toast)',
  tooltip: 'var(--phd-z-tooltip)',
  max: 'var(--phd-z-max)',
} as const;
