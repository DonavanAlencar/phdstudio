/**
 * Gerenciamento de variantes — padrão CVA simplificado sem dependências.
 */

import { cn } from './cn';

export type VariantConfig<V extends Record<string, Record<string, string>>> = {
  base?: string;
  variants: V;
  defaultVariants?: {
    [K in keyof V]?: keyof V[K];
  };
  compoundVariants?: Array<
    {
      [K in keyof V]?: keyof V[K] | Array<keyof V[K]>;
    } & { class: string }
  >;
};

export function createVariants<V extends Record<string, Record<string, string>>>(
  config: VariantConfig<V>,
) {
  return function resolve(
    props?: {
      [K in keyof V]?: keyof V[K] | null;
    } & { class?: string },
  ): string {
    const { base, variants, defaultVariants, compoundVariants } = config;
    const resolved = { ...defaultVariants, ...props } as Record<string, string | undefined>;

    const variantClasses = Object.entries(variants).map(([key, options]) => {
      const value = resolved[key];
      if (value == null) return '';
      return options[value as string] ?? '';
    });

    const compoundClasses =
      compoundVariants?.flatMap((compound) => {
        const matches = Object.entries(compound).every(([key, value]) => {
          if (key === 'class') return true;
          const resolvedValue = resolved[key];
          if (Array.isArray(value)) return value.includes(resolvedValue as never);
          return resolvedValue === value;
        });
        return matches ? [compound.class] : [];
      }) ?? [];

    return cn(base, ...variantClasses, ...compoundClasses, props?.class);
  };
}
