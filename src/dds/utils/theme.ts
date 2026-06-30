/**
 * Utilidades de tema — sub-marcas e contexto de produto DDS.
 */

export const productThemes = ['studio', 'creative', 'insights', 'flow', 'dev'] as const;

export type ProductTheme = (typeof productThemes)[number];

const accentVarMap: Record<ProductTheme, string> = {
  studio: '--phd-accent-brand',
  creative: '--phd-accent-creative',
  insights: '--phd-accent-insights',
  flow: '--phd-accent-flow',
  dev: '--phd-accent-dev',
};

const accentHoverVarMap: Record<ProductTheme, string> = {
  studio: '--phd-accent-brand-hover',
  creative: '--phd-accent-creative-hover',
  insights: '--phd-accent-insights-hover',
  flow: '--phd-accent-flow-hover',
  dev: '--phd-accent-dev',
};

const accentMutedVarMap: Record<ProductTheme, string> = {
  studio: '--phd-accent-brand-muted',
  creative: '--phd-accent-creative-muted',
  insights: '--phd-accent-insights-muted',
  flow: '--phd-accent-flow-muted',
  dev: '--phd-state-success-muted',
};

/** Aplica tema de produto via CSS custom properties em um elemento */
export function applyProductTheme(element: HTMLElement, theme: ProductTheme): void {
  element.style.setProperty('--phd-ai-processing', `var(${accentVarMap[theme]})`);
  element.style.setProperty('--phd-border-accent', `var(${accentMutedVarMap[theme]})`);
  element.dataset.phdTheme = theme;
}

/** Retorna tokens de accent para um tema de produto */
export function getProductAccentTokens(theme: ProductTheme) {
  return {
    accent: `var(${accentVarMap[theme]})`,
    accentHover: `var(${accentHoverVarMap[theme]})`,
    accentMuted: `var(${accentMutedVarMap[theme]})`,
  };
}

/** Classe data-attribute para theming declarativo */
export function productThemeDataAttr(theme: ProductTheme): Record<string, string> {
  return { 'data-phd-theme': theme };
}
