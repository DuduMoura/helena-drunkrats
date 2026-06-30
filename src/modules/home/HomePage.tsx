import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/shared/store/useGameStore'
import { gameRules, wellbeingItems } from './constants/homePageConstants'
import drunkRatsLogo from '@app/assets/img/drunkrats logo 2.png'


function hasSavedGame(): boolean {
  try {
    const raw = localStorage.getItem('drunkrats-game')
    if (!raw) return false
    const parsed = JSON.parse(raw) as { state?: { status?: string } }
    const status = parsed?.state?.status
    return status === 'playing' || status === 'finished'
  } catch {
    return false
  }
}

export default function HomePage() {
  const navigate = useNavigate()
  const { status, startGame } = useGameStore()
  const savedGame = hasSavedGame()

  function handlePrimary() {
    if (status === 'idle') {
      startGame()
      navigate('/players')
    } else if (status === 'setup') {
      navigate('/players')
    } else if (status === 'playing') {
      navigate('/control')
    } else if (status === 'finished') {
      useGameStore.getState().resetGame()
      navigate('/')
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col justify-center">
      <header className="flex flex-col items-center text-center px-6 pt-8 pb-8">
        <img src={drunkRatsLogo} alt="DrunkRats" className="h-30 mb-2 object-contain" />

        <p className="text-title" style={{ color: 'var(--text)', fontWeight: '150' }}>
          A gincana oficial da saideira que nunca acaba.
        </p>
        <div className="flex gap-8 mt-8">
          {[
            { value: '0', label: 'BACKEND' },
            { value: '0', label: 'CONTAS' },
            { value: '∞',  label: 'RESSACAS' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span
                className="text-headline font-black tabular-nums"
                style={{ color: 'var(--accent)' }}
              >
                {value}
              </span>
              <span className="text-label" style={{ color: 'var(--text)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </header>

      <main className="w-full max-w-xl mx-auto px-6 pb-8 flex flex-col gap-8">

        <section className="flex flex-col gap-3" aria-label="Ações principais">
          {status !== 'finished' && (
            <button
              onClick={handlePrimary}
              className="w-full py-4 rounded-xl font-bold text-title uppercase tracking-wide
                         transition-all active:scale-95 hover:brightness-110 focus-visible:outline-2
                         focus-visible:outline-offset-2"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                boxShadow: '0 4px 24px var(--accent-bg)',
              }}
              aria-label={
                status === 'playing'
                  ? 'Continuar a partida em andamento'
                  : status === 'setup'
                    ? 'Continuar adicionando jogadores'
                    : 'Começar uma nova bebedeira'
              }
            >
              {status === 'playing'
                ? 'CONTINUAR PARTIDA →'
                : status === 'setup'
                  ? 'CONTINUAR CONFIGURAÇÃO →'
                  : 'COMEÇAR BEBEDEIRA →'}
            </button>
          )}

          {status === 'finished' && (
            <>
              <button
                onClick={handlePrimary}
                className="w-full py-4 rounded-xl font-bold text-title uppercase tracking-wide
                           transition-all active:scale-95 hover:brightness-110 focus-visible:outline-2
                           focus-visible:outline-offset-2"
                style={{ background: 'var(--accent)', color: '#fff' }}
                aria-label="Iniciar nova partida"
              >
                NOVA RESSACA
              </button>
              <button
                onClick={() => navigate('/scoreboard')}
                className="w-full py-3 rounded-xl font-bold text-body uppercase tracking-wide
                           border transition-all active:scale-95 hover:brightness-110
                           focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                  background: 'var(--accent-bg)',
                }}
                aria-label="Ver o placar da última partida"
              >
                VER PLACAR
              </button>
            </>
          )}

          {status === 'idle' && savedGame && (
            <button
              onClick={() => navigate('/scoreboard')}
              className="w-full py-3 rounded-xl font-bold text-body uppercase tracking-wide
                         border transition-all active:scale-95 hover:brightness-110
                         focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                background: 'transparent',
              }}
              aria-label="Ver o placar da última partida salva"
            >
              VER ÚLTIMO PLACAR
            </button>
          )}
        </section>

        <section aria-labelledby="gameRules-heading">
          <div className="flex  justify-center"> <h4
            id="gameRules-heading"
            className="mb-4!"
            style={{ color: 'var(--accent)' }}
          >
            Manual da Ratazana — As Regras
          </h4>
          </div>
         

          <ol className="flex flex-col gap-3" role="list">
            {gameRules.map((rule) => (
              <li
                key={rule.number}
                className="flex gap-4 p-4 rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <span
                  className="text-title font-black shrink-0 w-6 text-center"
                  style={{ color: 'var(--accent)' }}
                  aria-hidden="true"
                >
                  {rule.number}
                </span>
                <span className="text-body" style={{ color: 'var(--text-h)' }}>
                  {rule.text}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="p-5 rounded-xl md:flex justify-center items-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          aria-labelledby="wellbeingItems-heading"
        >
          <h2
            id="wellbeingItems-heading"
            className="ml-3! md:mb-0! mb-3!"
            style={{ color: 'var(--accent)' }}
          >
             Antes de começar
          </h2>

          <ul className="flex flex-col gap-2" role="list">
            {wellbeingItems.map((item) => (
              <li
                key={item.text}
                className="flex items-start gap-3 text-body"
                style={{ color: 'var(--text-h)' }}
              >
                <span
                  className="shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </section>
      </main>

    </div>
  )
}
