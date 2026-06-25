import PlayerAvatar from '@/shared/components/PlayerAvatar'
import type { Player } from '@/shared/store/useGameStore'

interface PlayerCardProps {
  player: Player
  onRemove: (id: string) => void
}

export default function PlayerCard({ player, onRemove }: PlayerCardProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl transition-all"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <PlayerAvatar name={player.name} color={player.color} size="md" />

      <div className="flex-1 min-w-0">
        <p
          className="text-body font-semibold truncate"
          style={{ color: 'var(--text-h)' }}
        >
          {player.name}
        </p>
        <p className="text-label mt-0.5" style={{ color: 'var(--text)' }}>
          Rato registrado
        </p>
      </div>

      {/* Amostra de cor */}
      <div
        className="w-5 h-5 rounded-full shrink-0"
        style={{ background: player.color }}
        aria-label={`Cor do jogador: ${player.color}`}
      />

      <button
        onClick={() => onRemove(player.id)}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                   transition-all hover:brightness-110 active:scale-90
                   focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
        aria-label={`Remover ${player.name}`}
      >
        ✕
      </button>
    </div>
  )
}
