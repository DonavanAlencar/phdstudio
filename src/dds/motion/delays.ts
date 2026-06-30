/**
 * Motion Foundation — delays e cascata DDS.
 */

export const delays = {
  chain: 'var(--phd-delay-chain)',
  stagger: 'var(--phd-delay-stagger)',
  maxChain: 'var(--phd-delay-max-chain)',
} as const;

export const delayMs = {
  chain: 40,
  stagger: 60,
  maxChain: 600,
} as const;

/** Calcula delay de cascata para item em lista (superior-esquerda → inferior-direita) */
export function staggerDelay(index: number, maxItems = 8): string {
  if (index >= maxItems) return '0ms';
  return `${index * delayMs.stagger}ms`;
}

/** Calcula delay em cadeia com limite máximo */
export function chainDelay(step: number): string {
  const ms = Math.min(step * delayMs.chain, delayMs.maxChain);
  return `${ms}ms`;
}
