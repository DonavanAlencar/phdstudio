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
  type MassLevel,
} from './physics';
export { springs, springTransition, type SpringConfig, type SpringPreset } from './springs';
export { delays, delayMs, staggerDelay, chainDelay } from './delays';

import { durations } from './durations';
import { easings } from './easings';
import { physics, enterPatterns, exitPatterns, loadingPatterns, microPatterns } from './physics';
import { springs } from './springs';
import { delays } from './delays';

export const motionSystem = {
  durations,
  easings,
  physics,
  springs,
  delays,
  patterns: {
    enter: enterPatterns,
    exit: exitPatterns,
    loading: loadingPatterns,
    micro: microPatterns,
  },
} as const;
