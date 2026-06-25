import PlayerAvatar from '@/shared/components/PlayerAvatar'
import type { RankedPlayer } from './types'

interface PodiumProps {
  top3: RankedPlayer[]
}

const PODIUM_CONFIG = [
  { rank: 1, height: 'h-28', bg: '#e63946', label: '★ CAMPEÃO ★', textColor: '#fff' },
  { rank: 2, height: 'h-20', bg: '#f4a261', label: '2º', textColor: '#fff' },
  { rank: 3, height: 'h-14', bg: '#2a9d8f', label: '3º', textColor: '#fff' },
] as const

export default function Podium({ top3 }: PodiumProps) {
  // Ordena visualmente: 2º | 1º | 3º
  const visual = [
    top3.find((p) => p.rank === 2),
    top3.find((p) => p.rank === 1),
    top3.find((p) => p.rank === 3),
  ].filter(Boolean) as RankedPlayer[]

  return (
    <div
      className="flex items-end justify-center gap-3 pt-8 pb-4 px-4 rounded-2xl"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      aria-label="Pódio dos três primeiros colocados"
      role="img"
    >
      {visual.map((player) => {
        const config = PODIUM_CONFIG.find((c) => c.rank === player.rank)!
        return (
          <div
            key={player.id}
            className="flex flex-col items-center gap-2 flex-1"
          >
            {/* Avatar + nome */}
            <div className="flex flex-col items-center gap-1 mb-2">
              <PlayerAvatar
                name={player.name}
                color={player.color}
                size={player.rank === 1 ? 'lg' : 'md'}
              />
              <p
                className="text-label font-bold text-center truncate w-full px-1"
                style={{ color: 'var(--text-h)' }}
              >
                {player.name}
              </p>
              <p
                className="text-title font-black tabular-nums"
                style={{ color: player.rank === 1 ? 'var(--accent)' : 'var(--text-h)' }}
              >
                {player.score}
              </p>
              <p className="text-label" style={{ color: 'var(--text)' }}>pts</p>
            </div>

            {/* Bloco do pódio */}
            <div
              className={`w-full ${config.height} rounded-t-xl flex items-center justify-center font-black`}
              style={{ background: config.bg, color: config.textColor }}
              aria-label={`${config.label} — ${player.name}`}
            >
              <span className={player.rank === 1 ? 'text-sm text-center px-1' : 'text-lg'}>
                {config.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
