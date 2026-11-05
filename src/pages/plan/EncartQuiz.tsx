import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { PastilleLigne } from '@/components/metier/PastilleLigne'
import { lignes, plan } from '@/donnees'
import { useQuiz } from '@/etat/QuizContext'

const CARTE = 'rounded-md bg-surface shadow-carte'
const CARTE_RANGEE = `${CARTE} flex flex-wrap items-center gap-4 py-3 pr-3 pl-5`

// État du quiz sur l’écran d’accueil : invitation, départage à finir, ou résultat.
export function EncartQuiz() {
  const { etat, top3, refaire } = useQuiz()
  const navigate = useNavigate()

  if (top3) {
    const exploration = lignes.length - top3.length
    const metiers = Object.values(plan.stations).filter((s) => !top3.includes(s.ligne)).length
    return (
      <section aria-label="Ton résultat de quiz" className={`${CARTE} flex max-w-[780px] flex-col gap-3 p-5`}>
        <h2 className="m-0 font-display text-2xl font-bold">Tes 3 lignes de départ sont allumées</h2>
        <p className="m-0 text-encre-douce">
          C’est un point de départ, pas un verdict. Ce matin, choisis 3 métiers dans ta zone
          d’exploration : les lignes en pointillés ({exploration} lignes, {metiers} métiers).
        </p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          {top3.map((id, i) => (
            <PastilleLigne key={id} ligne={id} rang={(i + 1) as 1 | 2 | 3} />
          ))}
        </div>
        <div>
          <Button
            variant="secondary"
            onClick={() => {
              refaire()
              navigate('/quiz')
            }}
          >
            Refaire le quiz
          </Button>
        </div>
      </section>
    )
  }

  if (etat.termine) {
    return (
      <section
        aria-label="Ton quiz"
        className={CARTE_RANGEE}
      >
        <p className="m-0 text-[15px] leading-[22px] font-bold">Ton quiz attend un dernier choix.</p>
        <Button asChild>
          <Link to="/quiz">Finir le quiz</Link>
        </Button>
      </section>
    )
  }

  return (
    <section
      aria-label="Ton quiz"
      className={CARTE_RANGEE}
    >
      <p className="m-0 text-[15px] leading-[22px]">
        <strong>Par où commencer ?</strong>
        <br />
        <span className="text-encre-douce">Le quiz allume tes 3 lignes de départ.</span>
      </p>
      <Button asChild>
        <Link to="/quiz">Commencer le quiz</Link>
      </Button>
    </section>
  )
}
