/**
 * Motion Foundation — durações DDS.
 */

export const durations = {
  instant: 'var(--phd-duration-instant)',
  fast: 'var(--phd-duration-fast)',
  normal: 'var(--phd-duration-normal)',
  slow: 'var(--phd-duration-slow)',
  transform: 'var(--phd-duration-transform)',
  continuous: 'var(--phd-duration-continuous)',
  skeleton: 'var(--phd-duration-skeleton)',
  toast: 'var(--phd-duration-toast)',
} as const;

export const durationMs = {
  instant: 100,
  fast: 150,
  normal: 300,
  slow: 500,
  transform: 700,
  continuous: 1200,
  skeleton: 1500,
  toast: 5000,
} as const;

export type DurationToken = keyof typeof durations;

/** Aplica multiplicador de massa à duração base */
export function withMass(duration: DurationToken, massMultiplier: number): string {
  const base = durationMs[duration];
  return `${base * massMultiplier}ms`;
}
