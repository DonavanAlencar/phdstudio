/**
 * Helpers tipográficos DDS — composição de classes e estilos inline via tokens.
 */

import type { TypeScaleToken } from '../tokens/type-scale';
import { typeScaleStatic } from '../tokens/type-scale';
import { typeScaleVariants, typeRoleVariants, typeWeightVariants } from './typography-variants';

export type TypeStyleOptions = {
  scale: TypeScaleToken;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse';
  prose?: 'true' | 'false';
  className?: string;
};

/** Resolve classes Tailwind + utilitários DDS para um token de escala */
export function typeClass(options: TypeStyleOptions): string {
  return typeScaleVariants({
    scale: options.scale,
    color: options.color,
    prose: options.prose,
    class: options.className,
  });
}

export type TypeRoleOptions = {
  role: 'display' | 'heading' | 'body' | 'label' | 'mono';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  className?: string;
};

/** Combina papel semântico + peso */
export function typeRoleClass(options: TypeRoleOptions): string {
  const role = typeRoleVariants({ role: options.role });
  const weight = options.weight
    ? typeWeightVariants({ weight: options.weight })
    : '';
  return [role, weight, options.className].filter(Boolean).join(' ');
}

/** Mapa de propriedades CSS para uso em style={} (Storybook, charts) */
export function typeStyleProps(scale: TypeScaleToken): Record<string, string> {
  const token = typeScaleStatic[scale];
  const props: Record<string, string> = {
    fontFamily: token.family,
    fontSize: token.size,
    lineHeight: token.leading,
    fontWeight: token.weight,
  };

  if ('tracking' in token && token.tracking) {
    props.letterSpacing = token.tracking as string;
  }
  if ('transform' in token && token.transform) {
    props.textTransform = token.transform as string;
  }
  if ('features' in token && token.features) {
    props.fontFeatureSettings = token.features as string;
  }
  if ('variantNumeric' in token && token.variantNumeric) {
    props.fontVariantNumeric = token.variantNumeric as string;
  }

  return props;
}

/** Lista de tokens de escala para documentação e testes */
export const TYPE_SCALE_TOKENS = Object.keys(typeScaleStatic) as TypeScaleToken[];
