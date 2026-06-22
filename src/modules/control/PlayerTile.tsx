import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/shared/store/useGameStore'
import PlayerAvatar from '@/shared/components/PlayerAvatar'

interface PlayerTileProps {
  playerId: string
  index: number
  onOpenCalculator: (playerId: string) => void
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PlayerTile({ playerId, index, onOpenCalculator }: PlayerTileProps) {
  const player = useGameStore((s) => s.players.find((p) => p.id === playerId))
  const addPoints = useGameStore((s) => s.addPoints)
  const removePoints = useGameStore((s) => s.removePoints)
  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer)

  const [scoreAnim, setScoreAnim] = useState<'up' | 'down' | null>(null)
  const [lastAction, setLastAction] = useState<{ label: string; ts: number } | null>(null)
  const prevScore = useRef<number | null>(null)
  const skipNextScoreEffect = useRef(true)

  useEffect(() => {
    skipNextScoreEffect.current = true
    prevScore.current = null
  }, [playerId])

  useEffect(() => {
    if (!player) return

    if (skipNextScoreEffect.current) {
      skipNextScoreEffect.current = false
      prevScore.current = player.score
      return
    }

    const prev = prevScore.current ?? player.score
    if (player.score > prev) {
      setScoreAnim('up')
      setLastAction({ label: `+${player.score - prev} pts`, ts: Date.now() })
    } else if (player.score < prev) {
      setScoreAnim('down')
      setLastAction({ label: `-${prev - player.score} pts`, ts: Date.now() })
    }
    prevScore.current = player.score
  }, [player?.score, player])

  useEffect(() => {
    if (!scoreAnim) return
    const t = setTimeout(() => setScoreAnim(null), 400)
    return () => clearTimeout(t)
  }, [scoreAnim])

  if (!player) return null

  const isInactive = !player.active

  return (
    <article
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isInactive ? 'var(--border)' : 'var(--border)'}`,
        opacity: isInactive ? 0.55 : 1,
      }}
      aria-label={`Jogador ${player.name}${isInactive ? ', desistiu' : ''}`}
    >
      <div className="flex items-center gap-3">
        <PlayerAvatar
          name={player.name}
          color={player.color}
          size="lg"
          inactive={isInactive}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-label" style={{ color: 'var(--text)' }}>
              #{index + 1}
            </span>
            {isInactive && (
              <span
                className="text-label px-2 py-0.5 rounded-full"
                style={{ background: 'var(--border)', color: 'var(--text)' }}
              >
                OUT
              </span>
            )}
          </div>
          <p className="text-title font-bold truncate" style={{ color: 'var(--text-h)' }}>
            {player.name}
          </p>
          <p className="text-label" style={{ color: isInactive ? 'var(--text)' : 'var(--accent)' }}>
            {isInactive ? 'DESISTIU · INATIVO' : 'ATIVO'}
          </p>
        </div>

        {/* Pontuação */}
        <div className="text-right shrink-0">
          <p
            className={`text-display font-black tabular-nums ${
              scoreAnim === 'up'
                ? 'animate-score-up'
                : scoreAnim === 'down'
                  ? 'animate-score-down'
                  : ''
            }`}
            style={{ color: isInactive ? 'var(--text)' : 'var(--text-h)' }}
            aria-label={`${player.score} pontos`}
          >
            {player.score}
          </p>
          <p className="text-label" style={{ color: 'var(--text)' }}>pts</p>
        </div>
      </div>

      {/* Última ação */}
      {lastAction && (
        <p
          className="text-label"
          style={{ color: 'var(--text)' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {lastAction.label} · {formatTime(lastAction.ts)}
        </p>
      )}

      {/* ── Botões de ação (só para ativos) ── */}
      {!isInactive && (
        <div className="flex flex-col gap-2">
          {/* +10 / -5 */}
          <div className="flex gap-2">
            <button
              onClick={() => addPoints(playerId, 10)}
              className="flex-1 py-3 rounded-xl font-bold text-body transition-all
                         active:scale-95 hover:brightness-110 focus-visible:outline-2"
              style={{ background: 'var(--accent)', color: '#fff' }}
              aria-label={`Adicionar 10 pontos a ${player.name}`}
            >
              + 10 PTS
            </button>
            <button
              onClick={() => removePoints(playerId, 5)}
              className="flex-1 py-3 rounded-xl font-bold text-body transition-all
                         active:scale-95 hover:brightness-110 focus-visible:outline-2"
              style={{
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                border: '1px solid var(--accent-border)',
              }}
              aria-label={`Remover 5 pontos de ${player.name}`}
            >
              − 5 PTS
            </button>
          </div>

          {/* Calculadora */}
          <button
            onClick={() => onOpenCalculator(playerId)}
            className="w-full py-2.5 rounded-xl font-medium text-body transition-all
                       active:scale-95 hover:brightness-110 focus-visible:outline-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
            }}
            aria-label={`Abrir calculadora ml × % para ${player.name}`}
          >
            Adicionar Pontos
          </button>

          {/* Desistência */}
          <button
            onClick={() => eliminatePlayer(playerId)}
            className="w-full py-2 rounded-xl font-medium text-label transition-all
                       active:scale-95 hover:brightness-110 focus-visible:outline-2"
            style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }}
            aria-label={`Marcar ${player.name} como desistente`}
          >
            ✕ MARCAR DESISTÊNCIA
          </button>
        </div>
      )}
    </article>
  )
}
