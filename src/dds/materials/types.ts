/**
 * Material Engine — tipos e contratos DDS.
 */

import type { MaterialId } from '../tokens/materials';

export type MaterialState = 'default' | 'hover' | 'active' | 'selected' | 'disabled' | 'processing';

export interface MaterialDefinition {
  id: MaterialId;
  elevation: number;
  cssClass: string;
  hoverClass?: string;
  states: Partial<Record<MaterialState, string>>;
  tokens: {
    surface: string;
    shadow: string;
    border?: string;
    blur?: string;
  };
  constraints: string[];
}

export interface MaterialContext {
  material: MaterialId;
  state?: MaterialState;
  accent?: 'brand' | 'creative' | 'insights' | 'flow' | 'dev';
}
