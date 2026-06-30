/**
 * PHD Design System — Design Tokens
 * Fonte de verdade programática; valores resolvidos via CSS custom properties.
 */

export { PHDU_BASE, phdu, type PhduScale } from './phdu';
export {
  colors,
  surfaceColors,
  textColors,
  borderColors,
  accentColors,
  stateColors,
  overlayColors,
  aiColors,
  dataColors,
} from './colors';
export { spacing, spaceInline, spaceStack, padding } from './spacing';
export { typography, fontFamily, fontSize, lineHeight, fontWeight, letterSpacing } from './typography';
export { radius, chamferClip } from './radius';
export { elevation, shadow, highlight, glow } from './elevation';
export { opacity, blur } from './opacity';
export { motion, duration, easing, delay, mass, transform } from './motion';
export { materials, materialIds, materialElevation, type MaterialId } from './materials';
export { breakpoints, containers, grid } from './breakpoints';
export { zIndex } from './z-index';

import { phdu } from './phdu';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radius } from './radius';
import { elevation } from './elevation';
import { opacity, blur } from './opacity';
import { motion } from './motion';
import { materials } from './materials';
import { breakpoints, containers, grid } from './breakpoints';
import { zIndex } from './z-index';

/** Inventário consolidado de tokens para introspecção e documentação */
export const tokens = {
  phdu,
  colors,
  spacing,
  typography,
  radius,
  elevation,
  opacity,
  blur,
  motion,
  materials,
  breakpoints,
  containers,
  grid,
  zIndex,
} as const;

export type Tokens = typeof tokens;
