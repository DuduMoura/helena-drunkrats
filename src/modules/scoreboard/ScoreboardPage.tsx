import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore, selectRanking } from '@/shared/store/useGameStore'
import Podium from './Podium'
import RankingTable from './RankingTable'
import type { RankedPlayer, SessionStats } from './types'

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ScoreboardPage() {
  const navigate = useNavigate()
  const { status, players, events, startedAt } = useGameStore(
    useShallow((s) => ({
      status: s.status,
      players: s.players,
      events: s.events,
      startedAt: s.startedAt,
    })),
  )
  const ranking = useGameStore(useShallow(selectRanking))

  const rankedPlayers: RankedPlayer[] = ranking.map((p, i) => ({ ...p, rank: i + 1 }))
  const top3 = rankedPlayers.filter((p) => p.rank <= 3)
  const maxScore = rankedPlayers[0]?.score ?? 0
  const activePlayers = players.filter((p) => p.active)
  const inactivePlayers = players.filter((p) => !p.active)
  const champion = rankedPlayers[0]

  const isFinished = status === 'finished'

  const stats: SessionStats = {
    highScore: maxScore,
    avgScore:
      players.length > 0
        ? Math.round(players.reduce((s, p) => s + p.score, 0) / players.length)
        : 0,
    dropouts: inactivePlayers.length,
    drinkEvents: events.length,
    totalBonus: events.reduce((s, e) => s + (e.winnerId ? e.bonus : 0), 0),
    durationMs: startedAt ? Date.now() - startedAt : 0,
  }

  function handleReset() {
    useGameStore.getState().resetGame()
    navigate('/')
  }

  return (
    <div className="w-full flex flex-col" style={{ background: 'var(--bg)' }}>

      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h1
            className="text-headline font-black uppercase"
            style={{ color: 'var(--text-h)' }}
          >
            {isFinished ? 'A Ressaca Está Selada.' : 'Placar'}
          </h1>
          <p className="text-label" style={{ color: 'var(--text)' }}>
            {isFinished
              ? `${activePlayers.length} ativos · ${inactivePlayers.length} desistentes · ${events.length} eventos`
              : 'Partida em andamento'}
          </p>
        </div>

        {!isFinished && (
          <button
            onClick={() => navigate('/control')}
            className="px-4 py-2 rounded-lg font-bold text-label uppercase tracking-wide
                       transition-all active:scale-95 hover:brightness-110 focus-visible:outline-2"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
            }}
            aria-label="Voltar para o controle da partida"
          >
            voltar para CONTROLE
          </button>
        )}
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-6 flex flex-col gap-8">

        {isFinished && top3.length >= 1 && (
          <Podium top3={top3} />
        )}

        {!isFinished && rankedPlayers.length > 0 && (
          <section aria-labelledby="live-heading">
            <h2
              id="live-heading"
              className="text-label mb-3"
              style={{ color: 'var(--accent)' }}
            >
              RANKING AO VIVO
            </h2>
            <RankingTable players={rankedPlayers} maxScore={maxScore} />
          </section>
        )}

        {isFinished && rankedPlayers.length > 0 && (
          <RankingTable players={rankedPlayers} maxScore={maxScore} />
        )}

        {events.length > 0 && (
          <section aria-labelledby="events-heading">
            <h2
              id="events-heading"
              className="text-label mb-3"
              style={{ color: 'var(--text)' }}
            >
              EVENTOS DRINK
            </h2>
            <ul className="flex flex-col gap-2" role="list">
              {[...events].reverse().map((event, i) => {
                const winner = event.winnerId
                  ? players.find((p) => p.id === event.winnerId)
                  : null
                return (
                  <li
                    key={`${event.drinkId}-${i}`}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
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
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-semibold truncate" style={{ color: 'var(--text-h)' }}>
                        {event.drinkName}
                      </p>
                      <p className="text-label" style={{ color: 'var(--text)' }}>
                        {winner ? `${winner.name} ganhou` : 'Pulado'} · {formatTime(event.triggeredAt)}
                      </p>
                    </div>
                    <span className="text-body font-bold shrink-0" style={{ color: 'var(--accent)' }}>
                      +{event.bonus}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {isFinished && (
          <section
            className="p-5 rounded-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            aria-labelledby="stats-heading"
          >
            <h2
              id="stats-heading"
              className="text-label mb-4"
              style={{ color: 'var(--accent)' }}
            >
              ESTATÍSTICAS DA SESSÃO
            </h2>
            <dl className="grid grid-cols-2 gap-3">
              {[
                { label: 'Maior pontuação', value: `${stats.highScore} pts` },
                { label: 'Média do bando', value: `${stats.avgScore} pts` },
                { label: 'Desistências', value: stats.dropouts },
                { label: 'Eventos drink', value: stats.drinkEvents },
                { label: 'Total de bônus', value: `${stats.totalBonus} pts` },
                { label: 'Duração total', value: formatDuration(stats.durationMs) },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-label" style={{ color: 'var(--text)' }}>{label}</dt>
                  <dd className="text-title font-bold" style={{ color: 'var(--text-h)' }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {isFinished && champion && (
          <section
            className="p-6 rounded-2xl text-center"
            style={{ background: 'var(--accent)', border: '1px solid var(--accent-border)' }}
            aria-label={`Campeão da saideira: ${champion.name}`}
          >
            <p className="text-label mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              CAMPEÃO DA SAIDEIRA
            </p>
            <p className="text-display font-black uppercase" style={{ color: '#fff' }}>
              {champion.name}
            </p>
            <p className="text-title font-bold mt-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {champion.score} pts
            </p>
          </section>
        )}

        {isFinished && (
          <button
            onClick={handleReset}
            className="w-full py-4 rounded-xl font-bold text-title uppercase tracking-wide
                       transition-all active:scale-95 hover:brightness-110
                       focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
            }}
            aria-label="Iniciar nova partida — limpa o jogo atual"
          >
            NOVA RESSACA →
          </button>
        )}
      </main>
    </div>
  )
}
