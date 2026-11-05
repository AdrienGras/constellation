import { useEffect, useRef, type RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioCarte, RadioGroup } from '@/components/ui/radio-group'
import { questions } from '@/donnees'
import { useQuiz } from '@/etat/QuizContext'
import { usePageTitre } from '../usePageTitre'

const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F']

export function Question({
  index,
  pageDejaAffichee,
}: {
  index: number
  /** Vrai une fois la page montée : la question vient alors de remplacer un autre écran. */
  pageDejaAffichee?: RefObject<boolean>
}) {
  usePageTitre('Quiz')
  const { etat, repondre, allerA, terminer } = useQuiz()
  const q = questions[index]
  const total = questions.length
  const progression = `Question ${index + 1} sur ${total}`
  const derniere = index === total - 1
  const reponse = etat.reponses[q.id]
  const h1 = useRef<HTMLHeadingElement>(null)
  const precedent = useRef(index)

  // Montage après « Refaire le quiz » ou « Revenir aux questions » : le focus est retombé sur body.
  useEffect(() => {
    const actif = document.activeElement
    if (pageDejaAffichee?.current && (actif === null || actif === document.body))
      h1.current?.focus()
    // Au montage seulement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // La route ne change pas entre deux questions : le focus passe au titre à la main.
  useEffect(() => {
    if (precedent.current === index) return
    precedent.current = index
    h1.current?.focus()
  }, [index])

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-6 pt-6">
      <div className="flex flex-col gap-3">
        <p className="m-0 text-[15px] font-bold tracking-[0.06em] text-encre-douce uppercase">
          Quiz · environ 10 minutes
        </p>
        <Progress value={((index + 1) / total) * 100} aria-label={progression} />
        <p aria-hidden="true" className="m-0 text-[15px] text-encre-douce">
          {progression}
        </p>
        <p aria-live="polite" className="sr-only">
          {progression}
        </p>
      </div>
      <h1 ref={h1} tabIndex={-1} className="m-0 font-display text-[28px] leading-9 font-bold">
        {q.intitule}
      </h1>
      <RadioGroup
        value={reponse ?? ''}
        onValueChange={(rid) => repondre(q.id, rid)}
        aria-label="Réponses"
      >
        {q.reponses.map((r, i) => (
          <RadioCarte key={r.id} value={r.id} lettre={LETTRES[i]}>
            {r.texte}
          </RadioCarte>
        ))}
      </RadioGroup>
      <p className="m-0 text-[15px] leading-[22px] text-encre-douce">
        Il n’y a pas de bonne réponse : choisis ce qui te ressemble le plus, même de peu.
      </p>
      <div
        data-barre-quiz
        className="sticky bottom-0 -mx-6 flex flex-wrap items-center justify-between gap-3 border-t border-trait bg-fond px-6 py-4"
      >
        <Button variant="outline" disabled={index === 0} onClick={() => allerA(index - 1)}>
          ← Question précédente
        </Button>
        <Button disabled={!reponse} onClick={() => (derniere ? terminer() : allerA(index + 1))}>
          {derniere ? 'Voir mon résultat' : 'Question suivante'}
        </Button>
      </div>
    </div>
  )
}
