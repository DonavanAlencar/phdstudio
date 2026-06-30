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
