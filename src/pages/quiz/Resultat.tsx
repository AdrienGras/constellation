import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { PastilleLigne } from '@/components/metier/PastilleLigne'
import { metierParId, stationsDeLigne } from '@/donnees'
import type { LigneId } from '@/donnees/types'
import { useQuiz } from '@/etat/QuizContext'
import { stockageDisponible } from '@/logique/stockage'
import { usePageTitre } from '../usePageTitre'
import { categoriesDeLigne } from './categories'

// Export imposé par le plan (tâche 14).
/** Titres des `n` premiers métiers d’entrée de la ligne. */
// eslint-disable-next-line react-refresh/only-export-components
export function exemplesDeLigne(id: LigneId, n = 3): string[] {
  return stationsDeLigne(id)
    .map((s) => metierParId(s))
    .filter((m) => m?.type === 'entree')
    .slice(0, n)
    .map((m) => m!.titre)
}

export function Resultat({ top3 }: { top3: LigneId[] }) {
  usePageTitre('Tes 3 lignes de départ')
  const { refaire } = useQuiz()
  const h1 = useRef<HTMLHeadingElement>(null)
  // Le bouton cliqué a disparu avec l’écran précédent : le focus va au titre.
  useEffect(() => h1.current?.focus(), [])
  const gardé = stockageDisponible()

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-6 py-8">
      <p className="m-0 text-[15px] font-bold tracking-[0.06em] text-encre-douce uppercase">
        Résultat du quiz
      </p>
      <h1 ref={h1} tabIndex={-1} className="m-0 font-display text-[32px] leading-10 font-bold">
        Tes 3 lignes de départ
      </h1>
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {top3.map((id, i) => (
          <li key={id} className="flex flex-col gap-2 rounded-md bg-surface p-5 shadow-carte">
            <PastilleLigne ligne={id} taille="lg" rang={(i + 1) as 1 | 2 | 3} />
            <p className="m-0 text-encre-douce">{categoriesDeLigne(id)}</p>
            <p className="m-0 text-[16px] leading-6">
              <strong>Par exemple :</strong> {exemplesDeLigne(id).join(', ')}
            </p>
          </li>
        ))}
      </ol>
      <p className="m-0 text-[17px] leading-[26px]">
        Un point de départ, pas un verdict. Ce matin, tu vas justement explorer ailleurs : 3
        métiers hors de ces lignes.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/">Voir mes lignes sur le plan</Link>
        </Button>
        <Button variant="secondary" onClick={refaire}>
          Refaire le quiz
        </Button>
      </div>
      <div className="flex flex-col gap-1 text-[15px] leading-[22px] text-encre-douce">
        <p className="m-0">Tu peux refaire le quiz quand tu veux ; seul le dernier résultat compte.</p>
        <p className="m-0">
          {gardé
            ? 'Résultat gardé dans ce navigateur.'
            : 'Résultat perdu en fermant l’onglet : ton navigateur ne garde rien.'}
        </p>
      </div>
    </div>
  )
}
