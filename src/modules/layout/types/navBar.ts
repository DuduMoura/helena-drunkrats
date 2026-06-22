export interface NavItem {
  to: string
  label: string
  icon: string
  ariaLabel: string
}

export const navItems: NavItem[] = [
  { to: '/',            label: 'Home',    icon: 'home', ariaLabel: 'Ir para a página inicial' },
  { to: '/control',     label: 'Controle', icon: 'control_camera', ariaLabel: 'Ir para o controle da partida' },
  { to: '/scoreboard',  label: 'Placar',  icon: 'leaderboard', ariaLabel: 'Ver o placar' },
]
