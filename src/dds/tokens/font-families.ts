/**
 * Famílias tipográficas DDS — papéis semânticos e fallbacks.
 * @see docs/design/PHD_Engineering_Design_System.md §1.8
 */

/** Stack de fallback para sans-serif de interface */
export const fontFallbackSans = 'var(--phd-font-fallback-sans)';

/** Stack de fallback para monospace técnica */
export const fontFallbackMono = 'var(--phd-font-fallback-mono)';

/**
 * Papéis tipográficos oficiais do DDS.
 * Display/Heading → wide geométrica; Body/Label → neutra; Mono → dados.
 */
export const fontRoles = {
  display: 'var(--phd-font-role-display)',
  heading: 'var(--phd-font-role-heading)',
  body: 'var(--phd-font-role-body)',
  label: 'var(--phd-font-role-label)',
  mono: 'var(--phd-font-role-mono)',
} as const;

/** Famílias base (compatibilidade 05A + papéis) */
export const fontFamily = {
  display: fontRoles.display,
  heading: fontRoles.heading,
  body: fontRoles.body,
  label: fontRoles.label,
  mono: fontRoles.mono,
  /** Ponte legada — Montserrat usado pela Landing até Fase 05B.2B */
  legacy: 'var(--phd-font-display-legacy)',
} as const;

/** Estratégia de carregamento (font-display) */
export const fontDisplayStrategy = {
  display: 'var(--phd-font-display-strategy-display)',
  body: 'var(--phd-font-display-strategy-body)',
  mono: 'var(--phd-font-display-strategy-mono)',
} as const;

export type FontRole = keyof typeof fontRoles;
