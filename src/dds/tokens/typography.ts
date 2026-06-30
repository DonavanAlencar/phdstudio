/**
 * Typography tokens DDS — API consolidada.
 * @see docs/design/PHD_Engineering_Design_System.md §1.8
 */

export {
  fontFamily,
  fontRoles,
  fontFallbackSans,
  fontFallbackMono,
  fontDisplayStrategy,
  type FontRole,
} from './font-families';

export { fontFeatures, fontVariantNumeric, textTransform } from './font-features';

export {
  typeScaleStatic,
  typeScaleResponsive,
  type TypeScaleToken,
} from './type-scale';

export const fontSize = {
  'display-xl': 'var(--phd-type-display-xl-size)',
  display: 'var(--phd-type-display-size)',
  'heading-1': 'var(--phd-type-heading-1-size)',
  'heading-2': 'var(--phd-type-heading-2-size)',
  'heading-3': 'var(--phd-type-heading-3-size)',
  title: 'var(--phd-type-title-size)',
  body: 'var(--phd-type-body-size)',
  'body-lg': 'var(--phd-type-body-size)',
  'body-sm': 'var(--phd-type-body-sm-size)',
  caption: 'var(--phd-type-caption-size)',
  label: 'var(--phd-type-label-size)',
  mono: 'var(--phd-type-mono-size)',
  'mono-lg': 'var(--phd-type-mono-lg-size)',
} as const;

export const fontSizeResponsive = {
  'display-xl': 'var(--phd-type-r-display-xl-size)',
  display: 'var(--phd-type-r-display-size)',
  'heading-1': 'var(--phd-type-r-heading-1-size)',
  'heading-2': 'var(--phd-type-r-heading-2-size)',
  'heading-3': 'var(--phd-type-r-heading-3-size)',
  title: 'var(--phd-type-r-title-size)',
  body: 'var(--phd-type-r-body-size)',
  'body-sm': 'var(--phd-type-r-body-sm-size)',
  caption: 'var(--phd-type-r-caption-size)',
  label: 'var(--phd-type-r-label-size)',
  mono: 'var(--phd-type-r-mono-size)',
  'mono-lg': 'var(--phd-type-r-mono-lg-size)',
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
  title: 'var(--phd-type-title-tracking)',
  body: 'var(--phd-type-body-tracking)',
  'body-sm': 'var(--phd-type-body-sm-tracking)',
  caption: 'var(--phd-type-caption-tracking)',
  label: 'var(--phd-type-label-tracking)',
  mono: 'var(--phd-type-mono-tracking)',
  'mono-lg': 'var(--phd-type-mono-lg-tracking)',
} as const;

import { fontFamily } from './font-families';
import { fontFeatures, fontVariantNumeric, textTransform } from './font-features';
import { typeScaleStatic, typeScaleResponsive } from './type-scale';

export const typography = {
  fontFamily,
  fontSize,
  fontSizeResponsive,
  lineHeight,
  fontWeight,
  letterSpacing,
  fontFeatures,
  fontVariantNumeric,
  textTransform,
  typeScaleStatic,
  typeScaleResponsive,
} as const;
