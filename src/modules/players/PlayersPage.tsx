import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '@/shared/store/useGameStore'
import PlayerCard from './PlayerCard'
import { PLAYER_COLORS } from './types'
import type { PlayerFormData } from './types'

const MIN_PLAYERS = 2
const MIN_NAME_LEN = 2
const MAX_NAME_LEN = 20

export default function PlayersPage() {
  const { players, addPlayer, removePlayer } = useGameStore(
    useShallow((s) => ({
      players: s.players,
      addPlayer: s.addPlayer,
      removePlayer: s.removePlayer,
    })),
  )

  const [form, setForm] = useState<PlayerFormData>({ name: '', color: '' })
  const [error, setError] = useState<string | null>(null)

  // Cores já usadas pelos jogadores cadastrados
  const usedColors = players.map((p) => p.color)
  // Primeira cor disponível como padrão inicial
  const defaultColor = PLAYER_COLORS.find((c) => !usedColors.includes(c.value))?.value ?? ''

  function validate(): string | null {
    const name = form.name.trim()
    if (!name) return 'O nome é obrigatório.'
    if (name.length < MIN_NAME_LEN) return `Mínimo de ${MIN_NAME_LEN} caracteres.`
    if (name.length > MAX_NAME_LEN) return `Máximo de ${MAX_NAME_LEN} caracteres.`
    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase()))
      return 'Já existe um rato com esse nome.'
    if (!form.color) return 'Escolha uma cor.'
    if (usedColors.includes(form.color)) return 'Essa cor já está em uso.'
    return null
  }

  function handleAdd() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    addPlayer(form.name.trim(), form.color)
    setForm({ name: '', color: '' })
    setError(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd()
  }

  function handleStart() {
    useGameStore.setState({ status: 'playing', startedAt: Date.now() })
  }

  const canStart = players.length >= MIN_PLAYERS

  return (
    <div className="w-full flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h1 className="text-headline font-black uppercase" style={{ color: 'var(--text-h)' }}>
            O Bando
          </h1>
          <p className="text-label" style={{ color: 'var(--text)' }}>
            {players.length === 0
              ? 'Nenhum rato cadastrado ainda'
              : `${players.length} rato${players.length !== 1 ? 's' : ''} no bando`}
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={!canStart}
          className="px-6 py-3 rounded-xl font-bold text-body uppercase tracking-wide
                     transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2
                     disabled:opacity-40 disabled:cursor-not-allowed
                     enabled:hover:brightness-110"
          style={{
            background: canStart ? 'var(--accent)' : 'var(--surface)',
            color: canStart ? '#fff' : 'var(--text)',
            border: canStart ? 'none' : '1px solid var(--border)',
          }}
          aria-label={
            canStart
              ? 'Iniciar a partida'
              : `Adicione pelo menos ${MIN_PLAYERS} ratos para iniciar`
          }
          aria-disabled={!canStart}
        >
          INICIAR
        </button>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* ── Formulário ─────────────────────────────────────────── */}
        <section
          className="p-5 rounded-xl flex flex-col gap-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          aria-labelledby="form-heading"
        >
          <h2
            id="form-heading"
            className="text-label"
            style={{ color: 'var(--accent)' }}
          >
            + ADICIONAR RATO
          </h2>

          {/* Campo nome */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="player-name"
              className="text-label"
              style={{ color: 'var(--text)' }}
            >
              Codinome
            </label>
            <input
              id="player-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }))
                setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Rata Vermelha"
              maxLength={MAX_NAME_LEN}
              className="w-full px-4 py-3 rounded-lg text-body outline-none
                         transition-all focus:ring-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text-h)',
                border: '1px solid var(--border)',
                '--tw-ring-color': 'var(--accent)',
              } as React.CSSProperties}
              aria-describedby={error ? 'form-error' : undefined}
            />
          </div>

          {/* Seletor de cor */}
          <div className="flex flex-col gap-2">
            <span className="text-label" style={{ color: 'var(--text)' }}>
              Cor
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Escolha a cor do jogador">
              {PLAYER_COLORS.map((c) => {
                const isUsed = usedColors.includes(c.value)
                const isSelected = form.color === c.value
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      if (!isUsed) {
                        setForm((f) => ({ ...f, color: c.value }))
                        setError(null)
                      }
                    }}
                    disabled={isUsed}
                    className="w-8 h-8 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2
                               disabled:opacity-25 disabled:cursor-not-allowed
                               enabled:hover:scale-110 enabled:active:scale-95"
                    style={{
                      background: c.value,
                      outline: isSelected ? `3px solid ${c.value}` : undefined,
                      outlineOffset: isSelected ? '3px' : undefined,
                      boxShadow: isSelected ? `0 0 0 2px var(--bg)` : undefined,
                    }}
                    aria-label={`Cor ${c.label}${isUsed ? ' (em uso)' : ''}`}
                    aria-pressed={isSelected}
                    role="radio"
                    aria-checked={isSelected}
                  />
                )
              })}
            </div>
          </div>

          {/* Erro */}
          {error && (
            <p
              id="form-error"
              className="text-body"
              style={{ color: 'var(--accent)' }}
              role="alert"
            >
              {error}
            </p>
          )}

          {/* Botão adicionar */}
          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-lg font-bold text-body uppercase tracking-wide
                       transition-all active:scale-95 hover:brightness-110
                       focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ background: 'var(--accent)', color: '#fff' }}
            aria-label="Adicionar jogador ao bando"
          >
            + ADICIONAR RATO
          </button>
        </section>

        {/* ── Lista de jogadores ─────────────────────────────────── */}
        {players.length > 0 && (
          <section aria-labelledby="players-heading">
            <h2
              id="players-heading"
              className="text-label mb-3"
              style={{ color: 'var(--text)' }}
            >
              RATOS NO BANDO
            </h2>

            <ul className="flex flex-col gap-2" role="list">
              {players.map((player) => (
                <li key={player.id}>
                  <PlayerCard
                    player={player}
                    onRemove={(id) => removePlayer(id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Aviso mínimo de jogadores */}
        {!canStart && players.length > 0 && (
          <p
            className="text-body text-center py-2"
            style={{ color: 'var(--text)' }}
            role="status"
          >
            Falta {MIN_PLAYERS - players.length} rato{MIN_PLAYERS - players.length !== 1 ? 's' : ''} para começar.
          </p>
        )}
      </main>

      {/* ── Dica de cor padrão invisível ── acessibilidade ── */}
      <div aria-live="polite" className="sr-only" aria-atomic="true">
        {form.color
          ? `Cor selecionada: ${PLAYER_COLORS.find((c) => c.value === form.color)?.label ?? form.color}`
          : defaultColor
            ? `Cor sugerida disponível: ${PLAYER_COLORS.find((c) => c.value === defaultColor)?.label}`
            : ''}
      </div>
    </div>
  )
}
