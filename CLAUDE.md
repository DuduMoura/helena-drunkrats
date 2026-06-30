
## Comandos essenciais

```bash
npm run dev        # inicia o servidor de desenvolvimento (Vite HMR)
npm run build      # build de produção
npm run preview    # preview do build de produção
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```


## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 + plugin @tailwindcss/vite |
| Roteamento | React Router DOM v6 |
| Estado global | Zustand + middleware `persist` |
| Persistência | localStorage (via Zustand) |
| Requisições | Tanstack Query (React Query) |
| UI components | Ant Design v5 |
| Design system | Material Design 3 via MUI v6 |
| Estilização | Tailwind CSS (via plugin Vite, sem postcss) |


## Aliases de path

Configurados no `vite.config.ts` e `tsconfig.json`.
Sempre use aliases, nunca caminhos relativos longos (`../../`).

```ts
'@'         → src/
'@modules'  → src/modules/
'@app'      → src/app/
'@shared'   → src/shared/
```

Exemplos de uso:
```ts
import { useGameStore } from '@shared/store/gameStore'
import type { Player } from '@shared/types/game.types'
import { PlayerCard } from '@modules/control/components/PlayerCard'
```

---

## Roteamento

Arquivo: `src/shared/router/AppRouter.tsx`

| Rota | Componente | Protegida |
|---|---|---|
| `/` | `HomePage` | Não |
| `/players` | `PlayersPage` | Não |
| `/control` | `ControlPage` | Sim |
| `/scoreboard` | `ScoreboardPage` | Sim |
| `/drink` | `DrinkPage` | Sim |

Rotas protegidas usam `GameGuard`, que lê `status` do store. Se `status === 'idle'`, redireciona para `/`.


## Integração com TheCocktailDB

- Base URL: `https://www.thecocktaildb.com/api/json/v1/1`
- Endpoint usado: `GET /random.php`
- Sem autenticação necessária
- Gerenciado via Tanstack Query no hook `src/modules/drink/hooks/useRandomDrink.ts`
- Sempre trate `isLoading` (skeleton) e `isError` (botão de retry) na UI

## Convenções de código

Use sempre alias para a importação de arquivos

**Commits:** Conventional Commits obrigatório.
```
feat: adiciona tela de placar
fix: corrige score negativo ao remover pontos
chore: atualiza dependências
refactor: extrai componente PlayerCard
```

**Componentes:** functional components com TypeScript. Props tipadas com `interface`, nunca `type` para props de componente.

**Estilização:** Tailwind para layout e espaçamento. Ant Design para componentes complexos (tabelas, forms, toasts, modals). MUI apenas para tokens de design (cores, tipografia) — não instanciar componentes MUI diretamente na UI.

**Nomes de arquivo:**
- Componentes e páginas: `PascalCase.tsx` (ex: `PlayerCard.tsx`, `ControlPage.tsx`)
- Hooks: prefixo `use` + camelCase (ex: `useGameStore.ts`, `useRandomDrink.ts`)
- Tipos: sufixo `.types.ts` (ex: `game.types.ts`)

---

## Regras de negócio importantes

- Score nunca vai abaixo de 0 — `removeScore` deve checar antes de subtrair
- Mínimo de 2 jogadores para habilitar o botão "Iniciar"
- Jogadores com `active: false` aparecem ao final do ranking com badge de desistência
- "Pular Evento" em `/drink` subtrai 5 pontos de todos os jogadores ativos
- `resetGame()` deve limpar o localStorage completamente antes de reiniciar o estado
- Se houver jogo salvo no localStorage ao carregar a Home, exibir botão "Continuar" além de "Nova Partida"

