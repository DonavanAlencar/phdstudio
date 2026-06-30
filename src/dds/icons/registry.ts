/**
 * Icon Foundation — registro de ícones proprietários.
 * Vazio nesta fase; Lucide permanece nos componentes legados.
 */

import type { IconContract } from './types';

const registry = new Map<string, IconContract>();

export function registerIcon(icon: IconContract): void {
  if (registry.has(icon.id)) {
    console.warn(`[DDS Icons] Ícone "${icon.id}" já registrado — sobrescrevendo.`);
  }
  registry.set(icon.id, icon);
}

export function getIcon(id: string): IconContract | undefined {
  return registry.get(id);
}

export function hasIcon(id: string): boolean {
  return registry.has(id);
}

export function listIcons(): IconContract[] {
  return Array.from(registry.values());
}

export function listIconsByCategory(category: IconContract['category']): IconContract[] {
  return listIcons().filter((icon) => icon.category === category);
}

/** Placeholder para validação de contrato em ícones futuros */
export function validateIconContract(icon: IconContract): string[] {
  const errors: string[] = [];

  if (!icon.id.startsWith('phd-icon-')) {
    errors.push('ID deve usar prefixo phd-icon-');
  }

  if (icon.viewBox !== '0 0 24 24') {
    errors.push('viewBox deve ser 0 0 24 24 (grid PHDU)');
  }

  if (icon.strokeWidth <= 0) {
    errors.push('strokeWidth deve ser positivo');
  }

  return errors;
}
