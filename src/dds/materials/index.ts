/**
 * Material Engine — registro e API de materiais DDS.
 */

import { obsidiana, obsidianaTextured } from './obsidiana';
import { grafite, grafiteRaised, recesso } from './grafite';
import { vidroFume, vidroFumeHeavy, scrim } from './vidro-fume';
import { metalAccent, getMetalAccentTokens, type AccentVariant } from './metal-accent';
import type { MaterialDefinition, MaterialContext, MaterialState } from './types';
import type { MaterialId } from '../tokens/materials';

export const materialRegistry: Record<MaterialId, MaterialDefinition> = {
  obsidiana,
  grafite,
  'vidro-fume': vidroFume,
  'metal-accent': metalAccent,
};

export const materialVariants = {
  obsidiana,
  obsidianaTextured,
  grafite,
  grafiteRaised,
  recesso,
  vidroFume,
  vidroFumeHeavy,
  scrim,
  metalAccent,
} as const;

/** Retorna classes CSS para um material e estado */
export function resolveMaterialClasses(
  material: MaterialId,
  state: MaterialState = 'default',
): string {
  const def = materialRegistry[material];
  return def.states[state] ?? def.cssClass;
}

/** Valida convivência de materiais (DDS §2.5) */
export function canCoexist(materials: MaterialId[]): { allowed: boolean; reason?: string } {
  const unique = [...new Set(materials)];

  if (unique.length > 3) {
    return { allowed: false, reason: 'Máximo 3 materiais simultâneos por viewport' };
  }

  const glassCount = unique.filter((m) => m === 'vidro-fume').length;
  if (glassCount > 1) {
    return { allowed: false, reason: 'Vidro + Vidro é proibido' };
  }

  const metalCount = unique.filter((m) => m === 'metal-accent').length;
  if (metalCount > 2) {
    return { allowed: false, reason: 'Máximo 2 accents metal visíveis' };
  }

  return { allowed: true };
}

/** Resolve contexto de material para composição de componentes */
export function resolveMaterialContext(ctx: MaterialContext): {
  classes: string;
  tokens: MaterialDefinition['tokens'];
} {
  const def = materialRegistry[ctx.material];
  const state = ctx.state ?? 'default';
  return {
    classes: resolveMaterialClasses(ctx.material, state),
    tokens: def.tokens,
  };
}

export type { MaterialDefinition, MaterialContext, MaterialState, AccentVariant };
export {
  obsidiana,
  obsidianaTextured,
  grafite,
  grafiteRaised,
  recesso,
  vidroFume,
  vidroFumeHeavy,
  scrim,
  metalAccent,
  getMetalAccentTokens,
};
