/**
 * Motion Foundation — API consolidada DDS.
 */

export { durations, durationMs, withMass, type DurationToken } from './durations';
export { easings, easingBezier, type EasingToken } from './easings';
export {
  physics,
  enterPatterns,
  exitPatterns,
  loadingPatterns,
  microPatterns,
  feedbackPatterns,
  transitionPatterns,
  type MassLevel,
} from './physics';
export {
  transitionUtilities,
  interactionUtilities,
  componentMotion,
  motionTransition,
} from './utilities';
export { springs, springTransition, type SpringConfig, type SpringPreset } from './springs';
export { delays, delayMs, staggerDelay, chainDelay } from './delays';

import { durations } from './durations';
import { easings } from './easings';
import {
  physics,
  enterPatterns,
  exitPatterns,
  loadingPatterns,
  microPatterns,
  feedbackPatterns,
  transitionPatterns,
} from './physics';
import { springs } from './springs';
import { delays } from './delays';
import { transitionUtilities, interactionUtilities, componentMotion } from './utilities';

export const motionSystem = {
  durations,
  easings,
  physics,
  springs,
  delays,
  utilities: {
    transition: transitionUtilities,
    interaction: interactionUtilities,
    component: componentMotion,
  },
  patterns: {
    enter: enterPatterns,
    exit: exitPatterns,
    loading: loadingPatterns,
    micro: microPatterns,
    feedback: feedbackPatterns,
    transition: transitionPatterns,
  },
} as const;
