import type { Player } from '@/shared/store/useGameStore'

export interface RankedPlayer extends Player {
  rank: number
}

export interface SessionStats {
  highScore: number
  avgScore: number
  dropouts: number
  drinkEvents: number
  totalBonus: number
  durationMs: number
}
