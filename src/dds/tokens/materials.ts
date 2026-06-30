/**
 * Material tokens — metadados dos 4 materiais fundamentais.
 * @see docs/design/PHD_Engineering_Design_System.md §2
 */

export const materialIds = ['obsidiana', 'grafite', 'vidro-fume', 'metal-accent'] as const;

export type MaterialId = (typeof materialIds)[number];

export const materialElevation = {
  obsidiana: 0,
  grafite: 1,
  'vidro-fume': 2,
  'metal-accent': 3,
} as const satisfies Record<MaterialId, number>;

export const materials = {
  ids: materialIds,
  elevation: materialElevation,
} as const;
