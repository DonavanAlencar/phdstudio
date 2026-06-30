/**
 * Icon Foundation — convenções gramaticais DDS.
 * @see DDL Cap. 3 — Iconografia
 */

export const iconConventions = {
  /** Traço monoline, peso uniforme */
  stroke: {
    default: 1.5,
    compact: 1.25,
    emphasis: 2,
  },
  /** Cantos angulares 60°/120°, nunca curvos */
  geometry: 'angular-60-120',
  /** Terminações chanfradas como hastes do ambigrama */
  terminations: 'chamfered',
  /** Grid de construção */
  grid: '24x24-phdu',
  /** Estilo primário outline; filled para estados ativos */
  primaryVariant: 'outline' as const,
  activeVariant: 'filled' as const,
  /** Metáfora permitida */
  metaphor: ['mecânica', 'estrutural', 'operacional'] as const,
  /** Metáforas proibidas */
  forbidden: ['orgânica', 'decorativa', 'literal-ia'] as const,
  /** Cor segue hierarquia de opacidade de texto */
  colorHierarchy: {
    default: 'var(--phd-text-secondary)',
    active: 'var(--phd-text-primary)',
    disabled: 'var(--phd-text-disabled)',
  },
  /** Espaçamento ícone + label */
  labelGap: 'var(--phd-space-inline-xs)',
} as const;

export type IconConvention = typeof iconConventions;
