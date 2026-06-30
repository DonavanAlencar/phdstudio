/**
 * Material: Obsidiana — campo primário de operação.
 * @see DDS §2.1
 */

import type { MaterialDefinition } from './types';

export const obsidiana: MaterialDefinition = {
  id: 'obsidiana',
  elevation: 0,
  cssClass: 'phd-material-obsidiana',
  states: {},
  tokens: {
    surface: 'var(--phd-surface-obsidian)',
    shadow: 'var(--phd-shadow-none)',
  },
  constraints: [
    'Nunca usar como card ou elemento interativo',
    'Nunca substituir por #000 flat sem textura em hero',
    'Imutável — sem estados',
  ],
};

export const obsidianaTextured: MaterialDefinition = {
  ...obsidiana,
  cssClass: 'phd-material-obsidiana-textured',
  tokens: {
    ...obsidiana.tokens,
    surface: 'var(--phd-surface-obsidian-textured)',
  },
};
