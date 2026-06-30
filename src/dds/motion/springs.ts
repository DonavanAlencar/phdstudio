/**
 * Motion Foundation — configurações de spring DDS.
 * Springs derivados de ease-spring com damping alto (DDS §1.9).
 */

export interface SpringConfig {
  tension: number;
  friction: number;
  mass: number;
}

export const springs = {
  /** Micro-interações: toggle, checkbox */
  micro: { tension: 400, friction: 30, mass: 0.5 } satisfies SpringConfig,
  /** Press feedback */
  press: { tension: 500, friction: 35, mass: 0.5 } satisfies SpringConfig,
  /** Cards e painéis */
  structural: { tension: 200, friction: 26, mass: 1.5 } satisfies SpringConfig,
  /** Modais */
  overlay: { tension: 180, friction: 24, mass: 1.2 } satisfies SpringConfig,
} as const;

export type SpringPreset = keyof typeof springs;

/** Converte preset spring para CSS transition shorthand */
export function springTransition(
  properties: string[],
  preset: SpringPreset = 'micro',
): string {
  const { tension, friction, mass } = springs[preset];
  const duration = Math.min(600, Math.max(100, Math.sqrt(mass / tension) * 1000 + friction * 2));
  return properties.map((p) => `${p} ${duration}ms var(--phd-ease-spring)`).join(', ');
}
