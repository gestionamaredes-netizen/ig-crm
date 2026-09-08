import { useMemo } from 'react';
import {
  generateFullLoopVariation,
  LoopVariation,
  generateSessionSeed,
} from '../utils/randomizer';

/**
 * Hook que proporciona variaciones controladas para un loop específico
 * Memoiza el resultado para evitar recálculos en re-renders
 *
 * @param loopNumber Loop actual (1-4)
 * @param customSeed Seed opcional para reproducibilidad (debug)
 * @returns LoopVariation configurada
 */
export function useLoopVariation(
  loopNumber: number,
  customSeed?: number
): LoopVariation {
  return useMemo(() => {
    const seed = customSeed ?? generateSessionSeed(loopNumber);
    return generateFullLoopVariation(loopNumber, seed);
  }, [loopNumber, customSeed]);
}

/**
 * Hook que proporciona la seed base de la sesión
 * Útil para pasar a log/debug
 */
export function useSessionSeed(): number {
  return useMemo(() => generateSessionSeed(0), []);
}
