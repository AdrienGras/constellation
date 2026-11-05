import { useRef, useState, type FormEvent } from 'react'
import { Champ } from '@/components/Champ'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input, styleChamp } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useRetourFocus } from './useRetourFocus'
import { ANNEES, validerBrouillon, type Annee, type Brouillon, type Item, type TypeItem } from '@/logique/roadmap'

const TYPES: { valeur: TypeItem; libelle: string }[] = [
  { valeur: 'projet', libelle: 'Projet à réaliser' },
  { valeur: 'notion', libelle: 'Notion à apprendre' },
]

/** Monté uniquement quand il est ouvert : son état repart de zéro à chaque ouverture. */
export function DialogItem({
  annee,
  item,
  choixAnnee = false,
  onEnregistrer,
  onFermer,
}: {
  annee: Annee
  item?: Item
  /** Ouvert depuis la barre d’actions : l’année se choisit dans le formulaire au lieu d’être imposée. */
  choixAnnee?: boolean
  onEnregistrer: (b: Brouillon, annee: Annee) => void
  onFermer: () => void
}) {
  const [anneeChoisie, setAnneeChoisie] = useState<Annee>(annee)
  const [type, setType] = useState<TypeItem>(item?.type ?? 'projet')
  const [titre, setTitre] = useState(item?.titre ?? '')
  const [url, setUrl] = useState(item?.url ?? '')
  const [note, setNote] = useState(item?.note ?? '')
  const [erreurs, setErreurs] = useState<{ titre?: string; url?: string }>({})
  const refTitre = useRef<HTMLInputElement>(null)
  const refUrl = useRef<HTMLInputElement>(null)
  const retourFocus = useRetourFocus()

  function soumettre(e: FormEvent) {
    e.preventDefault()
    const brouillon: Brouillon = { type, titre: titre.trim(), url: url.trim(), note: note.trim() }
    const trouvees = validerBrouillon(brouillon)
    setErreurs(trouvees)
    if (trouvees.titre) refTitre.current?.focus()
    else if (trouvees.url) refUrl.current?.focus()
    else onEnregistrer(brouillon, anneeChoisie)
  }

  return (
    <Dialog open onOpenChange={(ouvert) => !ouvert && onFermer()}>
      <DialogContent aria-describedby={undefined} onCloseAutoFocus={retourFocus}>
        <DialogHeader>
          <DialogTitle>
            {item ? 'Modifier l’élément' : choixAnnee ? 'Ajouter un élément' : `Ajouter à ${annee}`}
          </DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={soumettre} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span id="type-item" className="text-[16px] leading-5 font-bold">
              Type
            </span>
            <RadioGroup
              aria-labelledby="type-item"
              value={type}
              onValueChange={(v) => setType(v as TypeItem)}
            >
              {TYPES.map(({ valeur, libelle }) => (
                <label key={valeur} className="flex min-h-11 cursor-pointer items-center gap-3">
                  <RadioGroupItem value={valeur} />
                  {libelle}
                </label>
              ))}
            </RadioGroup>
          </div>
          {choixAnnee ? (
            <Champ label="Année">
              {(p) => (
                <select
                  {...p}
                  className={styleChamp}
                  value={anneeChoisie}
                  onChange={(e) => setAnneeChoisie(Number(e.target.value) as Annee)}
                >
                  {ANNEES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              )}
            </Champ>
          ) : null}
          <Champ label="Titre" erreur={erreurs.titre}>
            {(p) => <Input {...p} ref={refTitre} value={titre} onChange={(e) => setTitre(e.target.value)} />}
          </Champ>
          <Champ label="Ressource (URL)" facultatif erreur={erreurs.url}>
            {(p) => (
              <Input
                {...p}
                ref={refUrl}
                type="text"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            )}
          </Champ>
          <Champ label="Note" facultatif>
            {(p) => <Textarea {...p} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />}
          </Champ>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFermer}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
