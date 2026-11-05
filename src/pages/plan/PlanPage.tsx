import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { PastilleLigne } from '@/components/metier/PastilleLigne'
import { lignes } from '@/donnees'
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
    <div className="flex flex-col gap-5 px-6 py-8 md:px-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="m-0 font-display text-[40px] leading-[1.1] font-bold tracking-[-0.02em]">
            Le plan des métiers du numérique
          </h1>
          <p className="mt-2 mb-0 max-w-[760px] text-encre-douce">
            68 métiers sur 8 lignes, qui partent toutes de ta formation. Survole une station pour
            voir le métier, clique pour ouvrir sa fiche.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <EncartQuiz />
          <BasculeVue actif="graphe" />
        </div>
      </div>
      <Filtres />
      <Link
        to="/liste"
        className="sr-only focus:not-sr-only focus:self-start focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2"
      >
        Passer à la vue liste
      </Link>
      <PlanSvg filtres={filtres} top3={top3} />
      <div aria-label="Légende des lignes" role="group" className="flex flex-wrap gap-x-4 gap-y-2">
        {lignes.map((l) => (
          <PastilleLigne key={l.id} ligne={l.id} taille="sm" />
        ))}
      </div>
    </div>
  )
}
