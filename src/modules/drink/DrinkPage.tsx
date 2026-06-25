import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Select, Spin } from 'antd'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore, selectActivePlayers } from '@/shared/store/useGameStore'
import { useDrinkEvent } from './useDrinkEvent'
import DrinkCard from './DrinkCard'

const DEFAULT_BONUS = 10

function calcBonus(drinkName: string): number {
  if (!drinkName || drinkName === 'Shot de Destilado') return DEFAULT_BONUS
  return Math.max(10, Math.min(30, Math.round(drinkName.length * 0.8)))
}



const DrinkPage = () => {
  const navigate = useNavigate()
  const { applyDrinkBonus, skipDrinkEvent } = useGameStore(
    useShallow((s) => ({
      applyDrinkBonus: s.applyDrinkBonus,
      skipDrinkEvent: s.skipDrinkEvent,
    })),
  )
  const activePlayers = useGameStore(useShallow(selectActivePlayers))

  const { drink, isLoading } = useDrinkEvent()
  const [winnerId, setWinnerId] = useState<string | null>(null)

  const winnerOptions = useMemo(
    () => activePlayers.map((p) => ({ value: p.id, label: p.name })),
    [activePlayers],
  )

  const handleApply = () => {
    if (!drink) return
    const bonus = calcBonus(drink.strDrink)
    applyDrinkBonus({
      drinkId: drink.idDrink,
      drinkName: drink.strDrink,
      thumb: drink.strDrinkThumb,
      bonus,
      winnerId,
      triggeredAt: Date.now(),
    })
    navigate('/control')
  }

  const handleSkip = () => {
    skipDrinkEvent()
    navigate('/control')
  }

  return (
    <div className="min-h-svh flex flex-col" style={{ background: 'var(--bg)' }}>

      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center gap-3"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={() => navigate('/control')}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all
                     hover:brightness-110 active:scale-90 focus-visible:outline-2"
          style={{ background: 'var(--surface)', color: 'var(--text-h)' }}
          aria-label="Voltar para o controle"
        >
          ←
        </button>
        <div>
          <h1 className="text-title font-black uppercase" style={{ color: 'var(--text-h)' }}>
             Evento Drink
          </h1>
          <p className="text-label" style={{ color: 'var(--text)' }}>
            Primeiro a preparar leva o bônus!
          </p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-6 flex flex-col gap-6">

        {isLoading && (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-6 py-16"
            role="status"
            aria-live="polite"
          >
            <Spin size="large" />
            <p className="text-title font-bold text-center" style={{ color: 'var(--text-h)' }}>
              Sorteando o drink...
            </p>
            <p className="text-body text-center" style={{ color: 'var(--text)' }}>
              Consultando o estoque de bebidas
            </p>
          </div>
        )}

        {!isLoading && drink && (
          <>
            <DrinkCard drink={drink} />

            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div>
                <p className="text-label" style={{ color: 'var(--text)' }}>Bônus do evento</p>
                <p className="text-headline font-black" style={{ color: 'var(--accent)' }}>
                  +{calcBonus(drink.strDrink)} pts
                </p>
              </div>
            </div>
            <div className='text-label'>Caso não possa preparar o drink, quem tomar um shot ganha o bonus!</div>
            <div className="flex flex-col gap-2">
              <label
                className="text-label"
                style={{ color: 'var(--text)' }}
                htmlFor="winner-select"
              >
                Quem preparou/tomou primeiro?
              </label>
              <Select
                id="winner-select"
                size="large"
                placeholder="Selecionar vencedor..."
                value={winnerId}
                onChange={(val) => setWinnerId(val ?? null)}
                allowClear
                style={{ width: '100%' }}
                options={winnerOptions}
                aria-label="Selecionar o jogador que venceu o evento drink"
              />
              {winnerId === null && (
                <p className="text-label" style={{ color: 'var(--accent)' }}>
                  Selecione um jogador para aplicar o bônus, ou use "Pular Evento" para descontar pontos de todos.
                </p>
              )}
            
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleApply}
                disabled={!winnerId}
                className="w-full py-4 rounded-xl font-bold text-title uppercase tracking-wide
                           transition-all active:scale-95 hover:brightness-110
                           focus-visible:outline-2 focus-visible:outline-offset-2
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{ background: 'var(--accent)', color: '#fff' }}
                aria-label={
                  winnerId
                    ? `Aplicar bônus para ${activePlayers.find((p) => p.id === winnerId)?.name}`
                    : 'Selecione um jogador para aplicar o bônus'
                }
              >
                APLICAR BÔNUS ✓
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-3 rounded-xl font-bold text-body uppercase tracking-wide
                           border transition-all active:scale-95 hover:brightness-110
                           focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  background: 'transparent',
                }}
                aria-label="Pular evento — todos os jogadores ativos perdem 5 pontos"
              >
                PULAR EVENTO (−5 pts para todos)
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
export default DrinkPage
