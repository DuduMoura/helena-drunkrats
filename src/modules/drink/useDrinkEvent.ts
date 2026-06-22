import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchRandomDrink } from '@/shared/lib/cocktaildb'
import type { CocktailDBDrink } from '@/shared/lib/cocktaildb'

interface UseDrinkEventResult {
  drink: CocktailDBDrink | undefined
  isLoading: boolean
  isError: boolean
}

export function useDrinkEvent(): UseDrinkEventResult {
  const eventKeyRef = useRef(Date.now())

  const { data, isLoading, isError } = useQuery({
    queryKey: ['drink-event', eventKeyRef.current],
    queryFn: fetchRandomDrink,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  return { drink: data, isLoading, isError }
}
