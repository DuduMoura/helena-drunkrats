# PRD — DrunkRats
**Documento de Requisitos de Produto**
Versão 1.0

---

## 1. Visão Geral

DrunkRats é uma aplicação web voltada para grupos de amigos que desejam transformar uma rodada de bebidas em uma gincana competitiva e temática. O produto deve funcionar sem necessidade de cadastro, login, conta de usuário ou qualquer infraestrutura de servidor — tudo ocorre diretamente na sessão do navegador do usuário.

### Objetivo

Permitir que qualquer grupo inicie uma partida competitiva em segundos, com pontuação ao vivo, eventos especiais de drink e resultado final, sem fricção de configuração.

### Princípios do Produto

- **Zero barreira de entrada:** nenhum cadastro ou instalação necessário
- **Tolerância a falhas:** o progresso da partida não é perdido em caso de recarga ou queda de energia
- **Portabilidade:** funciona em qualquer dispositivo com navegador moderno
- **Limpeza de dados:** ao iniciar uma nova partida, dados da sessão anterior são descartados

---

## 2. Perfis de Usuário

| Perfil | Descrição |
|---|---|
| Organizador | Responsável por configurar a partida, cadastrar jogadores e controlar a pontuação durante o jogo |
| Jogador | Participa da gincana; visualiza o placar em tempo real |

> Na prática, o organizador é um dos jogadores que opera a aplicação durante a partida.

---

## 3. Telas da Aplicação

| Tela | Rota | Descrição |
|---|---|---|
| Home | `/` | Apresentação do produto, regras e ponto de entrada |
| Cadastro de Jogadores | `/players` | Configuração dos participantes antes do jogo |
| Controle de Pontuação | `/control` | Operação da partida em tempo real |
| Placar | `/scoreboard` | Ranking ao vivo e resultado final |
| Drink Aleatório | `/drink` | Evento especial com sorteio de drink externo |

---

## 4. Fluxo de Navegação

1. O usuário acessa a Home
2. Se não houver partida salva, é direcionado ao Cadastro de Jogadores
3. Se houver partida salva, pode continuar de onde parou ou iniciar uma nova
4. Após cadastrar ao menos 2 jogadores, a partida é iniciada e o Controle de Pontuação é exibido
5. Durante a partida, o organizador pode navegar ao Placar ou acionar um Evento Drink
6. Ao encerrar o jogo, o Placar Final é exibido com o pódio
7. A partir do Placar Final, é possível iniciar uma nova partida

---

## 5. Requisitos Funcionais por Tela

### 5.1 Home `/`

**Elementos:**

| Elemento | Comportamento |
|---|---|
| Identidade visual + tagline | Apresenta o produto com tom descontraído |
| Seção de regras | Cards explicando como funciona a gincana |
| Avisos de bem-estar | Orientações de cuidado antes e após o jogo |
| Botão "Começar Bebedeira" | Inicia o fluxo de cadastro de jogadores |
| Botão "Continuar" | Aparece apenas se houver partida salva; retoma o jogo |
| Botão "Nova Partida" | Aparece apenas se houver partida salva; descarta os dados e reinicia |

**Regras de negócio:**

- A detecção de partida salva deve ocorrer automaticamente ao abrir a aplicação
- "Continuar" deve levar diretamente ao Controle de Pontuação
- "Nova Partida" deve descartar todos os dados da sessão anterior antes de prosseguir

---

### 5.2 Cadastro de Jogadores `/players`

**Elementos:**

| Elemento | Comportamento |
|---|---|
| Campo de nome | Texto livre, mínimo 2 caracteres, deve ser único |
| Seletor de cor | Paleta pré-definida de cores identificadoras |
| Lista de jogadores | Exibe os jogadores cadastrados com opção de remover |
| Botão "Iniciar Bebedeira" | Habilitado apenas com 2 ou mais jogadores cadastrados |

**Regras de negócio:**

- Nomes duplicados não são permitidos
- Cada jogador deve ter uma cor distinta dos demais
- A cor acompanha o jogador em todas as telas durante toda a partida
- O botão de início permanece desabilitado enquanto houver menos de 2 jogadores

---

### 5.3 Controle de Pontuação `/control`

**Elementos:**

| Elemento | Comportamento |
|---|---|
| Card de cada jogador | Exibe nome, cor e pontuação atual |
| Botão "+N pontos" | Adiciona pontos ao jogador selecionado |
| Botão "-N pontos" | Remove pontos do jogador, nunca abaixo de zero |
| Seletor de preset | Lista os presets salvos para seleção rápida de pontuação |
| Botão "Salvar como Preset" | Salva o valor de N atual com um nome definido pelo usuário |
| Botão "Desistência" | Marca o jogador como inativo; ele para de participar |
| Botão "Ver Placar" | Navega para o Placar sem encerrar a partida |
| Botão "Evento Drink" | Navega para o sorteio de drink especial |
| Botão "Encerrar Jogo" | Finaliza a partida e redireciona ao Placar Final |

**Regras de negócio:**

- O valor de N é calculado com base em ml × percentual alcoólico da bebida
- A pontuação de um jogador nunca pode ser negativa
- Jogadores marcados como desistentes ficam inativos e não recebem mais pontos
- Navegar para outras telas não interrompe nem encerra a partida
- O usuário pode salvar o valor de N calculado como um preset nomeado para reutilização futura
- Ao selecionar um preset, o valor de N é preenchido automaticamente sem necessidade de novo cálculo
- Presets são persistidos no navegador de forma independente da partida e não são descartados ao iniciar uma nova partida
- O usuário pode excluir presets salvos manualmente

---

### 5.4 Placar `/scoreboard`

**Elementos:**

| Elemento | Comportamento |
|---|---|
| Ranking ordenado | Jogadores ordenados por pontuação (maior para menor), ativos no topo |
| Destaque do líder | O 1º colocado recebe visual diferenciado |
| Badge de desistência | Jogadores eliminados aparecem ao final com indicador visual |
| Histórico de eventos | Lista de eventos drink realizados com bônus e vencedor de cada um |
| Botão "Voltar ao Controle" | Visível apenas durante partida ativa |
| Botão "Nova Partida" | Visível apenas após o encerramento; chama o reset e volta ao cadastro |

**Regras de negócio:**

- Jogadores ativos sempre aparecem antes dos desistentes no ranking
- Após o encerramento, o pódio é exibido e o botão de retorno ao controle é ocultado
- O placar pode ser acessado durante a partida sem encerrar o jogo

---

### 5.5 Drink Aleatório `/drink`

**Elementos:**

| Elemento | Comportamento |
|---|---|
| Botão "Sortear Drink" | Consulta a API externa e retorna um drink aleatório |
| Card do drink | Exibe nome, foto, categoria e ingredientes principais |
| Fallback de drink | Permite substituir por um shot de destilado caso os ingredientes não estejam disponíveis |
| Estado de carregamento | Exibido enquanto a API responde |
| Estado de erro | Mensagem amigável + botão de nova tentativa em caso de falha |
| Dropdown de vencedor | Lista de jogadores ativos para seleção do vencedor do desafio |
| Botão "Aplicar Bônus" | Atribui os pontos bônus ao vencedor e retorna ao Controle |
| Botão "Pular Evento" | Aplica -5 pontos a todos os jogadores ativos e retorna ao Controle |

**Regras de negócio:**

- Apenas jogadores ativos aparecem no dropdown de seleção de vencedor
- Pular o evento penaliza todos os jogadores ativos em 5 pontos
- A pontuação de nenhum jogador pode ficar abaixo de zero, mesmo com a penalidade
- Ao aplicar o bônus ou pular, o app retorna automaticamente ao Controle de Pontuação

---

## 6. Modelo de Dados

### Entidade: Player

| Campo | Tipo | Descrição |
|---|---|---|
| id | string | Identificador único do jogador |
| name | string | Nome do jogador |
| color | string | Cor identificadora |
| score | number | Pontuação atual (≥ 0) |
| active | boolean | `false` quando o jogador desiste |
| joinedAt | number | Timestamp de entrada na partida |

### Entidade: DrinkEvent

| Campo | Tipo | Descrição |
|---|---|---|
| drinkId | string | Identificador do drink sorteado |
| drinkName | string | Nome do drink |
| thumb | string | URL da imagem do drink |
| bonus | number | Pontos concedidos ao vencedor |
| winnerId | string ou null | ID do jogador vencedor; `null` se o evento foi pulado |
| triggeredAt | number | Timestamp de acionamento do evento |


### Entidade: ScorePreset

| Campo | Tipo | Descrição |
|---|---|---|
| id | string | Identificador único do preset |
| name | string | Nome descritivo dado pelo usuário (ex: "Heineken Long Neck") |
| points | number | Valor de pontos calculado (ml × percentual alcoólico) |
| createdAt | number | Timestamp de criação do preset |

> Presets são armazenados de forma independente do estado da partida e persistem entre sessões.
### Entidade: GameState

| Campo | Tipo | Descrição |
|---|---|---|
| status | string | `idle` → `setup` → `playing` → `finished` |
| players | Player[] | Lista de jogadores da partida |
| events | DrinkEvent[] | Histórico de eventos drink realizados |
| drinkBonus | number | Pontos padrão concedidos em eventos drink |
| startedAt | number ou null | Timestamp de início da partida |

---

## 7. Estados da Partida

| Status | Descrição | Transição |
|---|---|---|
| `idle` | Aplicação recém aberta, sem partida em andamento | → `setup` ao clicar "Começar" |
| `setup` | Cadastro de jogadores em progresso | → `playing` ao clicar "Iniciar Bebedeira" |
| `playing` | Partida em andamento | → `finished` ao encerrar o jogo |
| `finished` | Partida encerrada, pódio exibido | → `idle` ao iniciar nova partida |

---

## 8. Proteção de Rotas

As rotas `/control`, `/scoreboard` e `/drink` só fazem sentido no contexto de uma partida ativa. Um componente de guarda de rota verifica o estado da partida e redireciona automaticamente quando necessário.

| Rota | Status permitido | Redirecionamento se inválido |
|---|---|---|
| `/control` | `playing` | `/` |
| `/scoreboard` | `playing` ou `finished` | `/` |
| `/drink` | `playing` | `/` |

---

## 9. Persistência de Dados

- O estado completo da partida deve ser persistido automaticamente no navegador do usuário
- A persistência deve ser transparente — sem ação explícita do usuário para salvar
- Em caso de recarga acidental, o jogo deve ser retomado exatamente do ponto em que estava
- Ao iniciar uma nova partida, todos os dados persistidos da sessão anterior devem ser descartados
- O usuário também pode descartar os dados manualmente ao optar por "Nova Partida" na Home

---

## 10. Integração Externa

| Serviço | Finalidade | Endpoint |
|---|---|---|
| TheCocktailDB | Sortear drink aleatório para eventos especiais | `GET /random.php` |

**Regras:**

- A API é pública, gratuita e não requer autenticação
- Em caso de falha, o sistema deve exibir mensagem de erro amigável com opção de nova tentativa
- O fallback (shot de destilado) deve sempre estar disponível como alternativa ao drink sorteado

---

## 11. Requisitos Não Funcionais

| Requisito | Descrição |
|---|---|
| Persistência de sessão | O progresso sobrevive a recarregamentos acidentais da página |
| Responsividade | Funciona em dispositivos móveis, tablets e desktops |
| Disponibilidade offline parcial | As telas de controle, placar e cadastro funcionam sem internet; apenas o evento drink requer conexão |
| Sem autenticação | Nenhuma tela exige login, cadastro ou conta de usuário |
| Deploy automatizado | Push na branch principal aciona o pipeline de publicação automaticamente |
| Rollback | Reversão instantânea para qualquer versão anterior do deploy |

---

## 12. Pipeline de Publicação

1. Pull Request aprovado e mergeado na branch principal
2. GitHub Actions é acionado automaticamente
3. Versionamento semântico é publicado com base no histórico de commits
4. Se a publicação for bem-sucedida, o deploy é acionado via webhook
5. Em caso de problema, rollback instantâneo para a versão anterior está disponível

---

*Documento elaborado com base na arquitetura de software do DrunkRats — Helena Veltri, Leandro Retzlaff e Rayanna Christensen.*
