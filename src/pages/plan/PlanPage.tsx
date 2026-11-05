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
    <div className="flex flex-col px-6 pb-6 md:px-12">
      <div className="pt-4 pb-2">
        <EnTeteAccueil
          titre="Le plan des métiers du numérique"
          chapeau="68 métiers sur 8 lignes. Survole une station pour voir le métier, clique pour ouvrir sa fiche."
          vue="graphe"
        />
      </div>
      <Link
        to="/liste"
        className="sr-only focus:not-sr-only focus:self-start focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2"
      >
        Passer à la vue liste
      </Link>
      <PlanSvg filtres={filtres} top3={top3} />
    </div>
  )
}
