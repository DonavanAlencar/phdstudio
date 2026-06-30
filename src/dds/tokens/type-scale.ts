/**
 * Escala tipográfica DDS — tokens estáticos e responsivos.
 * Valores desktop em :root; overrides em typography-scale.css.
 * @see docs/design/PHD_Engineering_Design_System.md §1.8
 */

/** Tokens de tamanho estáticos (desktop base) */
export const typeScaleStatic = {
  'display-xl': {
    size: 'var(--phd-type-display-xl-size)',
    leading: 'var(--phd-type-display-xl-leading)',
    tracking: 'var(--phd-type-display-xl-tracking)',
    weight: 'var(--phd-font-weight-bold)',
    family: 'var(--phd-font-role-display)',
  },
  display: {
    size: 'var(--phd-type-display-size)',
    leading: 'var(--phd-type-display-leading)',
    tracking: 'var(--phd-type-display-tracking)',
    weight: 'var(--phd-font-weight-bold)',
    family: 'var(--phd-font-role-display)',
  },
  'heading-1': {
    size: 'var(--phd-type-heading-1-size)',
    leading: 'var(--phd-type-heading-1-leading)',
    tracking: 'var(--phd-type-heading-1-tracking)',
    weight: 'var(--phd-font-weight-semibold)',
    family: 'var(--phd-font-role-heading)',
  },
  'heading-2': {
    size: 'var(--phd-type-heading-2-size)',
    leading: 'var(--phd-type-heading-2-leading)',
    tracking: 'var(--phd-type-heading-2-tracking)',
    weight: 'var(--phd-font-weight-semibold)',
    family: 'var(--phd-font-role-heading)',
  },
  'heading-3': {
    size: 'var(--phd-type-heading-3-size)',
    leading: 'var(--phd-type-heading-3-leading)',
    tracking: 'var(--phd-type-heading-3-tracking)',
    weight: 'var(--phd-font-weight-semibold)',
    family: 'var(--phd-font-role-heading)',
  },
  title: {
    size: 'var(--phd-type-title-size)',
    leading: 'var(--phd-type-title-leading)',
    tracking: 'var(--phd-type-title-tracking)',
    weight: 'var(--phd-font-weight-medium)',
    family: 'var(--phd-font-role-body)',
  },
  'body-lg': {
    size: 'var(--phd-type-body-size)',
    leading: 'var(--phd-type-body-leading)',
    tracking: 'var(--phd-type-body-tracking)',
    weight: 'var(--phd-font-weight-regular)',
    family: 'var(--phd-font-role-body)',
  },
  body: {
    size: 'var(--phd-type-body-size)',
    leading: 'var(--phd-type-body-leading)',
    tracking: 'var(--phd-type-body-tracking)',
    weight: 'var(--phd-font-weight-regular)',
    family: 'var(--phd-font-role-body)',
  },
  'body-sm': {
    size: 'var(--phd-type-body-sm-size)',
    leading: 'var(--phd-type-body-sm-leading)',
    tracking: 'var(--phd-type-body-sm-tracking)',
    weight: 'var(--phd-font-weight-regular)',
    family: 'var(--phd-font-role-body)',
  },
  caption: {
    size: 'var(--phd-type-caption-size)',
    leading: 'var(--phd-type-caption-leading)',
    tracking: 'var(--phd-type-caption-tracking)',
    weight: 'var(--phd-font-weight-regular)',
    family: 'var(--phd-font-role-body)',
  },
  label: {
    size: 'var(--phd-type-label-size)',
    leading: 'var(--phd-type-label-leading)',
    tracking: 'var(--phd-type-label-tracking)',
    weight: 'var(--phd-font-weight-medium)',
    family: 'var(--phd-font-role-label)',
    transform: 'var(--phd-text-transform-uppercase)',
  },
  mono: {
    size: 'var(--phd-type-mono-size)',
    leading: 'var(--phd-type-mono-leading)',
    tracking: 'var(--phd-type-mono-tracking)',
    weight: 'var(--phd-font-weight-medium)',
    family: 'var(--phd-font-role-mono)',
    features: 'var(--phd-font-features-data)',
    variantNumeric: 'var(--phd-font-variant-numeric-tabular)',
  },
  'mono-lg': {
    size: 'var(--phd-type-mono-lg-size)',
    leading: 'var(--phd-type-mono-lg-leading)',
    tracking: 'var(--phd-type-mono-lg-tracking)',
    weight: 'var(--phd-font-weight-medium)',
    family: 'var(--phd-font-role-mono)',
    features: 'var(--phd-font-features-data)',
    variantNumeric: 'var(--phd-font-variant-numeric-tabular)',
  },
} as const;

/**
 * Tokens responsivos — resolvem escala por breakpoint via CSS.
 * Usar em utilitários e componentes CES (Fase 05B.2B).
 */
export const typeScaleResponsive = {
  'display-xl': {
    size: 'var(--phd-type-r-display-xl-size)',
    leading: 'var(--phd-type-r-display-xl-leading)',
    tracking: 'var(--phd-type-r-display-xl-tracking)',
  },
  display: {
    size: 'var(--phd-type-r-display-size)',
    leading: 'var(--phd-type-r-display-leading)',
    tracking: 'var(--phd-type-r-display-tracking)',
  },
  'heading-1': {
    size: 'var(--phd-type-r-heading-1-size)',
    leading: 'var(--phd-type-r-heading-1-leading)',
    tracking: 'var(--phd-type-r-heading-1-tracking)',
  },
  'heading-2': {
    size: 'var(--phd-type-r-heading-2-size)',
    leading: 'var(--phd-type-r-heading-2-leading)',
    tracking: 'var(--phd-type-r-heading-2-tracking)',
  },
  'heading-3': {
    size: 'var(--phd-type-r-heading-3-size)',
    leading: 'var(--phd-type-r-heading-3-leading)',
    tracking: 'var(--phd-type-r-heading-3-tracking)',
  },
  title: {
    size: 'var(--phd-type-r-title-size)',
    leading: 'var(--phd-type-r-title-leading)',
    tracking: 'var(--phd-type-r-title-tracking)',
  },
  body: {
    size: 'var(--phd-type-r-body-size)',
    leading: 'var(--phd-type-r-body-leading)',
    tracking: 'var(--phd-type-r-body-tracking)',
  },
  'body-sm': {
    size: 'var(--phd-type-r-body-sm-size)',
    leading: 'var(--phd-type-r-body-sm-leading)',
    tracking: 'var(--phd-type-r-body-sm-tracking)',
  },
  caption: {
    size: 'var(--phd-type-r-caption-size)',
    leading: 'var(--phd-type-r-caption-leading)',
    tracking: 'var(--phd-type-r-caption-tracking)',
  },
  label: {
    size: 'var(--phd-type-r-label-size)',
    leading: 'var(--phd-type-r-label-leading)',
    tracking: 'var(--phd-type-r-label-tracking)',
  },
  mono: {
    size: 'var(--phd-type-r-mono-size)',
    leading: 'var(--phd-type-r-mono-leading)',
    tracking: 'var(--phd-type-r-mono-tracking)',
  },
  'mono-lg': {
    size: 'var(--phd-type-r-mono-lg-size)',
    leading: 'var(--phd-type-r-mono-lg-leading)',
    tracking: 'var(--phd-type-r-mono-lg-tracking)',
  },
} as const;

export type TypeScaleToken = keyof typeof typeScaleStatic;
