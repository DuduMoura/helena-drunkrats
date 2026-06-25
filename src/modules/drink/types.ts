import type { CocktailDBDrink } from '@/shared/lib/cocktaildb'

export type { CocktailDBDrink }

export interface DrinkEventResult {
  winnerId: string | null
  bonus: number
}
