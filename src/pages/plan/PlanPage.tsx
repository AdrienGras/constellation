import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useFiltres } from '@/etat/FiltresContext'
import { useQuiz } from '@/etat/QuizContext'
import { usePageTitre } from '../usePageTitre'
import { EnTeteAccueil } from './EnTeteAccueil'
import { PlanSvg } from './PlanSvg'

const DRAPEAU = 'constellation.plan.redirige'

// Sur écran étroit, le plan est illisible : la première visite de la session part sur la liste.
function redirigerSiEtroit(aller: () => void) {
  try {
    if (window.sessionStorage.getItem(DRAPEAU)) return
    window.sessionStorage.setItem(DRAPEAU, '1')
  } catch {
    return
  }
  if (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767px)').matches) {
    aller()
  }
}

export function PlanPage() {
  usePageTitre('Plan des métiers')
  const navigate = useNavigate()
  const { filtres } = useFiltres()
  const { top3 } = useQuiz()

  useEffect(() => {
    redirigerSiEtroit(() => navigate('/liste', { replace: true }))
  }, [navigate])

  return (
    // Le plan prend toute la largeur, comme dans la maquette : seuls l’en-tête et le lien d’évitement ont la marge de page.
    // `pt-3` : les 4 px repris compensent la hauteur gagnée par le plan (centre visible en 1366×633).
    <div className="flex flex-col pb-6">
      <div className="px-6 pt-3 pb-2 md:px-12">
        <EnTeteAccueil
          titre="Le plan des métiers du numérique"
          chapeau="68 métiers sur 8 lignes. Survole une station pour voir le métier, clique pour ouvrir sa fiche."
          vue="graphe"
        />
      </div>
      <Link
        to="/liste"
        className="sr-only focus:not-sr-only focus:mx-6 focus:self-start md:focus:mx-12 focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2"
      >
        Passer à la vue liste
      </Link>
      <PlanSvg filtres={filtres} top3={top3} />
    </div>
  )
}
