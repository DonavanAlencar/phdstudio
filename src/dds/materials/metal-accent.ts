/**
 * Material: Metal Accent — superfície de ação e energia.
 * @see DDS §2.4
 */

import type { MaterialDefinition } from './types';

const accentTokenMap = {
  brand: {
    surface: 'var(--phd-accent-brand)',
    hover: 'var(--phd-accent-brand-hover)',
    shadow: 'var(--phd-shadow-accent)',
    glow: 'var(--phd-glow-processing)',
  },
  creative: {
    surface: 'var(--phd-accent-creative)',
    hover: 'var(--phd-accent-creative-hover)',
    shadow: 'var(--phd-shadow-accent)',
    glow: 'var(--phd-glow-processing)',
  },
  insights: {
    surface: 'var(--phd-accent-insights)',
    hover: 'var(--phd-accent-insights-hover)',
    shadow: 'var(--phd-shadow-accent)',
    glow: 'var(--phd-glow-processing)',
  },
  flow: {
    surface: 'var(--phd-accent-flow)',
    hover: 'var(--phd-accent-flow-hover)',
    shadow: 'var(--phd-shadow-accent)',
    glow: 'var(--phd-glow-processing)',
  },
  dev: {
    surface: 'var(--phd-accent-dev)',
    hover: 'var(--phd-accent-dev)',
    shadow: 'var(--phd-shadow-accent)',
    glow: 'var(--phd-glow-processing)',
  },
} as const;

export type AccentVariant = keyof typeof accentTokenMap;

export const metalAccent: MaterialDefinition = {
  id: 'metal-accent',
  elevation: 3,
  cssClass: 'phd-material-metal-accent',
  states: {
    default: 'phd-material-metal-accent',
    hover: 'phd-material-metal-accent',
    active: 'phd-material-metal-accent phd-motion-press',
    processing: 'phd-material-metal-accent [box-shadow:var(--phd-glow-processing)]',
    disabled: 'phd-material-metal-accent opacity-[var(--phd-opacity-disabled)] shadow-none',
  },
  tokens: {
    surface: accentTokenMap.brand.surface,
    shadow: accentTokenMap.brand.shadow,
  },
  constraints: [
    'Um CTA metal por viewport',
    'Nunca como background de seção',
    'Texto sempre text-inverse',
    'Área máxima 15% do viewport',
  ],
};

export function getMetalAccentTokens(variant: AccentVariant = 'brand') {
  return accentTokenMap[variant];
}

export { accentTokenMap };
