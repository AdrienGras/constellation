import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PastilleLigne } from '@/components/metier/PastilleLigne'
import { RadioCarte, RadioGroup } from '@/components/ui/radio-group'
import type { LigneId } from '@/donnees/types'
import { useQuiz } from '@/etat/QuizContext'
import { usePageTitre } from '../usePageTitre'
import { categoriesDeLigne } from './categories'
import { exemplesDeLigne } from './Resultat'

function Details({ id }: { id: LigneId }) {
  return (
    <span className="flex flex-col gap-1">
      <PastilleLigne ligne={id} />
      <span className="text-[16px] leading-6 text-encre-douce">{categoriesDeLigne(id)}</span>
      <span className="text-[16px] leading-6">
        <strong>Par exemple :</strong> {exemplesDeLigne(id).join(', ')}
      </span>
    </span>
  )
}

export function Departage() {
  usePageTitre('Quiz')
  const { classement, etat, choisirDepartage, rouvrir } = useQuiz()
  const candidats = classement?.aDepartager ?? []
  const places = classement?.places ?? 1
  const [choix, setChoix] = useState<LigneId[]>(() =>
    etat.departage.filter((id) => candidats.includes(id)),
  )
  const h1 = useRef<HTMLHeadingElement>(null)
  // Le bouton cliqué a disparu avec l’écran précédent : le focus va au titre.
  useEffect(() => h1.current?.focus(), [])
  const complet = choix.length === places

  const bascule = (id: LigneId) =>
    setChoix((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-6 py-8">
      <h1 ref={h1} tabIndex={-1} className="m-0 font-display text-[28px] leading-9 font-bold">
        Une dernière question
      </h1>
      <p className="m-0 text-[17px] leading-[26px]">
        {places === 1
          ? 'Ces lignes sont à égalité pour ta 3e place : laquelle te parle le plus ?'
          : `Ces lignes sont à égalité pour tes ${places} dernières places : choisis-en ${places}.`}
      </p>
      {places === 1 ? (
        <RadioGroup
          value={choix[0] ?? ''}
          onValueChange={(v) => setChoix([v as LigneId])}
          aria-label="Lignes à égalité"
        >
          {candidats.map((id) => (
            <RadioCarte key={id} value={id} className="min-h-11">
              <Details id={id} />
            </RadioCarte>
          ))}
        </RadioGroup>
      ) : (
        <div className="flex flex-col gap-3">
          <div role="group" aria-label="Lignes à égalité" className="flex flex-col gap-3">
            {candidats.map((id) => {
              const coche = choix.includes(id)
              return (
                <label
                  key={id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-2 border-trait bg-surface px-6 py-4 text-[18px] leading-[26px] hover:border-trait-fort has-[:checked]:border-primaire has-[:checked]:shadow-[inset_0_0_0_1px_var(--primaire)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]"
                >
                  <input
                    type="checkbox"
                    checked={coche}
                    disabled={!coche && complet}
                    onChange={() => bascule(id)}
                    className="size-[22px] shrink-0 cursor-pointer accent-[var(--primaire)] focus-visible:outline-none disabled:cursor-not-allowed"
                  />
                  <Details id={id} />
                </label>
              )
            })}
          </div>
          <p aria-live="polite" className="m-0 text-[15px] text-encre-douce">
            {`${choix.length} sur ${places} choisies`}
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={rouvrir}>
          ← Revenir aux questions
        </Button>
        <Button disabled={!complet} onClick={() => choisirDepartage(choix)}>
          Voir mon résultat
        </Button>
      </div>
    </div>
  )
}
