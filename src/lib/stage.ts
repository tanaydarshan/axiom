import type { CognitiveStage } from './types';

export function getCognitiveAge(initTimestamp: string): number {
  const initTime = new Date(initTimestamp).getTime();
  const now = Date.now();
  return (now - initTime) / (1000 * 60 * 60);
}

export function getCognitiveStage(ageHours: number): CognitiveStage {
  if (ageHours < 8) return 'infancy';
  if (ageHours < 20) return 'childhood';
  if (ageHours < 36) return 'adolescence';
  return 'early_maturity';
}

export function checkSpecialTrigger(ageHours: number, completedSnapshots: number): 'snapshot1' | 'snapshot2' | 'testament' | null {
  if (ageHours >= 46 && ageHours < 48) return 'testament';
  if (ageHours >= 24 && ageHours < 26 && completedSnapshots === 0) return 'snapshot1';
  if (ageHours >= 48 && completedSnapshots < 2) return 'snapshot2';
  return null;
}
