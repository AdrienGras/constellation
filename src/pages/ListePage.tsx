import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { BadgeType } from '@/components/metier/BadgeType'
import { PastilleLigne } from '@/components/metier/PastilleLigne'
import { Champ } from '@/components/Champ'
import { Input } from '@/components/ui/input'
import { categorieParId, lignes, metierParId, metiers, stationsDeLigne } from '@/donnees'
import type { Ligne, Metier } from '@/donnees/types'
import { useFiltres } from '@/etat/FiltresContext'
import { useQuiz } from '@/etat/QuizContext'
import { correspondFiltre } from '@/logique/filtres'
import { normaliser } from '@/logique/texte'
import { EncartQuiz } from './plan/EncartQuiz'
import { BasculeVue, Filtres } from './plan/Filtres'
import { usePageTitre } from './usePageTitre'

// Ouvert à partir de 768 px, replié en dessous ; sans matchMedia, ouvert.
function ouvertParDefaut(): boolean {
  if (typeof window.matchMedia !== 'function') return true
  return window.matchMedia('(min-width: 768px)').matches
}

interface GroupeCategorie {
  id: string
  libelle: string
  metiers: Metier[]
}

function groupesDeLigne(ligne: Ligne, visibles: Set<string>): GroupeCategorie[] {
  const dansOrdre = stationsDeLigne(ligne.id).flatMap((id) => {
    const m = metierParId(id)
    return m && visibles.has(m.id) ? [m] : []
  })
  return ligne.categories.flatMap((c) => {
    const liste = dansOrdre.filter((m) => m.categorie === c)
    return liste.length > 0 ? [{ id: c, libelle: categorieParId(c)?.libelle ?? c, metiers: liste }] : []
  })
}

export function ListePage() {
  usePageTitre('Liste des métiers')
  const { filtres } = useFiltres()
  const { top3 } = useQuiz()
  const [recherche, setRecherche] = useState('')
  const [ouvert] = useState(ouvertParDefaut)
  const idPrefixe = useId()

  const requete = normaliser(recherche.trim())
  const visibles = useMemo(
    () =>
      new Set(
        metiers
          .filter((m) => correspondFiltre(m, filtres) && normaliser(m.titre).includes(requete))
          .map((m) => m.id),
      ),
    [filtres, requete],
  )
  const n = visibles.size
  const compteur = `${n} ${n > 1 ? 'métiers affichés' : 'métier affiché'} sur ${metiers.length}`

  return (
    <div className="flex flex-col gap-5 px-6 pt-8 pb-10 md:px-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="m-0 text-[13px] leading-5 font-bold tracking-[0.06em] text-encre-douce uppercase">
            Accueil · vue liste
          </p>
          <h1 className="titre-1 mt-1 mb-0">Les 68 métiers, ligne par ligne</h1>
          <p className="mt-2 mb-0 max-w-[760px] text-encre-douce">
            La même chose que le plan, au clavier ou au lecteur d’écran. Chaque nom ouvre la fiche
            du métier.
          </p>
        </div>
        <div className="flex flex-none flex-wrap items-center gap-4">
          <EncartQuiz />
          <BasculeVue actif="liste" />
        </div>
      </div>
      <Filtres />
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <div className="w-[360px] max-w-full">
          <Champ label="Chercher un métier">
            {(props) => (
              <Input
                {...props}
                type="search"
                autoComplete="off"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            )}
          </Champ>
        </div>
        <p aria-live="polite" className="m-0 pb-2.5 text-[15px] leading-5 text-encre-douce">
          {compteur}
        </p>
      </div>
      {n === 0 && requete ? (
        <p className="m-0">Aucun métier ne correspond à ta recherche.</p>
      ) : null}
      <div className="flex flex-col gap-3">
        {lignes.map((ligne) => {
          const groupes = groupesDeLigne(ligne, visibles)
          if (groupes.length === 0) return null
          const compte = groupes.reduce((s, g) => s + g.metiers.length, 0)
          const rang = top3 ? top3.indexOf(ligne.id) : -1
          const idTitre = `${idPrefixe}-${ligne.id}`
          return (
            <details
              key={`${ligne.id}-${requete ? 'recherche' : 'repos'}`}
              open={requete ? true : ouvert}
              aria-labelledby={idTitre}
              className="rounded-md bg-surface shadow-carte"
            >
              <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                <h2 id={idTitre} className="m-0 text-base">
                  <PastilleLigne
                    ligne={ligne.id}
                    rang={rang >= 0 ? ((rang + 1) as 1 | 2 | 3) : undefined}
                  />
                </h2>
                <span className="text-[15px] text-encre-douce">
                  {compte} {compte > 1 ? 'métiers' : 'métier'}
                </span>
                {top3 && rang < 0 ? (
                  <span className="text-[15px] text-encre-douce">
                    Hors de ton top 3 : zone d’exploration
                  </span>
                ) : null}
              </summary>
              <div className="flex flex-col gap-4 px-5 pb-5">
                {groupes.map((g) => (
                  <div key={g.id}>
                    <h3 className="m-0 mb-2 text-[15px] leading-5 font-bold text-encre-douce">
                      {g.libelle}
                    </h3>
                    <ul className="m-0 flex list-none flex-col gap-1 p-0">
                      {g.metiers.map((m) => (
                        <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <Link
                            to={`/fiche/${m.id}`}
                            className="inline-flex min-h-11 items-center underline underline-offset-2"
                          >
                            {m.titre}
                          </Link>
                          <BadgeType type={m.type} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
