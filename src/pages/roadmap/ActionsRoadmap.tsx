import { Check, Download, Plus, Printer, TriangleAlert, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { metiers } from '@/donnees'
import { useRoadmap } from '@/etat/RoadmapContext'
import { exporterRoadmap, importerRoadmap } from '@/logique/echange'
import { estVide, nbItems, type EtatRoadmap } from '@/logique/roadmap'
import { stockageDisponible } from '@/logique/stockage'
import { useRetourFocus } from './useRetourFocus'

const IDS_METIERS: ReadonlySet<string> = new Set(metiers.map((m) => m.id))

const elements = (n: number) => `${n} élément${n > 1 ? 's' : ''}`

function lireTexte(fichier: File): Promise<string> {
  if (typeof fichier.text === 'function') return fichier.text()
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader()
    lecteur.onload = () => resolve(String(lecteur.result))
    lecteur.onerror = () => reject(lecteur.error)
    lecteur.readAsText(fichier)
  })
}

export function ActionsRoadmap({ onAjouter }: { onAjouter: () => void }) {
  const { etat, enregistre, remplacer } = useRoadmap()
  const [disponible] = useState(stockageDisponible)
  const [erreur, setErreur] = useState<string | null>(null)
  const [succes, setSucces] = useState(false)
  const [cibleInconnue, setCibleInconnue] = useState(false)
  const [enAttente, setEnAttente] = useState<EtatRoadmap | null>(null)
  const entree = useRef<HTMLInputElement>(null)

  function exporter() {
    const { nom, contenu } = exporterRoadmap(etat, new Date())
    const url = URL.createObjectURL(new Blob([contenu], { type: 'application/json' }))
    const lien = document.createElement('a')
    lien.href = url
    lien.download = nom
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    // Le navigateur lit le blob après le clic : on ne le révoque qu’au tour suivant.
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  function appliquer(roadmap: EtatRoadmap, inconnue: boolean) {
    remplacer(roadmap)
    setCibleInconnue(inconnue)
    setSucces(true)
  }

  async function importer(e: ChangeEvent<HTMLInputElement>) {
    const champ = e.target
    const fichier = champ.files?.[0]
    if (!fichier) return
    setErreur(null)
    setSucces(false)
    setCibleInconnue(false)
    let texte: string
    try {
      texte = await lireTexte(fichier)
    } catch {
      setErreur('Ce fichier n’a pas pu être lu.')
      return
    } finally {
      champ.value = ''
    }
    const resultat = importerRoadmap(texte, IDS_METIERS)
    if (!resultat.ok) setErreur(resultat.erreur)
    else if (estVide(etat)) appliquer(resultat.roadmap, resultat.cibleInconnue)
    else {
      setCibleInconnue(resultat.cibleInconnue)
      setEnAttente(resultat.roadmap)
    }
  }

  function confirmer() {
    if (!enAttente) return
    appliquer(enAttente, cibleInconnue)
    setEnAttente(null)
  }

  const garde = enregistre && disponible

  return (
    <div data-actions className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={onAjouter}>
          <Plus aria-hidden="true" />
          Ajouter
        </Button>
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          Imprimer en PDF
        </Button>
        <Button type="button" variant="outline" onClick={exporter}>
          <Download aria-hidden="true" />
          Exporter en JSON
        </Button>
        <Button type="button" variant="outline" onClick={() => entree.current?.click()}>
          <Upload aria-hidden="true" />
          Importer un JSON
        </Button>
        <input
          ref={entree}
          type="file"
          accept="application/json,.json"
          hidden
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => void importer(e)}
        />
      </div>
      <p
        aria-live="polite"
        className="m-0 inline-flex items-center gap-2 text-[15px] leading-5 text-encre-douce"
      >
        {garde ? (
          <>
            <Check aria-hidden="true" className="size-4" />
            Enregistré dans ce navigateur
          </>
        ) : (
          <>
            <TriangleAlert aria-hidden="true" className="size-4" />
            Non enregistré : ton navigateur ne garde rien. Pense à exporter.
          </>
        )}
      </p>
      <p role="status" className="sr-only">
        {succes ? 'Roadmap importée.' : ''}
      </p>
      {erreur ? (
        <Alert variant="attention" role="alert">
          <TriangleAlert aria-hidden="true" />
          <AlertDescription>{erreur}</AlertDescription>
        </Alert>
      ) : null}
      {succes && cibleInconnue && etat.cible === null ? (
        <Alert variant="attention">
          <TriangleAlert aria-hidden="true" />
          <AlertDescription>
            Le métier visé dans ce fichier n’existe plus dans constellation : choisis-en un autre.
          </AlertDescription>
        </Alert>
      ) : null}
      {enAttente ? (
        <DialogRemplacer
          fichier={enAttente}
          actuelle={etat}
          onConfirmer={confirmer}
          onFermer={() => setEnAttente(null)}
        />
      ) : null}
    </div>
  )
}

function DialogRemplacer({
  fichier,
  actuelle,
  onConfirmer,
  onFermer,
}: {
  fichier: EtatRoadmap
  actuelle: EtatRoadmap
  onConfirmer: () => void
  onFermer: () => void
}) {
  const retourFocus = useRetourFocus()
  return (
    <Dialog open onOpenChange={(ouvert) => !ouvert && onFermer()}>
      <DialogContent onCloseAutoFocus={retourFocus}>
        <DialogHeader>
          <DialogTitle>Remplacer ta roadmap ?</DialogTitle>
          <DialogDescription>
            Le fichier contient {elements(nbItems(fichier))}. Ta roadmap actuelle ({elements(nbItems(actuelle))})
            sera remplacée.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onFermer}>
            Annuler
          </Button>
          <Button type="button" onClick={onConfirmer}>
            Remplacer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
