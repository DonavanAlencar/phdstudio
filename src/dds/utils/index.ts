/**
 * DDS Utilities — API pública.
 */

export { cn } from './cn';
export { createVariants, type VariantConfig } from './variants';
export {
  productThemes,
  applyProductTheme,
  getProductAccentTokens,
  productThemeDataAttr,
  type ProductTheme,
} from './theme';
export { composeSurface, layer, pad, type ComposeSurfaceOptions } from './composition';
export {
  typeClass,
  typeRoleClass,
  typeStyleProps,
  TYPE_SCALE_TOKENS,
  type TypeStyleOptions,
  type TypeRoleOptions,
} from './typography';
export {
  typeScaleVariants,
  typeRoleVariants,
  typeWeightVariants,
} from './typography-variants';
