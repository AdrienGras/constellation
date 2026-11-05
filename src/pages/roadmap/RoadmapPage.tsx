import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TriangleAlert } from 'lucide-react'
import { ligneDuMetier, metierParId } from '@/donnees'
import { useRoadmap } from '@/etat/RoadmapContext'
import { ANNEES, type Annee as AnneeId, type Item } from '@/logique/roadmap'
import { usePageTitre } from '../usePageTitre'
import { ActionsRoadmap } from './ActionsRoadmap'
import { Annee } from './Annee'
import { ChoixCible } from './ChoixCible'
import { Competences } from './Competences'
import { DialogItem } from './DialogItem'
import { useRetourFocus } from './useRetourFocus'
import '@/styles/impression.css'

type Edition = { annee: AnneeId; item?: Item; choixAnnee?: boolean }
type Suppression = { annee: AnneeId; item: Item }

export function RoadmapPage() {
  usePageTitre('Ma roadmap')
  const { etat, cibleOubliee, ajouter, modifier, supprimer, deplacer, choisirCible } = useRoadmap()
  const [edition, setEdition] = useState<Edition | null>(null)
  const [suppression, setSuppression] = useState<Suppression | null>(null)
  const [changement, setChangement] = useState(false)
  const titre = useRef<HTMLHeadingElement>(null)
  const [fermetures, setFermetures] = useState(0)

  const dateImpression = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const metier = etat.cible ? metierParId(etat.cible) : undefined
  const couleur = metier ? `var(--ligne-${ligneDuMetier(metier)})` : 'var(--trait-fort)'

  // La fermeture du choix fait disparaître la liste qui avait le focus : on le ramène sur le titre,
  // même si le métier choisi est celui qui était déjà visé.
  useEffect(() => {
    if (fermetures > 0) titre.current?.focus()
  }, [fermetures])

  return (
    <div data-page-roadmap className="flex flex-col gap-8 px-6 pt-6 pb-16 lg:px-12">
      <div data-impression className="hidden">
        <p>Ma roadmap 2027 → 2031 · {metier ? metier.titre : 'métier visé : n.d.'}</p>
        <p>Imprimée le {dateImpression}</p>
      </div>
      <header data-ecran className="flex flex-col gap-3">
        <p className="etiquette m-0">Ma roadmap · 2027 → 2031</p>
        <h1 ref={titre} tabIndex={-1} className="titre-affiche m-0">
          {metier ? `Cap sur ${metier.titre}` : 'Quel métier vises-tu ?'}
        </h1>
        {metier ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="m-0 text-encre-douce">Le métier visé peut changer.</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setChangement((c) => !c)}>
              Changer
            </Button>
          </div>
        ) : (
          <p className="chapo m-0 max-w-[780px]">
            Choisis-le parmi les 68 métiers. Ce matin t’a peut-être fait changer d’avis : c’est prévu, tu
            pourras en changer à tout moment.
          </p>
        )}
        {cibleOubliee ? (
          <Alert variant="attention" className="max-w-[780px]">
            <TriangleAlert aria-hidden="true" />
            <AlertDescription>
              Le métier visé de ta roadmap n’existe plus dans constellation : choisis-en un autre. Tes
              éléments sont conservés.
            </AlertDescription>
          </Alert>
        ) : null}
        {!metier || changement ? (
          <ChoixCible
            cible={etat.cible}
            onChoisir={(id) => {
              choisirCible(id)
              setChangement(false)
              setFermetures((n) => n + 1)
            }}
          />
        ) : null}
      </header>

      <ActionsRoadmap onAjouter={() => setEdition({ annee: 2027, choixAnnee: true })} />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="relative flex min-w-0 flex-col lg:flex-[2]">
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[14px] w-1 rounded-full"
            style={{ background: couleur }}
          />
          {ANNEES.map((an) => (
            <Annee
              key={an}
              annee={an}
              items={etat.annees[`${an}`]}
              couleur={couleur}
              onAjouter={() => setEdition({ annee: an })}
              onDeplacer={(de, vers) => deplacer(an, de, vers)}
              onModifier={(item) => setEdition({ annee: an, item })}
              onSupprimer={(item) => setSuppression({ annee: an, item })}
            />
          ))}
        </div>
        <div className="lg:flex-1">
          <Competences cible={etat.cible} />
        </div>
      </div>

      {edition ? (
        <DialogItem
          annee={edition.annee}
          item={edition.item}
          choixAnnee={edition.choixAnnee}
          onFermer={() => setEdition(null)}
          onEnregistrer={(b, annee) => {
            if (edition.item) modifier(edition.annee, edition.item.id, b)
            else ajouter(annee, b)
            setEdition(null)
          }}
        />
      ) : null}

      {suppression ? (
        <DialogSuppression
          suppression={suppression}
          onConfirmer={() => {
            supprimer(suppression.annee, suppression.item.id)
            setSuppression(null)
          }}
          onFermer={() => setSuppression(null)}
        />
      ) : null}
    </div>
  )
}

function DialogSuppression({
  suppression,
  onConfirmer,
  onFermer,
}: {
  suppression: Suppression
  onConfirmer: () => void
  onFermer: () => void
}) {
  const retourFocus = useRetourFocus(() =>
    document.querySelector<HTMLElement>(`button[data-ajouter="${suppression.annee}"]`),
  )
  return (
    <Dialog open onOpenChange={(ouvert) => !ouvert && onFermer()}>
      <DialogContent onCloseAutoFocus={retourFocus}>
        <DialogHeader>
          <DialogTitle>{`Supprimer « ${suppression.item.titre} » ?`}</DialogTitle>
          <DialogDescription>Cet élément sera retiré de {suppression.annee}.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onFermer}>
            Annuler
          </Button>
          <Button type="button" onClick={onConfirmer}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
