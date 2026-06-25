export interface LastAction {
  label: string
  timestamp: number
}

export interface PlayerTileProps {
  playerId: string
  index: number
  onOpenCalculator: (playerId: string) => void
}
