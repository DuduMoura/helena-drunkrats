import NavBar from '@modules/layout/components/NavBar'
import AppBackground from '@/modules/layout/components/AppBackground'
import Router from './app/router/router'
import { useGameStore } from '@/shared/store/useGameStore'


export default function App() {
  const status = useGameStore((s) => s.status)
  const hasNav = status === 'playing' || status === 'finished'

  return (
    <div className="flex flex-col min-h-svh relative z-10">
      <AppBackground />
      <NavBar />

     
      <main
        className={[
          'flex-1 flex flex-col items-center w-full',
          hasNav
            ? 'pb-[7rem] md:pb-10 md:pl-20 xl:pl-56 md:pt-0 pt-[4.5rem]'
            : 'pb-10',
        ].join(' ')}
      >
        <Router />
      </main>


      <footer
        className={[
          'fixed left-0 right-0 z-40',
          'h-10 flex items-center justify-center',
          'text-label',
          hasNav
            ? 'bottom-0 md:bottom-0 md:pl-20 xl:pl-56'
            : 'bottom-0',
        ].join(' ')}
        style={{
          background: 'var(--surface)',
          color: 'var(--text)',
          borderTop: '1px solid var(--border)',
        }}
      >
        18+ · BEBA COM MODERAÇÃO · RATOS NÃO DIRIGEM
      </footer>

    </div>
  )
}
