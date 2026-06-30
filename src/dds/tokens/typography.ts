/**
 * Typography tokens DDS.
 * @see docs/design/PHD_Engineering_Design_System.md §1.8
 */

export const fontFamily = {
  display: 'var(--phd-font-display)',
  body: 'var(--phd-font-body)',
  mono: 'var(--phd-font-mono)',
} as const;

export const fontSize = {
  'display-xl': 'var(--phd-type-display-xl-size)',
  display: 'var(--phd-type-display-size)',
  'heading-1': 'var(--phd-type-heading-1-size)',
  'heading-2': 'var(--phd-type-heading-2-size)',
  'heading-3': 'var(--phd-type-heading-3-size)',
  title: 'var(--phd-type-title-size)',
  body: 'var(--phd-type-body-size)',
  'body-sm': 'var(--phd-type-body-sm-size)',
  caption: 'var(--phd-type-caption-size)',
  label: 'var(--phd-type-label-size)',
  mono: 'var(--phd-type-mono-size)',
  'mono-lg': 'var(--phd-type-mono-lg-size)',
} as const;

export const lineHeight = {
  'display-xl': 'var(--phd-type-display-xl-leading)',
  display: 'var(--phd-type-display-leading)',
  'heading-1': 'var(--phd-type-heading-1-leading)',
  'heading-2': 'var(--phd-type-heading-2-leading)',
  'heading-3': 'var(--phd-type-heading-3-leading)',
  title: 'var(--phd-type-title-leading)',
  body: 'var(--phd-type-body-leading)',
  'body-sm': 'var(--phd-type-body-sm-leading)',
  caption: 'var(--phd-type-caption-leading)',
  label: 'var(--phd-type-label-leading)',
  mono: 'var(--phd-type-mono-leading)',
  'mono-lg': 'var(--phd-type-mono-lg-leading)',
} as const;

export const fontWeight = {
  regular: 'var(--phd-font-weight-regular)',
  medium: 'var(--phd-font-weight-medium)',
  semibold: 'var(--phd-font-weight-semibold)',
  bold: 'var(--phd-font-weight-bold)',
} as const;

export const letterSpacing = {
  'display-xl': 'var(--phd-type-display-xl-tracking)',
  display: 'var(--phd-type-display-tracking)',
  'heading-1': 'var(--phd-type-heading-1-tracking)',
  'heading-2': 'var(--phd-type-heading-2-tracking)',
  'heading-3': 'var(--phd-type-heading-3-tracking)',
  label: 'var(--phd-type-label-tracking)',
  'mono-lg': 'var(--phd-type-mono-lg-tracking)',
} as const;

export const typography = {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
} as const;
