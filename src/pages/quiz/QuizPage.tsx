import { useEffect, useRef } from 'react'
import { useQuiz } from '@/etat/QuizContext'
import { Departage } from './Departage'
import { Question } from './Question'
import { Resultat } from './Resultat'

export function QuizPage() {
  const { etat, top3 } = useQuiz()
  // Faux jusqu’à la fin du premier montage (le focus est alors géré par Layout), vrai ensuite :
  // un changement d’écran dans la page démonte le bouton cliqué. Lu par les effets des écrans.
  const dejaAffichee = useRef(false)
  useEffect(() => {
    dejaAffichee.current = true
  }, [])
  if (!etat.termine) return <Question index={etat.question} pageDejaAffichee={dejaAffichee} />
  if (top3 === null) return <Departage />
  return <Resultat top3={top3} />
}
