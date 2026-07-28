/**
 * Kairos AI Predictive Wait Time Algorithm
 */

export interface WaitTimePredictionParams {
  positionInLine: number;
  avgServiceDurationMin: number;
  activeCountersCount: number;
  complexityFactor?: number; // Default 1.0
  vipPriorityCount?: number;
}

export function predictWaitTime(params: WaitTimePredictionParams): number {
  const {
    positionInLine,
    avgServiceDurationMin,
    activeCountersCount,
    complexityFactor = 1.0,
    vipPriorityCount = 0,
  } = params;

  if (activeCountersCount <= 0) {
    return (positionInLine + vipPriorityCount) * avgServiceDurationMin;
  }

  const effectivePosition = positionInLine + vipPriorityCount * 1.5;
  const rawWait = (effectivePosition * avgServiceDurationMin * complexityFactor) / activeCountersCount;

  return Math.max(1, Math.round(rawWait));
}
