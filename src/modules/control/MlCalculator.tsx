import { useState } from 'react'
import { Modal } from 'antd'
import { useGameStore } from '@/shared/store/useGameStore'
import { calcScore } from '@/shared/lib/scoring'

interface MlCalculatorProps {
  playerId: string | null
  open: boolean
  onClose: () => void
}

const QUICK_POINTS = [5, 10, 20] as const

export default function MlCalculator({ playerId, open, onClose }: MlCalculatorProps) {
  const addPoints = useGameStore((s) => s.addPoints)
  const players = useGameStore((s) => s.players)
  const [ml, setMl] = useState('')
  const [abv, setAbv] = useState('')

  const player = players.find((p) => p.id === playerId)
  const pts = calcScore(Number(ml), Number(abv))
  const hasValues = Number(ml) > 0 && Number(abv) > 0

  function handleApplyCalc() {
    if (!playerId || pts <= 0) return
    addPoints(playerId, pts)
    setMl('')
    setAbv('')
    onClose()
  }

  function handleQuick(quick: number) {
    if (!playerId) return
    addPoints(playerId, quick)
    onClose()
  }

  function handleClose() {
    setMl('')
    setAbv('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      title={
        <span style={{ color: 'var(--text-h)' }}>
          ml × % — {player?.name ?? 'Jogador'}
        </span>
      }
      aria-label={`Calculadora de pontos para ${player?.name ?? 'jogador'}`}
    >
      <div className="flex flex-col gap-5 pt-2">

        <div className="flex flex-col gap-2">
          <p className="text-label" style={{ color: 'var(--text)' }}>
            Pontos rápidos
          </p>
          <div className="flex gap-2">
            {QUICK_POINTS.map((q) => (
              <button
                key={q}
                onClick={() => handleQuick(q)}
                className="flex-1 py-3 rounded-lg font-bold text-body
                           transition-all active:scale-95 hover:brightness-110
                           focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                aria-label={`Adicionar ${q} pontos a ${player?.name ?? 'jogador'}`}
              >
                +{q}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        <div className="flex flex-col gap-3">
          <p className="text-label" style={{ color: 'var(--text)' }}>
            Calcular por ml × teor
          </p>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="calc-ml" className="text-label" style={{ color: 'var(--text)' }}>
                Volume (ml)
              </label>
              <input
                id="calc-ml"
                type="number"
                min="0"
                max="2000"
                value={ml}
                onChange={(e) => setMl(e.target.value)}
                placeholder="Ex: 350"
                className="w-full px-3 py-2.5 rounded-lg text-body outline-none focus:ring-2"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text-h)',
                  border: '1px solid var(--border)',
                  '--tw-ring-color': 'var(--accent)',
                } as React.CSSProperties}
                aria-label="Volume em mililitros"
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="calc-abv" className="text-label" style={{ color: 'var(--text)' }}>
                Teor (%)
              </label>
              <input
                id="calc-abv"
                type="number"
                min="0"
                max="100"
                value={abv}
                onChange={(e) => setAbv(e.target.value)}
                placeholder="Ex: 5"
                className="w-full px-3 py-2.5 rounded-lg text-body outline-none focus:ring-2"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text-h)',
                  border: '1px solid var(--border)',
                  '--tw-ring-color': 'var(--accent)',
                } as React.CSSProperties}
                aria-label="Teor alcoólico em porcentagem"
              />
            </div>
          </div>

          {/* Preview do resultado */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="text-label" style={{ color: 'var(--text)' }}>
              Resultado
            </span>
            <span
              className="text-title font-black"
              style={{ color: hasValues ? 'var(--accent)' : 'var(--text)' }}
              aria-label={hasValues ? `${pts} pontos` : 'preencha os campos'}
            >
              {hasValues ? `+${pts} pts` : '—'}
            </span>
          </div>

          <button
            onClick={handleApplyCalc}
            disabled={!hasValues || pts <= 0}
            className="w-full py-3 rounded-lg font-bold text-body uppercase tracking-wide
                       transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2
                       disabled:opacity-40 disabled:cursor-not-allowed
                       enabled:hover:brightness-110"
            style={{ background: 'var(--accent)', color: '#fff' }}
            aria-label={hasValues ? `Aplicar ${pts} pontos a ${player?.name}` : 'Preencha os campos para calcular'}
          >
            APLICAR {hasValues ? `+${pts} pts` : ''}
          </button>
        </div>
      </div>
    </Modal>
  )
}
