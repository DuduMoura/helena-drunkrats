import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from 'antd'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore, selectActivePlayers, selectTotalPoints } from '@/shared/store/useGameStore'
import { PLAYER_COLORS } from '@/modules/players/types'
import PlayerTile from './PlayerTile'
import MlCalculator from './MlCalculator'
import EventHistory from './EventHistory'

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0'),
  ].join(':')
}

export default function ControlPage() {
  const navigate = useNavigate()
  const { players, events, startedAt, finishGame } = useGameStore(
    useShallow((s) => ({
      players: s.players,
      events: s.events,
      startedAt: s.startedAt,
      finishGame: s.finishGame,
    })),
  )
  const activePlayers = useGameStore(useShallow(selectActivePlayers))
  const totalPoints = useGameStore(selectTotalPoints)

  const [elapsed, setElapsed] = useState(0)
  const [calcPlayerId, setCalcPlayerId] = useState<string | null>(null)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')

  // Timer
  useEffect(() => {
    if (!startedAt) return
    const id = setInterval(() => {
      setElapsed(Date.now() - startedAt)
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  function handleFinish() {
    finishGame()
    navigate('/scoreboard')
  }

  function handleAddPlayer() {
    const name = newPlayerName.trim()
    if (!name || players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return
    const usedColors = players.map((p) => p.color)
    const color =
      PLAYER_COLORS.find((c) => !usedColors.includes(c.value))?.value ?? '#888888'
    useGameStore.getState().addPlayer(name, color)
    setNewPlayerName('')
    setShowAddPlayer(false)
  }

  const inactivePlayers = players.filter((p) => !p.active)

  return (
    <div className="min-h-svh flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-4 py-3"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Timer */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-label" style={{ color: 'var(--text)' }}>Partida em andamento</p>
            <p
              className="text-headline font-black tabular-nums"
              style={{ color: 'var(--text-h)' }}
              aria-label={`Tempo de partida: ${formatElapsed(elapsed)}`}
            >
              {formatElapsed(elapsed)}
            </p>
          </div>

          <button
            onClick={() => setShowFinishModal(true)}
            className="px-4 py-2 rounded-lg font-bold text-label uppercase tracking-wide
                       transition-all active:scale-95 hover:brightness-110 focus-visible:outline-2"
            style={{
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-border)',
            }}
            aria-label="Encerrar a partida"
          >
            ENCERRAR
          </button>
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: activePlayers.length, label: 'ATIVOS' },
            { value: inactivePlayers.length, label: 'DESIST.' },
            { value: totalPoints, label: 'TOTAL PTS' },
            { value: events.length, label: 'EVENTOS' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center p-2 rounded-lg"
              style={{ background: 'var(--surface)' }}
            >
              <span
                className="text-title font-black tabular-nums"
                style={{ color: 'var(--text-h)' }}
              >
                {value}
              </span>
              <span className="text-label" style={{ color: 'var(--text)', fontSize: '0.65rem' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => navigate('/scoreboard')}
            className="flex-1 py-2.5 rounded-lg font-bold text-label uppercase tracking-wide
                       transition-all active:scale-95 hover:brightness-110 focus-visible:outline-2"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
            }}
            aria-label="Ver o placar"
          >
           PLACAR
          </button>
          <button
            onClick={() => navigate('/drink')}
            className="flex-1 py-2.5 rounded-lg font-bold text-label uppercase tracking-wide
                       transition-all active:scale-95 hover:brightness-110 focus-visible:outline-2"
            style={{ background: 'var(--accent)', color: '#fff' }}
            aria-label="Sortear evento drink"
          >
           EVENTO DRINK
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 flex flex-col gap-6">

        {/* ── Grid de jogadores ──────────────────────────────────── */}
        <section aria-labelledby="players-heading">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="players-heading"
              className="text-label"
              style={{ color: 'var(--text)' }}
            >
              JOGADORES
            </h2>
            <button
              onClick={() => setShowAddPlayer((v) => !v)}
              className="px-3 py-1.5 rounded-lg font-bold text-label uppercase transition-all
                         active:scale-95 hover:brightness-110 focus-visible:outline-2"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-h)',
                border: '1px solid var(--border)',
              }}
              aria-label="Adicionar novo jogador durante a partida"
              aria-expanded={showAddPlayer}
            >
              + RATO
            </button>
          </div>

          {/* Formulário rápido de adicionar */}
          {showAddPlayer && (
            <div
              className="flex gap-2 mb-3 p-3 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                placeholder="Nome do novo rato"
                className="flex-1 px-3 py-2 rounded-lg text-body outline-none"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text-h)',
                  border: '1px solid var(--border)',
                }}
                aria-label="Nome do novo jogador"
              />
              <button
                onClick={handleAddPlayer}
                className="px-4 py-2 rounded-lg font-bold text-body transition-all active:scale-95"
                style={{ background: 'var(--accent)', color: '#fff' }}
                aria-label="Confirmar adição do jogador"
              >
                OK
              </button>
            </div>
          )}

          {/* Cards dos jogadores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((player, index) => (
              <PlayerTile
                key={player.id}
                playerId={player.id}
                index={index}
                onOpenCalculator={(id) => setCalcPlayerId(id)}
              />
            ))}
          </div>
        </section>

        {/* ── Histórico de eventos ───────────────────────────────── */}
        <EventHistory />
      </main>

      {/* ── Modal encerrar ─────────────────────────────────────── */}
      <Modal
        open={showFinishModal}
        onCancel={() => setShowFinishModal(false)}
        onOk={handleFinish}
        okText="ENCERRAR"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
        title={<span style={{ color: 'var(--text-h)' }}>Encerrar a partida?</span>}
        aria-label="Confirmar encerramento da partida"
      >
        <p style={{ color: 'var(--text-h)' }}>
          O placar final será calculado com base nas pontuações atuais. Esta ação não pode ser desfeita.
        </p>
      </Modal>

      <MlCalculator
        playerId={calcPlayerId}
        open={calcPlayerId !== null}
        onClose={() => setCalcPlayerId(null)}
      />
    </div>
  )
}
