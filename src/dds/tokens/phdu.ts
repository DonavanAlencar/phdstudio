/**
 * PHD Unit (PHDU) — unidade modular fundamental do DDS.
 * @see docs/design/PHD_Engineering_Design_System.md §1.1
 */

export const PHDU_BASE = 8;

export const phdu = {
  0: '0px',
  1: `${PHDU_BASE}px`,
  2: `${PHDU_BASE * 2}px`,
  3: `${PHDU_BASE * 3}px`,
  5: `${PHDU_BASE * 5}px`,
  8: `${PHDU_BASE * 8}px`,
  13: `${PHDU_BASE * 13}px`,
  21: `${PHDU_BASE * 21}px`,
} as const;

export type PhduScale = keyof typeof phdu;
