export function PlageSalaire({
  min,
  max,
  echelle,
  couleur,
}: {
  min: number
  max: number
  echelle: [number, number]
  couleur?: string
}) {
  const span = echelle[1] - echelle[0] || 1
  const gauche = ((min - echelle[0]) / span) * 100
  const largeur = ((max - min) / span) * 100
  return (
    <div
      aria-hidden="true"
      className="relative h-3 min-w-[120px] rounded-full bg-surface-muted"
    >
      <div
        data-slot="plage-barre"
        className="absolute top-0 bottom-0 rounded-full"
        style={{
          left: `${gauche}%`,
          width: `${Math.max(largeur, 2)}%`,
          background: couleur ?? 'var(--primaire)',
        }}
      />
    </div>
  )
}
