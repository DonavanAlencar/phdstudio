/**
 * Material: Grafite — superfície estrutural sólida.
 * @see DDS §2.2
 */

import type { MaterialDefinition } from './types';

export const grafite: MaterialDefinition = {
  id: 'grafite',
  elevation: 1,
  cssClass: 'phd-material-grafite',
  hoverClass: 'phd-material-grafite-hover',
  states: {
    default: 'phd-material-grafite',
    hover: 'phd-material-grafite phd-material-grafite-hover phd-overlay-hover',
    active: 'phd-material-grafite-raised phd-overlay-active phd-motion-press',
    selected: 'phd-material-grafite phd-overlay-selected',
    disabled: 'phd-material-grafite opacity-[var(--phd-opacity-disabled)]',
  },
  tokens: {
    surface: 'var(--phd-surface-graphite-deep)',
    shadow: 'var(--phd-shadow-contact)',
    border: 'var(--phd-border-subtle)',
  },
  constraints: [
    'Sem transparência — não é vidro',
    'Chanfro 3D apenas em elementos ≥ 48px',
    'Máximo 3 níveis empilhados',
  ],
};

export const grafiteRaised: MaterialDefinition = {
  ...grafite,
  cssClass: 'phd-material-grafite-raised',
  elevation: 2,
  tokens: {
    surface: 'var(--phd-surface-graphite-raised)',
    shadow: 'var(--phd-shadow-raised)',
    border: 'var(--phd-border-default)',
  },
};

export const recesso: MaterialDefinition = {
  id: 'grafite',
  elevation: -1,
  cssClass: 'phd-material-recesso',
  states: {
    default: 'phd-material-recesso',
    hover: 'phd-material-recesso border-[var(--phd-border-strong)]',
    disabled: 'phd-material-recesso opacity-[var(--phd-opacity-disabled)]',
  },
  tokens: {
    surface: 'var(--phd-surface-recessed)',
    shadow: 'var(--phd-shadow-inset)',
    border: 'var(--phd-border-default)',
  },
  constraints: ['Inputs sempre em recesso', 'Squircle, não chanfro'],
};
