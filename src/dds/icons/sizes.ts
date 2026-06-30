/**
 * Icon Foundation — escala de tamanhos PHDU.
 * Grid base: phdu-3 × phdu-3 (24×24px).
 */

import type { IconSize } from './types';

export const iconSizes: Record<IconSize, { px: number; token: string; class: string }> = {
  xs: { px: 16, token: 'var(--phd-phdu-2)', class: 'size-phd-icon-xs' },
  sm: { px: 20, token: '20px', class: 'size-phd-icon-sm' },
  md: { px: 24, token: 'var(--phd-phdu-3)', class: 'size-phd-icon-md' },
  lg: { px: 32, token: '32px', class: 'size-phd-icon-lg' },
  xl: { px: 48, token: '48px', class: 'size-phd-icon-xl' },
};

export const defaultIconSize: IconSize = 'md';

export function resolveIconSize(size: IconSize = defaultIconSize) {
  return iconSizes[size];
}
