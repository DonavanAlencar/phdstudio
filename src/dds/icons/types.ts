/**
 * Icon Foundation — contratos e tipos.
 * Ícones proprietários serão registrados na Fase 05B+.
 */

export type IconVariant = 'outline' | 'filled';

export type IconState = 'default' | 'active' | 'disabled';

export interface IconContract {
  /** Identificador único: phd-icon-{nome} */
  id: string;
  /** Grid PHDU 24×24 */
  viewBox: '0 0 24 24';
  /** Peso de traço monoline uniforme */
  strokeWidth: number;
  /** Variante outline ou filled */
  variant: IconVariant;
  /** Metáfora: mecânica, estrutural, operacional */
  category: 'navigation' | 'action' | 'data' | 'feedback' | 'media' | 'system';
}

export interface IconRenderProps {
  size?: IconSize;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
