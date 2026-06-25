interface PlayerAvatarProps {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  inactive?: boolean
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

export default function PlayerAvatar({
  name,
  color,
  size = 'md',
  inactive = false,
}: PlayerAvatarProps) {
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full flex items-center justify-center
        font-bold select-none shrink-0
        transition-all duration-200
        ${inactive ? 'opacity-40 grayscale' : ''}
      `}
      style={{ backgroundColor: color }}
      aria-label={`Avatar de ${name}`}
    >
      <span style={{ color: getContrastColor(color) }}>{initial}</span>
    </div>
  )
}

// Retorna preto ou branco dependendo do brilho da cor de fundo
function getContrastColor(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  // Luminância relativa (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#111111' : '#ffffff'
}
