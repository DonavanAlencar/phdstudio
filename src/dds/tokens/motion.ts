/**
 * Motion tokens — duração, easing, física, delays.
 * @see docs/design/PHD_Engineering_Design_System.md §1.9, §7
 */

export const duration = {
  instant: 'var(--phd-duration-instant)',
  fast: 'var(--phd-duration-fast)',
  normal: 'var(--phd-duration-normal)',
  slow: 'var(--phd-duration-slow)',
  transform: 'var(--phd-duration-transform)',
  continuous: 'var(--phd-duration-continuous)',
  skeleton: 'var(--phd-duration-skeleton)',
  toast: 'var(--phd-duration-toast)',
} as const;

export const easing = {
  standard: 'var(--phd-ease-standard)',
  decelerate: 'var(--phd-ease-decelerate)',
  accelerate: 'var(--phd-ease-accelerate)',
  default: 'var(--phd-ease-default)',
  enter: 'var(--phd-ease-enter)',
  exit: 'var(--phd-ease-exit)',
  spring: 'var(--phd-ease-spring)',
  linear: 'var(--phd-ease-linear)',
} as const;

export const delay = {
  chain: 'var(--phd-delay-chain)',
  stagger: 'var(--phd-delay-stagger)',
  maxChain: 'var(--phd-delay-max-chain)',
} as const;

export const mass = {
  infinite: 'var(--phd-mass-infinite)',
  heavy: 'var(--phd-mass-heavy)',
  medium: 'var(--phd-mass-medium)',
  light: 'var(--phd-mass-light)',
  minimal: 'var(--phd-mass-minimal)',
} as const;

export const transform = {
  scalePress: 'var(--phd-scale-press)',
  scaleEmerge: 'var(--phd-scale-emerge)',
  translateEmerge: 'var(--phd-translate-emerge)',
  rotateTransform: 'var(--phd-rotate-transform)',
  rotateLoading: 'var(--phd-rotate-loading)',
  shakeError: 'var(--phd-shake-error)',
} as const;

export const motion = {
  duration,
  easing,
  delay,
  mass,
  transform,
} as const;
