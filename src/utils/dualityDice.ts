import { DualityRollResult } from '../types';

export interface RollInput {
  roller: string;
  modifier: number;
  targetDifficulty?: number;
  notes?: string;
}

export function rollDualityDice(input: RollInput): DualityRollResult {
  const hopeValue = Math.floor(Math.random() * 12) + 1;
  const fearValue = Math.floor(Math.random() * 12) + 1;
  const total = hopeValue + fearValue + input.modifier;

  const isCritical = hopeValue === fearValue;

  let outcome: DualityRollResult['outcome'];

  if (isCritical) {
    outcome = 'Critical Success';
  } else if (hopeValue > fearValue) {
    if (input.targetDifficulty !== undefined && total < input.targetDifficulty) {
      outcome = 'Failure with Hope';
    } else {
      outcome = 'Success with Hope';
    }
  } else {
    // fearValue > hopeValue
    if (input.targetDifficulty !== undefined && total < input.targetDifficulty) {
      outcome = 'Failure with Fear';
    } else {
      outcome = 'Success with Fear';
    }
  }

  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return {
    id: 'roll-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp,
    roller: input.roller,
    hopeValue,
    fearValue,
    modifier: input.modifier,
    total,
    isCritical,
    outcome,
    targetDifficulty: input.targetDifficulty,
    notes: input.notes,
  };
}
