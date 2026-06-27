import { CHALLENGE_POOL } from '../data/teamSpaceDemo';
import type { WeeklyChallenge } from '../types/teamSpace';
import { weekIndexFromKey, getWeekKey } from './teamSpaceTime';

export function getWeeklyChallenge(ref = new Date()): WeeklyChallenge {
  const weekKey = getWeekKey(ref);
  const idx = weekIndexFromKey(weekKey) % CHALLENGE_POOL.length;
  return CHALLENGE_POOL[idx];
}

export function getChallengeForWeek(weekKey: string): WeeklyChallenge {
  const idx = weekIndexFromKey(weekKey) % CHALLENGE_POOL.length;
  return CHALLENGE_POOL[idx];
}
