import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { categorieParId, ligneDuMetier, metierParId, titresDepuis } from '../donnees'
import type { Metier } from '../donnees/types'
import { BadgeFiabilite } from '../components/metier/BadgeFiabilite'
import { BadgeType } from '../components/metier/BadgeType'
import { CartoucheApec } from '../components/metier/CartoucheApec'
import { CartoucheSilkhom } from '../components/metier/CartoucheSilkhom'
import { PastilleLigne } from '../components/metier/PastilleLigne'
import { Alert, AlertTitle } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { useRoadmap } from '../etat/RoadmapContext'
import { usePageTitre } from './usePageTitre'

const lienMetier = 'font-bold text-encre underline underline-offset-[3px] decoration-trait-fort'

function ListeLiens({ titre, ids }: { titre: string; ids: string[] }) {
  const metiers = ids.flatMap((id) => {
    const m = metierParId(id)
    return m ? [m] : []
  })
  if (metiers.length === 0) return null
  return (
    <div>
      <h2 className="etiquette mt-0 mb-1.5 text-encre-douce">{titre}</h2>
      <ul className="m-0 list-none p-0">
        {metiers.map((m) => (
          <li key={m.id} className="flex min-h-11 items-center gap-2.5">
            <PastilleLigne ligne={ligneDuMetier(m)} taille="sm" sansNom />
            <Link to={`/fiche/${m.id}`} className={lienMetier}>
              {m.titre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Introuvable() {
  usePageTitre('Métier introuvable')
  return (
    <div className="flex max-w-[900px] flex-col items-start gap-4 px-6 pt-10 md:px-12 pb-16">
      <h1 className="titre-1 m-0">Métier introuvable</h1>
      <p className="m-0">Ce métier n’existe pas ou plus dans constellation.</p>
      <Button asChild>
        <Link to="/">Revenir au plan</Link>
      </Button>
    </div>
  )
}

export function FichePage() {
  const { id = '' } = useParams()
  const metier = metierParId(id)
  if (!metier) return <Introuvable />
  return <Fiche metier={metier} />
}

function Fiche({ metier }: { metier: Metier }) {
  usePageTitre(metier.titre)
  const navigate = useNavigate()
  const { etat, choisirCible } = useRoadmap()
  const [confirmation, setConfirmation] = useState(false)
  const ligne = ligneDuMetier(metier)
  const categorie = categorieParId(metier.categorie)
  const cibleActuelle = etat.cible ? metierParId(etat.cible) : undefined

  function viser() {
    choisirCible(metier.id)
    navigate('/roadmap')
  }

  function demanderViser() {
    if (!cibleActuelle || cibleActuelle.id === metier.id) viser()
    else setConfirmation(true)
  }

  return (
    <div className="flex flex-col gap-8 px-6 pt-6 pb-16 lg:px-12">
      <Link to="/" className="self-start text-[16px] font-bold text-encre-douce no-underline">
        ← Retour au plan
      </Link>
      <header className="flex max-w-[900px] flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <PastilleLigne ligne={ligne} />
          <span aria-hidden="true" className="text-encre-douce">
            ·
          </span>
          <span className="etiquette" style={{ color: `var(--ligne-${ligne}-encre)` }}>
            {categorie?.libelle}
          </span>
        </div>
        <h1 className="titre-affiche m-0">{metier.titre}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <BadgeType type={metier.type} />
          <BadgeFiabilite niveau={metier.fiabilite} note={metier.fiabilite_note} />
          <Badge variant="outline">{metier.rome ? `ROME ${metier.rome}` : 'ROME n.d.'}</Badge>
        </div>
        <p className="chapo mt-1 mb-0 max-w-[780px]">{metier.brief}</p>
      </header>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-col gap-7 lg:flex-[2]">
          <section>
            <h2 className="titre-2 mt-0 mb-2">Missions</h2>
            <p className="m-0 max-w-[720px]">{metier.missions}</p>
          </section>
          <section>
            <h2 className="titre-2 mt-0 mb-3">Compétences</h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {metier.competences.map((c) => (
                <li key={c} className="max-w-full min-w-0">
                  <Badge variant="outline" className="max-w-full whitespace-normal">
                    {c}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="titre-2 mt-0 mb-2">À éviter si</h2>
            <Alert variant="neutre">
              <AlertTitle>{metier.a_eviter_si}</AlertTitle>
            </Alert>
            <p className="mt-2 mb-0 text-[16px] text-encre-douce">
              Un repère pour réfléchir, pas une règle.
            </p>
          </section>
          <section>
            <h2 className="titre-2 mt-0 mb-2">Parcours</h2>
            <p className="m-0 max-w-[720px]">{metier.parcours}</p>
          </section>
        </div>

        <aside
          aria-label="Repères"
          className="flex min-w-0 flex-col gap-5 rounded-md bg-surface p-6 shadow-carte lg:flex-1"
        >
          {metier.depuis.length > 0 ? (
            <ListeLiens titre="On y arrive depuis" ids={metier.depuis} />
          ) : null}
          <ListeLiens titre="Métiers voisins, même catégorie" ids={metier.voisins_meme_categorie} />
          <ListeLiens titre="Voisins dans d’autres lignes" ids={metier.voisins_autres_categories} />
          {metier.roadmap_url ? (
            <Button
              asChild
              variant="outline"
              className="h-auto min-h-11 max-w-full self-start py-2 whitespace-normal"
            >
              <a href={metier.roadmap_url} target="_blank" rel="noopener noreferrer">
                Voir la roadmap sur roadmap.sh ↗<span className="sr-only"> (nouvel onglet)</span>
              </a>
            </Button>
          ) : null}
          <Button
            className="h-auto min-h-11 max-w-full self-start py-2 whitespace-normal"
            onClick={demanderViser}
          >
            Viser ce métier dans ma roadmap
          </Button>
          <div className="flex flex-col gap-1 border-t border-trait pt-3 text-[16px] leading-6 text-encre-douce">
            <p className="m-0">
              {metier.source_texte === 'cigref'
                ? 'Texte : Cigref, nomenclature des profils métiers du SI (2025).'
                : 'Texte : Rédaction CODA, relue par Adrien Gras.'}
            </p>
            {metier.fiabilite_note ? (
              <p className="m-0">Fiabilité : {metier.fiabilite_note}.</p>
            ) : null}
          </div>
        </aside>
      </div>

      <section aria-labelledby="titre-salaires" className="flex flex-col gap-4">
        <h2 id="titre-salaires" className="titre-2 m-0">
          Salaires cibles
        </h2>
        <p className="m-0 max-w-[820px] text-encre-douce">
          Ce que tu peux viser après quelques années, pas un salaire de sortie d’études. Les deux
          sources ci-dessous ne mesurent pas la même chose : ne les compare pas entre elles.
        </p>
        <CartoucheSilkhom
          silkhom={metier.salaires.silkhom}
          type={metier.type}
          depuisTitres={titresDepuis(metier)}
          ligne={ligne}
          raisonAbsence={metier.fiabilite_note}
        />
        <p className="m-0 max-w-[820px] text-encre-douce">
          Ces deux sources ne mesurent pas la même chose : ne les compare pas entre elles.
        </p>
        <CartoucheApec apec={metier.salaires.apec} raisonAbsence={metier.fiabilite_note} />
      </section>

      <Dialog open={confirmation} onOpenChange={setConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer de métier visé ?</DialogTitle>
            <DialogDescription>
              Ta roadmap vise aujourd’hui {cibleActuelle?.titre}. Tes éléments restent en place.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmation(false)}>
              Annuler
            </Button>
            <Button onClick={viser}>Viser {metier.titre}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
