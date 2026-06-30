/**
 * Variantes tipográficas DDS — createVariants presets para componentes CES.
 * @see docs/design/PHD_Component_Engineering_Specifications.md § Typography
 */

import { createVariants } from './variants';

const typeBase = 'phd-font-features-body';

/** Variante composta: escala + família + peso */
export const typeScaleVariants = createVariants({
  base: typeBase,
  variants: {
    scale: {
      'display-xl': 'phd-type-display-xl',
      display: 'phd-type-display',
      'heading-1': 'phd-type-heading-1',
      'heading-2': 'phd-type-heading-2',
      'heading-3': 'phd-type-heading-3',
      title: 'phd-type-title',
      'body-lg': 'phd-type-body-lg',
      body: 'phd-type-body',
      'body-sm': 'phd-type-body-sm',
      caption: 'phd-type-caption',
      label: 'phd-type-label',
      mono: 'phd-type-mono phd-font-features-data',
      'mono-lg': 'phd-type-mono-lg phd-font-features-data',
    },
    color: {
      primary: 'phd-type-color-primary',
      secondary: 'phd-type-color-secondary',
      tertiary: 'phd-type-color-tertiary',
      inverse: 'phd-type-color-inverse',
    },
    prose: {
      true: 'phd-type-prose',
      false: '',
    },
  },
  defaultVariants: {
    color: 'primary',
    prose: 'false' as const,
  },
});

/** Papel semântico (Display / Heading / Body / Label / Mono) */
export const typeRoleVariants = createVariants({
  variants: {
    role: {
      display: 'font-phd-display phd-font-features-display',
      heading: 'font-phd-heading phd-font-features-display',
      body: 'font-phd-body phd-font-features-body',
      label: 'font-phd-label phd-font-features-body',
      mono: 'font-phd-mono phd-font-features-data',
    },
  },
  defaultVariants: {
    role: 'body',
  },
});

/** Peso tipográfico tokenizado */
export const typeWeightVariants = createVariants({
  variants: {
    weight: {
      regular: 'font-phd-regular',
      medium: 'font-phd-medium',
      semibold: 'font-phd-semibold',
      bold: 'font-phd-bold',
    },
  },
  defaultVariants: {
    weight: 'regular',
  },
});
