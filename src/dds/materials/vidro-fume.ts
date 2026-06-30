/**
 * Material: Vidro Fumê — camada de transição.
 * @see DDS §2.3
 */

import type { MaterialDefinition } from './types';

export const vidroFume: MaterialDefinition = {
  id: 'vidro-fume',
  elevation: 2,
  cssClass: 'phd-material-vidro-fume',
  states: {
    default: 'phd-material-vidro-fume',
    hover: 'phd-material-vidro-fume',
    active: 'phd-material-vidro-fume-heavy',
  },
  tokens: {
    surface: 'var(--phd-surface-glass-dark)',
    shadow: 'var(--phd-shadow-none)',
    border: 'var(--phd-border-subtle)',
    blur: 'var(--phd-blur-md)',
  },
  constraints: [
    'Nunca como material de card estático',
    'Nunca mais de 1 camada de vidro simultânea',
    'Mobile: limitar blur a blur-sm',
    'Fallback: surface-graphite-deep sólido',
  ],
};

export const vidroFumeHeavy: MaterialDefinition = {
  ...vidroFume,
  cssClass: 'phd-material-vidro-fume-heavy',
  tokens: {
    ...vidroFume.tokens,
    surface: 'var(--phd-surface-glass-heavy)',
    blur: 'var(--phd-blur-lg)',
  },
};

export const scrim: MaterialDefinition = {
  id: 'vidro-fume',
  elevation: 2,
  cssClass: 'phd-scrim',
  states: {
    default: 'phd-scrim',
  },
  tokens: {
    surface: 'var(--phd-overlay-scrim)',
    shadow: 'var(--phd-shadow-none)',
  },
  constraints: ['Backdrop de modal'],
};
