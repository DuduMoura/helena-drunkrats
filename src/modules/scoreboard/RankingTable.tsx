import PlayerAvatar from '@/shared/components/PlayerAvatar'
import type { RankedPlayer } from './types'

interface RankingTableProps {
  players: RankedPlayer[]
  maxScore: number
}

export default function RankingTable({ players, maxScore }: RankingTableProps) {
  return (
    <section aria-labelledby="ranking-heading">
      <h2
        id="ranking-heading"
        className="text-label mb-3"
        style={{ color: 'var(--text)' }}
      >
        CLASSIFICAÇÃO COMPLETA
      </h2>

      <ul className="flex flex-col gap-2" role="list">
        {players.map((player) => {
          const pct = maxScore > 0 ? (player.score / maxScore) * 100 : 0
          const isDropout = !player.active

          return (
            <li
              key={player.id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                opacity: isDropout ? 0.6 : 1,
              }}
              aria-label={`${player.rank}º lugar: ${player.name}, ${player.score} pontos${isDropout ? ', desistiu' : ''}`}
            >
              {/* Rank */}
              <span
                className="text-title font-black w-7 text-center shrink-0"
                style={{
                  color: player.rank <= 3 ? 'var(--accent)' : 'var(--text)',
                }}
                aria-hidden="true"
              >
                {player.rank}º
              </span>

              {/* Avatar */}
              <PlayerAvatar
                name={player.name}
                color={player.color}
                size="sm"
                inactive={isDropout}
              />

              {/* Nome + barra */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-body font-semibold truncate"
                    style={{ color: 'var(--text-h)' }}
                  >
                    {player.name}
                  </span>
                  {isDropout && (
                    <span
                      className="text-label px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: 'var(--border)', color: 'var(--text)' }}
                    >
                      DESISTIU
                    </span>
                  )}
                </div>

                {/* Barra de progresso relativa */}
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--bg)' }}
                  role="progressbar"
                  aria-valuenow={player.score}
                  aria-valuemin={0}
                  aria-valuemax={maxScore}
                  aria-label={`Progresso de ${player.name}: ${Math.round(pct)}%`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: player.rank === 1 ? 'var(--accent)' : 'var(--text)',
                    }}
                  />
                </div>
              </div>

              {/* Pontuação */}
              <span
                className="text-title font-black tabular-nums shrink-0"
                style={{ color: player.rank === 1 ? 'var(--accent)' : 'var(--text-h)' }}
                aria-hidden="true"
              >
                {player.score}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
