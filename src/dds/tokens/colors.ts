/**
 * Color tokens DDS — Camadas 0 (superfície), 1 (neutro), 2 (energia).
 * @see docs/design/PHD_Engineering_Design_System.md §1.7
 */

export const surfaceColors = {
  obsidian: 'var(--phd-surface-obsidian)',
  obsidianTextured: 'var(--phd-surface-obsidian-textured)',
  graphiteDeep: 'var(--phd-surface-graphite-deep)',
  graphite: 'var(--phd-surface-graphite)',
  graphiteRaised: 'var(--phd-surface-graphite-raised)',
  recessed: 'var(--phd-surface-recessed)',
  glassLight: 'var(--phd-surface-glass-light)',
  glassDark: 'var(--phd-surface-glass-dark)',
  glassHeavy: 'var(--phd-surface-glass-heavy)',
} as const;

export const textColors = {
  primary: 'var(--phd-text-primary)',
  secondary: 'var(--phd-text-secondary)',
  tertiary: 'var(--phd-text-tertiary)',
  disabled: 'var(--phd-text-disabled)',
  inverse: 'var(--phd-text-inverse)',
} as const;

export const borderColors = {
  subtle: 'var(--phd-border-subtle)',
  default: 'var(--phd-border-default)',
  strong: 'var(--phd-border-strong)',
  accent: 'var(--phd-border-accent)',
} as const;

export const accentColors = {
  brand: 'var(--phd-accent-brand)',
  brandHover: 'var(--phd-accent-brand-hover)',
  brandMuted: 'var(--phd-accent-brand-muted)',
  creative: 'var(--phd-accent-creative)',
  creativeHover: 'var(--phd-accent-creative-hover)',
  creativeMuted: 'var(--phd-accent-creative-muted)',
  insights: 'var(--phd-accent-insights)',
  insightsHover: 'var(--phd-accent-insights-hover)',
  insightsMuted: 'var(--phd-accent-insights-muted)',
  flow: 'var(--phd-accent-flow)',
  flowHover: 'var(--phd-accent-flow-hover)',
  flowMuted: 'var(--phd-accent-flow-muted)',
  dev: 'var(--phd-accent-dev)',
} as const;

export const stateColors = {
  success: 'var(--phd-state-success)',
  successMuted: 'var(--phd-state-success-muted)',
  warning: 'var(--phd-state-warning)',
  warningMuted: 'var(--phd-state-warning-muted)',
  error: 'var(--phd-state-error)',
  errorMuted: 'var(--phd-state-error-muted)',
  info: 'var(--phd-state-info)',
  infoMuted: 'var(--phd-state-info-muted)',
} as const;

export const overlayColors = {
  scrim: 'var(--phd-overlay-scrim)',
  scrimHeavy: 'var(--phd-overlay-scrim-heavy)',
  hover: 'var(--phd-overlay-hover)',
  active: 'var(--phd-overlay-active)',
  selected: 'var(--phd-overlay-selected)',
} as const;

export const aiColors = {
  processing: 'var(--phd-ai-processing)',
  suggestion: 'var(--phd-ai-suggestion)',
  connection: 'var(--phd-ai-connection)',
  resolved: 'var(--phd-ai-resolved)',
} as const;

export const dataColors = {
  live: 'var(--phd-data-live)',
  positive: 'var(--phd-data-positive)',
  negative: 'var(--phd-data-negative)',
  neutral: 'var(--phd-data-neutral)',
} as const;

export const colors = {
  surface: surfaceColors,
  text: textColors,
  border: borderColors,
  accent: accentColors,
  state: stateColors,
  overlay: overlayColors,
  ai: aiColors,
  data: dataColors,
} as const;
