import { Navigate, Route, Routes } from 'react-router-dom'
import { useGameStore } from '@/shared/store/useGameStore'
import HomePage from '@modules/home/HomePage'
import PlayersPage from '@modules/players/PlayersPage'
import ControlPage from '@modules/control/ControlPage'
import ScoreboardPage from '@modules/scoreboard/ScoreboardPage'

import DrinkPage from '@modules/drink/DrinkPage'

// ── Route guards ───────────────────────────────────────────────────────────

function PlayersGuard({ children }: { children: React.ReactNode }) {
  const status = useGameStore((s) => s.status)
  if (status === 'setup') return <>{children}</>
  if (status === 'playing') return <Navigate to="/control" replace />
  return <Navigate to="/" replace />
}

function ControlGuard({ children }: { children: React.ReactNode }) {
  const status = useGameStore((s) => s.status)
  if (status === 'playing') return <>{children}</>
  if (status === 'finished') return <Navigate to="/scoreboard" replace />
  return <Navigate to="/" replace />
}

function ScoreboardGuard({ children }: { children: React.ReactNode }) {
  const status = useGameStore((s) => s.status)
  return status === 'playing' || status === 'finished' ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace />
  )
}

function DrinkGuard({ children }: { children: React.ReactNode }) {
  const status = useGameStore((s) => s.status)
  return status === 'playing' ? <>{children}</> : <Navigate to="/control" replace />
}

// ── Router ─────────────────────────────────────────────────────────────────

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/players"
        element={
          <PlayersGuard>
            <PlayersPage />
          </PlayersGuard>
        }
      />

      <Route
        path="/control"
        element={
          <ControlGuard>
            <ControlPage />
          </ControlGuard>
        }
      />

      <Route
        path="/scoreboard"
        element={
          <ScoreboardGuard>
            <ScoreboardPage />
          </ScoreboardGuard>
        }
      />

      <Route
        path="/drink"
        element={
          <DrinkGuard>
            <DrinkPage />
          </DrinkGuard>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
