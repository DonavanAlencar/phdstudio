/**
 * OpenType / font-feature tokens DDS.
 * @see docs/design/PHD_Engineering_Design_System.md §1.8, CES-008
 */

export const fontFeatures = {
  /** Corpo e UI — kerning + ligaduras padrão */
  body: 'var(--phd-font-features-body)',
  /** Display / headings — kerning + ligaduras contextuais */
  display: 'var(--phd-font-features-display)',
  /** Monospace — ligaduras, alternates contextuais */
  mono: 'var(--phd-font-features-mono)',
  /** KPIs, métricas, dados tabulares */
  data: 'var(--phd-font-features-data)',
  /** Números alinhados em colunas (tabelas, dashboards) */
  tabular: 'var(--phd-font-features-tabular)',
} as const;

export const fontVariantNumeric = {
  /** Números proporcionais (texto corrido) */
  proportional: 'var(--phd-font-variant-numeric-proportional)',
  /** Números tabulares (métricas, KPIs) */
  tabular: 'var(--phd-font-variant-numeric-tabular)',
  /** Alinhamento em linha de base */
  lining: 'var(--phd-font-variant-numeric-lining)',
} as const;

export const textTransform = {
  none: 'var(--phd-text-transform-none)',
  uppercase: 'var(--phd-text-transform-uppercase)',
} as const;
