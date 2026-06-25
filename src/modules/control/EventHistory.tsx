import { useGameStore } from '@/shared/store/useGameStore'

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EventHistory() {
  const events = useGameStore((s) => s.events)
  const players = useGameStore((s) => s.players)

  if (events.length === 0) {
    return (
      <div
        className="p-4 rounded-xl text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <p className="text-label" style={{ color: 'var(--text)' }}>
          Nenhum evento drink ainda
        </p>
      </div>
    )
  }

  return (
    <section aria-labelledby="history-heading">
      <h2
        id="history-heading"
        className="text-label mb-3"
        style={{ color: 'var(--text)' }}
      >
        HISTÓRICO DE EVENTOS
      </h2>

      <ul className="flex flex-col gap-2" role="list">
        {[...events].reverse().map((event, i) => {
          const winner = event.winnerId
            ? players.find((p) => p.id === event.winnerId)
            : null

          return (
            <li
              key={`${event.drinkId}-${event.triggeredAt}-${i}`}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {/* Thumbnail */}
              {event.thumb ? (
                <img
                  src={event.thumb}
                  alt={event.drinkName}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                  style={{ background: 'var(--bg)' }}
                  aria-hidden="true"
                >
                  🥃
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-body font-semibold truncate"
                  style={{ color: 'var(--text-h)' }}
                >
                  {event.drinkName}
                </p>
                <p className="text-label mt-0.5" style={{ color: 'var(--text)' }}>
                  {winner ? `${winner.name} ganhou` : 'Ninguém ganhou'} ·{' '}
                  {formatTime(event.triggeredAt)}
                </p>
              </div>

              {/* Bônus */}
              <span
                className="text-body font-bold shrink-0"
                style={{ color: 'var(--accent)' }}
                aria-label={`Bônus de ${event.bonus} pontos`}
              >
                +{event.bonus}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
