# DrunkRats — Design Document

> **Escopo:** Decisões de arquitetura, modelos de dados, fluxo de estado e contratos de integração.
> Para requisitos de produto e regras de negócio consulte `drunkrats-prd.md`.

---

## 1. Visão Geral da Arquitetura

O DrunkRats é uma SPA (Single Page Application) inteiramente client-side, sem backend próprio. Todo o estado persiste via `localStorage` e a única dependência externa é a TheCocktailDB API.

### Camadas

```
src/
├── app/          # Configurações globais: roteador, assets, docs
├── modules/      # Módulos de feature (vertical slices)
│   ├── control/
│   ├── drink/
│   ├── home/
│   ├── layout/
│   ├── players/
│   ├── presets/
│   └── scoreboard/
└── shared/       # Utilitários transversais reutilizáveis
    ├── components/
    ├── lib/
    └── store/
```

**Regra de dependência:** `modules/` pode importar de `shared/`. `shared/` nunca importa de `modules/`. `app/` importa de ambos apenas para composição (router, entry point).

### Path Aliases

| Alias | Resolve para |
|---|---|
| `@` | `src/` |
| `@modules` | `src/modules/` |
| `@app` | `src/app/` |
| `@shared` | `src/shared/` |

Nunca usar caminhos relativos longos (`../../`). Configurados em `vite.config.ts` e `tsconfig.json`.

---

## 2. Máquina de Estados do Jogo

O campo `status` do `useGameStore` controla o ciclo de vida completo da partida.

```
         startGame()
  idle ──────────────► setup
                          │
              addPlayer() × n + iniciar
                          │
                          ▼
                       playing ──────────────► scoreboard (leitura)
                          │        ◄─────────── control (escrita)
                          │        ◄─────────── drink (evento)
                          │
                    finishGame()
                          │
                          ▼
                       finished
                          │
                     resetGame()
                          │
                          ▼
                         idle
```

### Transições

| Ação | Estado anterior | Estado posterior |
|---|---|---|
| `startGame()` | `idle` | `setup` |
| `addPlayer()` + iniciar na PlayersPage | `setup` | `playing` |
| `finishGame()` | `playing` | `finished` |
| `resetGame()` | qualquer | `idle` |

### Impacto nos Route Guards

| Rota | Guard | Condição de acesso | Fallback |
|---|---|---|---|
| `/` | — | sempre | — |
| `/players` | `PlayersGuard` | `status === 'setup'` | `/` |
| `/control` | `ControlGuard` | `status === 'playing'` | `/` |
| `/scoreboard` | `ScoreboardGuard` | `status === 'playing' \| 'finished'` | `/` |
| `/drink` | `DrinkGuard` | `status === 'playing'` | `/control` |
| `*` | — | — | `/` |

A `NavBar` só é renderizada quando `status === 'playing' || status === 'finished'`.

---

## 3. Modelos de Dados

### `Player`
```ts
interface Player {
  id: string        // crypto.randomUUID()
  name: string
  color: string     // hex, ex: "#9b5de5"
  score: number     // sempre ≥ 0
  active: boolean   // false = eliminado (desistência)
  joinedAt: number  // Date.now()
}
```

### `DrinkEvent`
```ts
interface DrinkEvent {
  drinkId: string
  drinkName: string
  thumb: string         // URL da imagem ou ''
  bonus: number         // pontos concedidos ao vencedor
  winnerId: string | null  // null = evento pulado ou sem vencedor
  triggeredAt: number   // Date.now() preenchido em applyDrinkBonus()
}
```

### `GameStatus`
```ts
type GameStatus = 'idle' | 'setup' | 'playing' | 'finished'
```

### `DrinkPreset`
```ts
// src/modules/presets/types.ts
interface DrinkPreset {
  id: string
  name: string
  ml: number
  abv: number
  points: number    // pré-calculado via calcScore(ml, abv)
  createdAt: number
}
```

### `RankedPlayer` (scoreboard)
```ts
// src/modules/scoreboard/types.ts
interface RankedPlayer extends Player {
  rank: number
}
```

---

## 4. Stores (Zustand)

### `useGameStore` — `src/shared/store/useGameStore.ts`

Gerencia o estado principal da partida. Persiste via middleware `persist` na chave `"drunkrats-game"`.

**Estado:**
```ts
{
  status: GameStatus
  players: Player[]
  events: DrinkEvent[]
  startedAt: number | null
}
```

**Ações:**

| Ação | Efeito |
|---|---|
| `startGame()` | `status → 'setup'` |
| `resetGame()` | zera tudo, `status → 'idle'`, limpa localStorage |
| `addPlayer(name, color)` | cria `Player` com UUID, `score=0`, `active=true` |
| `removePlayer(id)` | remove da lista (apenas em setup) |
| `addPoints(playerId, pts)` | incrementa `score` |
| `removePoints(playerId, pts)` | decrementa `score`, mínimo 0 |
| `eliminatePlayer(id)` | `active → false` |
| `applyDrinkBonus(event)` | appenda evento, soma `bonus` ao vencedor se `winnerId != null` |
| `skipDrinkEvent()` | subtrai 5 pts de todos os `active=true`, mínimo 0 |
| `finishGame()` | `status → 'finished'` |

**Seletores exportados:**
```ts
selectActivePlayers(s)  // Player[] com active=true
selectTotalPoints(s)    // soma de todos os scores
selectRanking(s)        // Player[] ordenado por score desc
```

### `usePresetsStore` — `src/shared/store/usePresetsStore.ts`

Armazena presets de bebidas reutilizáveis entre sessões. Chave: `"drunkrats-presets"`.

**Ações:**
- `addPreset({ name, ml, abv })` — cria preset com `points = calcScore(ml, abv)` já calculado
- `removePreset(id)` — remove por id

---

## 5. Lógica de Pontuação

### Fórmula principal — `src/shared/lib/scoring.ts`

```ts
calcScore(ml: number, abv: number): number
// pts = Math.round(ml × (abv / 100))
// Retorna 0 se ml ≤ 0 ou abv ≤ 0
// Nunca negativo
```

Usada em: `MlCalculator`, `usePresetsStore.addPreset()`.

### Bônus de evento de drink — `src/modules/drink/DrinkPage.tsx`

```ts
calcBonus(drinkName: string): number
// Baseado no comprimento do nome do drinque
// Math.max(10, Math.min(30, Math.round(drinkName.length * 0.8)))
// Fallback (nome vazio ou drink de fallback): 10 pts
// Faixa: 10–30 pts
```

### Penalidade de skip — `useGameStore.skipDrinkEvent()`

Subtrai 5 pts de todos os jogadores `active=true`. Floor em 0 (nunca negativo).

---

## 6. Integração com TheCocktailDB

**Arquivo:** `src/shared/lib/cocktaildb.ts`

**Endpoint:** `GET https://www.thecocktaildb.com/api/json/v1/1/random.php`

Sem autenticação. Resposta esperada:
```json
{
  "drinks": [{
    "idDrink": "11007",
    "strDrink": "Margarita",
    "strDrinkThumb": "https://...",
    "strCategory": "Ordinary Drink",
    "strIngredient1": "Tequila",
    "strMeasure1": "1 1/2 oz",
    ...
  }]
}
```

**Fallback:** Se a requisição falhar ou `drinks` for nulo, retorna:
```ts
const FALLBACK_DRINK = {
  idDrink: 'fallback',
  strDrink: 'Shot de Destilado',
  strDrinkThumb: '',
  strCategory: 'Shot',
  strIngredient1: 'Destilado de sua escolha',
  strMeasure1: '50ml',
}
```

**Helper `getIngredients(drink)`:** itera `strIngredient1–15` e `strMeasure1–15`, filtra nulos, retorna `{ ingredient, measure }[]`.

### Hook `useDrinkEvent` — `src/modules/drink/useDrinkEvent.ts`

Usa React Query com as seguintes configurações intencionais:
- `staleTime: 0` — sempre busca um novo drinque
- `gcTime: 0` — não cacheia entre eventos
- `retry: 1` — uma retentativa antes de usar o fallback
- `refetchOnWindowFocus: false` — evita rebusca ao trocar de aba

---

## 7. Design System

### Paleta de cores (variáveis CSS em `src/index.css`)

| Variável | Valor | Uso |
|---|---|---|
| `--bg` | `#13111a` | Fundo mais escuro |
| `--surface` | `#1e1b29` | Cards e containers |
| `--text` | `#8b80a8` | Texto secundário |
| `--text-h` | `#ede9f7` | Texto primário (headings) |
| `--border` | `#2d2840` | Divisores |
| `--accent` | `#9b5de5` | Ação primária (roxo) |
| `--accent-2` | `#c084fc` | Roxo mais claro |
| `--accent-bg` | `rgba(139,92,246,0.12)` | Fundo com tint de accent |
| `--accent-border` | `rgba(139,92,246,0.40)` | Borda com tint de accent |

### Escala tipográfica

| Classe | Tamanho | Uso |
|---|---|---|
| `.text-display` | 3.5rem | Títulos hero |
| `.text-headline` | 2rem | Títulos de página |
| `.text-title` | 1.25rem | Subtítulos |
| `.text-body` | 1rem | Texto de corpo |
| `.text-label` | 0.75rem | Labels (UPPERCASE) |

### Stack de estilização

| Ferramenta | Uso permitido |
|---|---|
| Tailwind CSS | Layout, espaçamento, utilitários |
| Ant Design v5 | Componentes complexos: Modal, Select, Spin |
| MUI / Material Icons | Apenas ícones de navegação — nunca instanciar componentes MUI na UI |

### Layout responsivo

| Breakpoint | Comportamento da NavBar |
|---|---|
| `< md` (mobile) | Bottom navigation bar com ícone + label |
| `md–xl` (tablet) | Rail lateral esquerdo (80px) com ícones |
| `≥ xl` (desktop) | Drawer lateral esquerdo (224px) com branding + texto |

---

## 8. Persistência

O Zustand middleware `persist` serializa o estado para `localStorage` a cada mutation.

| Store | Chave localStorage |
|---|---|
| `useGameStore` | `"drunkrats-game"` |
| `usePresetsStore` | `"drunkrats-presets"` |

**Detecção de jogo salvo:** `HomePage` lê diretamente o localStorage para verificar se há um jogo em andamento e exibir o botão "Continuar" sem montar o store completo.

**Reset completo:** `resetGame()` chama `set({ status: 'idle', players: [], events: [], startedAt: null })`, que aciona o persist middleware e sobrescreve o localStorage com o estado zerado.

---

## 9. Convenções de Código

### Nomenclatura de arquivos

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componentes e páginas | `PascalCase.tsx` | `PlayerCard.tsx`, `ControlPage.tsx` |
| Hooks | `use` + camelCase | `useGameStore.ts`, `useDrinkEvent.ts` |
| Tipos por módulo | `types.ts` | `src/modules/control/types.ts` |
| Tipos compartilhados | `*.types.ts` | `game.types.ts` |

### Componentes

- Sempre functional components com TypeScript
- Props tipadas com `interface`, **nunca** com `type`
- Imports via alias obrigatório, nunca `../../`

```ts
// ✅ correto
import { useGameStore } from '@shared/store/useGameStore'

// ❌ errado
import { useGameStore } from '../../shared/store/useGameStore'
```

### Commits

Seguir Conventional Commits obrigatoriamente:

```
feat: adiciona tela de placar
fix: corrige score negativo ao remover pontos
chore: atualiza dependências
refactor: extrai componente PlayerCard
```

---

## 10. Regras de Negócio Críticas

| Regra | Localização no código |
|---|---|
| Score nunca abaixo de 0 | `removePoints()`, `skipDrinkEvent()` em `useGameStore` |
| Mínimo 2 jogadores para iniciar | Validação em `PlayersPage` antes de chamar `finishGame()` → `status='playing'` |
| Jogadores eliminados não ganham/perdem pontos | `skipDrinkEvent()` checa `p.active`; `applyDrinkBonus` aplica só ao `winnerId` |
| `resetGame()` limpa o localStorage | middleware `persist` sobrescreve ao receber estado zerado |
| Home detecta jogo salvo | `HomePage` lê `localStorage.getItem('drunkrats-game')` e exibe "Continuar" se `status !== 'idle'` |
| Cores de jogadores são únicas por sessão | `PlayersPage` filtra `PLAYER_COLORS` excluindo cores já em uso |

---

## 11. Estrutura de Módulos (Referência Rápida)

| Módulo | Página/Entry | Responsabilidade |
|---|---|---|
| `home/` | `HomePage` | Hub de entrada, exibição de regras, detecção de jogo salvo |
| `players/` | `PlayersPage` | Cadastro de 2+ jogadores com nome e cor únicos |
| `control/` | `ControlPage` | Interface de pontuação em tempo real durante o jogo |
| `drink/` | `DrinkPage` | Busca e exibe evento de drink aleatório, distribui bônus |
| `scoreboard/` | `ScoreboardPage` | Ranking ao vivo e placar final com pódio |
| `layout/` | `NavBar`, `AppBackground` | Navegação responsiva e fundo animado globais |
| `presets/` | *(types only)* | Definição do tipo `DrinkPreset` |
