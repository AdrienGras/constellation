import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useFiltres } from '@/etat/FiltresContext'
import { useQuiz } from '@/etat/QuizContext'
import { usePageTitre } from '../usePageTitre'
import { EncartQuiz } from './EncartQuiz'
import { BasculeVue, Filtres } from './Filtres'
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
      <div className="flex flex-wrap items-end justify-between gap-6 pt-8 pb-5 lg:flex-nowrap">
        <div>
          <p className="m-0 text-[13px] leading-5 font-bold tracking-[0.06em] text-encre-douce uppercase">
            Accueil
          </p>
          <h1 className="titre-1 mt-1 mb-0">Le plan des métiers du numérique</h1>
          <p className="mt-2 mb-0 max-w-[760px] text-encre-douce">
            68 métiers sur 8 lignes, qui partent toutes de ta formation. Survole une station pour
            voir le métier, clique pour ouvrir sa fiche.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-4 md:w-auto md:flex-none">
          <EncartQuiz />
          <BasculeVue actif="graphe" />
        </div>
      </div>
      <div className="pb-4">
        <Filtres />
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
