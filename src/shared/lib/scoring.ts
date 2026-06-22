/**
 * Calcula pontos com base em volume (ml) e teor alcoólico (%).
 * Fórmula: pts = ml × (abv / 100)
 * Resultado arredondado para inteiro, nunca negativo.
 */
export function calcScore(ml: number, abv: number): number {
  if (ml <= 0 || abv <= 0) return 0
  return Math.max(0, Math.round(ml * (abv / 100)))
}
