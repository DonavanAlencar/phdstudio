/**
 * Icon Foundation — API pública DDS.
 */

export type { IconContract, IconRenderProps, IconSize, IconVariant, IconState } from './types';
export { iconSizes, defaultIconSize, resolveIconSize } from './sizes';
export { iconConventions, type IconConvention } from './conventions';
export {
  registerIcon,
  getIcon,
  hasIcon,
  listIcons,
  listIconsByCategory,
  validateIconContract,
} from './registry';
