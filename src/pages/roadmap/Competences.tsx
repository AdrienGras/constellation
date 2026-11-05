import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { metierParId } from '@/donnees'

const REQUETE = '(min-width: 1024px)'

// Ouvert à partir de 1024 px (colonne sticky), replié en dessous ; sans matchMedia, ouvert.
function useLarge(): boolean {
  const [large, setLarge] = useState(
    () => typeof window.matchMedia !== 'function' || window.matchMedia(REQUETE).matches,
  )
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(REQUETE)
    const surChangement = (e: { matches: boolean }) => setLarge(e.matches)
    mql.addEventListener('change', surChangement)
    return () => mql.removeEventListener('change', surChangement)
  }, [])
  return large
}

export function Competences({ cible }: { cible: string | null }) {
  const large = useLarge()
  const metier = cible ? metierParId(cible) : undefined
  return (
    <aside data-competences className="lg:sticky lg:top-6 lg:self-start">
      <details
        open={large}
        className="rounded-md bg-surface p-4 shadow-carte [&>summary]:cursor-pointer [&>summary]:font-display [&>summary]:text-[18px] [&>summary]:leading-6 [&>summary]:font-[650]"
      >
        <summary>Compétences de la fiche</summary>
        <div className="mt-3 flex flex-col gap-3">
          {metier ? (
            <>
              <p className="m-0 text-[15px] leading-[22px] text-encre-douce">
                Une référence pour construire ta roadmap, pas une liste à cocher.
              </p>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {metier.competences.map((c) => (
                  <li key={c}>
                    <Badge variant="outline">{c}</Badge>
                  </li>
                ))}
              </ul>
              <Link to={`/fiche/${metier.id}`} className="font-bold text-primaire underline underline-offset-[3px]">
                Voir la fiche<span className="sr-only"> de {metier.titre}</span>
              </Link>
            </>
          ) : (
            <p className="m-0 text-[15px] leading-[22px] text-encre-douce">
              Elles s’afficheront ici dès que tu auras choisi un métier.
            </p>
          )}
        </div>
      </details>
    </aside>
  )
}
