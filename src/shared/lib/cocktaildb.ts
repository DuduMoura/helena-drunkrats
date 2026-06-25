// Wrapper da TheCocktailDB API
// GET https://www.thecocktaildb.com/api/json/v1/1/random.php

const API_URL = 'https://www.thecocktaildb.com/api/json/v1/1/random.php'

export interface CocktailDBDrink {
  idDrink: string
  strDrink: string
  strDrinkThumb: string
  strCategory: string
  strIngredient1?: string
  strIngredient2?: string
  strIngredient3?: string
  strIngredient4?: string
  strIngredient5?: string
  strIngredient6?: string
  strIngredient7?: string
  strIngredient8?: string
  strIngredient9?: string
  strIngredient10?: string
  strIngredient11?: string
  strIngredient12?: string
  strIngredient13?: string
  strIngredient14?: string
  strIngredient15?: string
  strMeasure1?: string
  strMeasure2?: string
  strMeasure3?: string
  strMeasure4?: string
  strMeasure5?: string
  strMeasure6?: string
  strMeasure7?: string
  strMeasure8?: string
  strMeasure9?: string
  strMeasure10?: string
  strMeasure11?: string
  strMeasure12?: string
  strMeasure13?: string
  strMeasure14?: string
  strMeasure15?: string
}

const FALLBACK_DRINK: CocktailDBDrink = {
  idDrink: 'fallback',
  strDrink: 'Shot de Destilado',
  strDrinkThumb: '',
  strCategory: 'Shot',
  strIngredient1: 'Destilado de sua escolha',
  strMeasure1: '50ml',
}

export async function fetchRandomDrink(): Promise<CocktailDBDrink> {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) return FALLBACK_DRINK
    const data = (await res.json()) as { drinks: CocktailDBDrink[] | null }
    if (!data.drinks?.[0]) return FALLBACK_DRINK
    return data.drinks[0]
  } catch {
    return FALLBACK_DRINK
  }
}

// Retorna os ingredientes e medidas como pares filtrados (sem nulos)
export function getIngredients(
  drink: CocktailDBDrink,
): { ingredient: string; measure: string }[] {
  const pairs: { ingredient: string; measure: string }[] = []
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}` as keyof CocktailDBDrink]
    const measure = drink[`strMeasure${i}` as keyof CocktailDBDrink]
    if (ingredient) {
      pairs.push({
        ingredient,
        measure: measure ?? '',
      })
    }
  }
  return pairs
}
