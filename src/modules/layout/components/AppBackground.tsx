import '@app/assets/background.css'

export default function AppBackground() {
  return (
    <div className="gradient-background">
      <div className="gradient-sphere sphere-1" />
      <div className="gradient-sphere sphere-2" />
      <div className="gradient-sphere sphere-3" />
      <div className="grid-overlay" />
      <div className="bg-glow" />
      <div className="noise-overlay" />
    </div>
  )
}
