import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calcScore } from '@/shared/lib/scoring'
import type { DrinkPreset } from '@modules/presets/types'

interface PresetsStore {
  presets: DrinkPreset[]
  addPreset: (data: { name: string; ml: number; abv: number }) => void
  removePreset: (id: string) => void
}

export const usePresetsStore = create<PresetsStore>()(
  persist(
    (set) => ({
      presets: [],

      addPreset: ({ name, ml, abv }) =>
        set((state) => ({
          presets: [
            ...state.presets,
            {
              id: crypto.randomUUID(),
              name,
              ml,
              abv,
              points: calcScore(ml, abv),
              createdAt: Date.now(),
            },
          ],
        })),

      removePreset: (id) =>
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
        })),
    }),
    { name: 'drunkrats-presets' },
  ),
)
