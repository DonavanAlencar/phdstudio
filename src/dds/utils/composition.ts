/**
 * Infraestrutura de composição DDS — slots e layering.
 */

import { cn } from './cn';
import type { MaterialId } from '../tokens/materials';
import { resolveMaterialClasses } from '../materials';
import type { MaterialState } from '../materials/types';

export interface ComposeSurfaceOptions {
  material: MaterialId;
  state?: MaterialState;
  chamfer?: 'sm' | 'md' | 'lg' | false;
  focusable?: boolean;
  className?: string;
}

/** Compõe classes de superfície DDS sem lógica de componente */
export function composeSurface({
  material,
  state = 'default',
  chamfer = 'md',
  focusable = false,
  className,
}: ComposeSurfaceOptions): string {
  const chamferClass =
    chamfer === false
      ? ''
      : chamfer === 'sm'
        ? 'phd-chamfer-sm'
        : chamfer === 'lg'
          ? 'phd-chamfer-lg'
          : 'phd-chamfer-md';

  return cn(
    resolveMaterialClasses(material, state),
    chamferClass,
    focusable && 'phd-focus-ring',
    className,
  );
}

/** Stack de camadas z-index semântico */
export const layer = {
  base: 'z-phd-base',
  raised: 'z-phd-raised',
  dropdown: 'z-phd-dropdown',
  sticky: 'z-phd-sticky',
  overlay: 'z-phd-overlay',
  modal: 'z-phd-modal',
  popover: 'z-phd-popover',
  toast: 'z-phd-toast',
  tooltip: 'z-phd-tooltip',
} as const;

/** Padding semântico DDS */
export const pad = {
  compact: 'p-phd-compact',
  default: 'p-phd-default',
  spacious: 'p-phd-spacious',
} as const;
