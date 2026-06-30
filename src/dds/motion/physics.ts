/**
 * Motion Foundation — física e transformações DDS.
 */

export const physics = {
  mass: {
    infinite: Infinity,
    heavy: 1.5,
    medium: 1,
    light: 0.7,
    minimal: 0.5,
  },
  scale: {
    press: 'var(--phd-scale-press)',
    emerge: 'var(--phd-scale-emerge)',
  },
  translate: {
    emerge: 'var(--phd-translate-emerge)',
  },
  rotate: {
    transform: 'var(--phd-rotate-transform)',
    loading: 'var(--phd-rotate-loading)',
  },
  shake: {
    error: 'var(--phd-shake-error)',
  },
} as const;

export type MassLevel = keyof typeof physics.mass;

export const enterPatterns = {
  emerge: 'phd-motion-emerge',
  emergeSubtle: 'phd-motion-emerge-subtle',
  materialize: 'phd-motion-materialize',
} as const;

export const exitPatterns = {
  recede: 'phd-motion-recede',
  dissolve: 'phd-motion-dissolve',
} as const;

export const loadingPatterns = {
  hexRotate: 'phd-motion-hex-rotate',
  skeletonPulse: 'phd-motion-skeleton-pulse',
} as const;

export const microPatterns = {
  press: 'phd-motion-press',
  shakeError: 'phd-motion-shake-error',
} as const;

export const feedbackPatterns = {
  success: 'phd-motion-emerge-subtle',
  error: 'phd-motion-shake-error',
  loading: 'phd-motion-hex-rotate',
  progress: 'phd-motion-progress-fill',
  skeleton: 'phd-motion-skeleton-pulse',
  focus: 'phd-transition-focus',
} as const;

export const transitionPatterns = {
  hoverElevation: 'phd-transition-hover-elevation',
  focus: 'phd-transition-focus',
  opacity: 'phd-transition-opacity',
  material: 'phd-transition-material',
  default: 'phd-transition-default',
  fast: 'phd-transition-fast',
} as const;
