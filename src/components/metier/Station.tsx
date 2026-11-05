import { ligneParId } from '@/donnees'
import type { LigneId, TypeMetier } from '@/donnees/types'

export type EtatStation = 'repos' | 'survol' | 'focus' | 'attenue'

export function Station({
  ligne,
  categorie,
  type,
  etat = 'repos',
  titre,
}: {
  ligne: LigneId
  categorie?: string
  type: TypeMetier
  etat?: EtatStation
  titre?: string
}) {
  const l = ligneParId(ligne)
  const couleur = categorie ? `var(--cat-${categorie})` : `var(--ligne-${l.id})`
  const r = etat === 'survol' ? 11 : 9
  const svg = (
    <svg
      width={34}
      height={34}
      viewBox="0 0 34 34"
      aria-hidden="true"
      style={{ opacity: etat === 'attenue' ? 0.45 : 1 }}
    >
      {etat === 'survol' || etat === 'focus' ? (
        <circle
          cx={17}
          cy={17}
          r={r + 5}
          fill="none"
          stroke={etat === 'focus' ? 'var(--focus)' : couleur}
          strokeWidth={2}
          strokeOpacity={etat === 'focus' ? 1 : 0.5}
        />
      ) : null}
      <circle cx={17} cy={17} r={r + 2} fill="var(--surface)" />
      {type === 'evolution' ? (
        <>
          <circle cx={17} cy={17} r={r} fill="var(--surface)" stroke={couleur} strokeWidth={4} />
          <circle cx={17} cy={17} r={r - 5} fill={couleur} />
        </>
      ) : (
        <circle cx={17} cy={17} r={r} fill={couleur} />
      )}
    </svg>
  )
  if (!titre) return svg
  return (
    <span className="inline-flex flex-col items-center gap-1.5 text-center text-[13px] leading-[18px] text-encre-douce">
      {svg}
      <span>{titre}</span>
    </span>
  )
}
