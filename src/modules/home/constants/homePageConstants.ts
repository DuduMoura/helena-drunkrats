import type { Rule, WellbeingItem } from '../types'

export const gameRules: Rule[] = [
  { number: 1, text: 'Cadastre as ratazanas — mínimo 2 ratos, cada um com cor e codinome.' },
  { number: 2, text: 'Some pontos bebendo — pontuação baseada em ml × teor alcoólico.' },
  { number: 3, text: 'Evento Drink — sorteia um drink aleatório; o primeiro a preparar leva o bônus.' },
  { number: 4, text: 'Desistiu, saiu — marca o rato como inativo. Sem volta.' },
  { number: 5, text: 'O último de pé leva — placar final define o campeão.' },
]

export const wellbeingItems: WellbeingItem[] = [
  { text: 'Beba água entre as rodadas.' },
  { text: 'Se alguém disse "chega" — acabou pra essa pessoa.' },
  { text: 'Nunca dirija. Nem de patinete. Nem de bicicleta.' },
  { text: 'Comida na mesa não é opcional, é regra.' },
]
