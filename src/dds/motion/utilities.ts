/**
 * Motion Foundation — utilitários de transição e interação DDS.
 * Centraliza classes reutilizáveis; componentes não devem hardcodar duração/easing.
 */

import { cn } from '../utils/cn';

/** Classes de transição padronizadas (§7.1) */
export const transitionUtilities = {
  default: 'phd-transition-default',
  fast: 'phd-transition-fast',
  hoverElevation: 'phd-transition-hover-elevation',
  focus: 'phd-transition-focus',
  opacity: 'phd-transition-opacity',
  material: 'phd-transition-material',
} as const;

/** Microinterações de superfície */
export const interactionUtilities = {
  hoverElevation: 'phd-hover-elevation',
  press: 'phd-motion-press',
} as const;

/** Combinações pré-definidas para componentes */
export const componentMotion = {
  button: cn(
    transitionUtilities.fast,
    transitionUtilities.material,
    interactionUtilities.press,
  ),
  cardInteractive: cn(
    transitionUtilities.hoverElevation,
    transitionUtilities.material,
    interactionUtilities.hoverElevation,
  ),
  input: cn(
    transitionUtilities.fast,
    transitionUtilities.focus,
    transitionUtilities.material,
  ),
  videoCard: cn(
    transitionUtilities.hoverElevation,
    interactionUtilities.hoverElevation,
  ),
} as const;

/** Monta propriedades CSS `transition` com tokens DDS */
export function motionTransition(
  properties: string[],
  durationVar = 'var(--phd-duration-fast)',
  easingVar = 'var(--phd-ease-standard)',
): string {
  return properties.map((p) => `${p} ${durationVar} ${easingVar}`).join(', ');
}
