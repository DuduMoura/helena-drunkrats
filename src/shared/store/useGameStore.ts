import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Player {
  id: string
  name: string
  color: string
  score: number
  active: boolean
  joinedAt: number
}

export interface DrinkEvent {
  drinkId: string
  drinkName: string
  thumb: string
  bonus: number
  winnerId: string | null
  triggeredAt: number
}

export type GameStatus = 'idle' | 'setup' | 'playing' | 'finished'

interface GameStore {
  status: GameStatus
  players: Player[]
  events: DrinkEvent[]
  startedAt: number | null


  startGame: () => void
  resetGame: () => void
  addPlayer: (name: string, color: string) => void
  removePlayer: (id: string) => void
  addPoints: (playerId: string, pts: number) => void
  removePoints: (playerId: string, pts: number) => void
  eliminatePlayer: (id: string) => void
  applyDrinkBonus: (event: DrinkEvent) => void
  skipDrinkEvent: () => void
  finishGame: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      status: 'idle',
      players: [],
      events: [],
      startedAt: null,

      startGame: () =>
        set({ status: 'setup' }),

      resetGame: () =>
        set({ status: 'idle', players: [], events: [], startedAt: null }),

      addPlayer: (name, color) =>
        set((state) => ({
          players: [
            ...state.players,
            {
              id: crypto.randomUUID(),
              name,
              color,
              score: 0,
              active: true,
              joinedAt: Date.now(),
            },
          ],
        })),

      removePlayer: (id) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        })),

      addPoints: (playerId, pts) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, score: p.score + pts } : p,
          ),
        })),

      removePoints: (playerId, pts) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId
              ? { ...p, score: Math.max(0, p.score - pts) }
              : p,
          ),
        })),

      eliminatePlayer: (id) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, active: false } : p,
          ),
        })),

      applyDrinkBonus: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, triggeredAt: Date.now() }],
          players:
            event.winnerId != null
              ? state.players.map((p) =>
                  p.id === event.winnerId
                    ? { ...p, score: p.score + event.bonus }
                    : p,
                )
              : state.players,
        })),

      skipDrinkEvent: () =>
        set((state) => ({
          players: state.players.map((p) =>
            p.active ? { ...p, score: Math.max(0, p.score - 5) } : p,
          ),
        })),

      finishGame: () =>
        set({ status: 'finished' }),
    }),
    {
      name: 'drunkrats-game',
    },
  ),
)

export const selectActivePlayers = (s: GameStore) =>
  s.players.filter((p) => p.active)

export const selectTotalPoints = (s: GameStore) =>
  s.players.reduce((sum, p) => sum + p.score, 0)

export const selectRanking = (s: GameStore) =>
  [...s.players].sort((a, b) => b.score - a.score)
