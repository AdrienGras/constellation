import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type ScreenReaderInstructions,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { ItemRoadmap } from '@/components/metier/ItemRoadmap'
import { Button } from '@/components/ui/button'
import type { Annee as AnneeId, Item } from '@/logique/roadmap'

const INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    'Pour déplacer un élément, appuie sur Espace, puis utilise les flèches haut et bas, et Espace pour déposer. Échap annule.',
}

function ItemTriable({
  item,
  index,
  total,
  onDeplacer,
  onModifier,
  onSupprimer,
}: {
  item: Item
  index: number
  total: number
  onDeplacer: (de: number, vers: number) => void
  onModifier: () => void
  onSupprimer: () => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })
  const racine = useRef<HTMLLIElement | null>(null)
  const prefere = useRef<'Monter' | 'Descendre' | null>(null)

  // Le déplacement réordonne le DOM et peut désactiver le bouton cliqué : le focus revient sur
  // ce bouton, ou sur son vis-à-vis s'il est désormais désactivé (WCAG 2.4.3).
  useEffect(() => {
    const verbe = prefere.current
    if (!verbe) return
    prefere.current = null
    const autre = verbe === 'Monter' ? 'Descendre' : 'Monter'
    const bouton = (v: string) =>
      racine.current?.querySelector<HTMLButtonElement>(`button[aria-label^="${v} «"]`)
    const cible = bouton(verbe)?.disabled === false ? bouton(verbe) : bouton(autre)
    cible?.focus()
  })

  function deplacer(verbe: 'Monter' | 'Descendre', vers: number) {
    prefere.current = verbe
    onDeplacer(index, vers)
  }
  return (
    <li
      ref={(n) => {
        racine.current = n
        setNodeRef(n)
      }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'relative z-10 opacity-80' : undefined}
    >
      <ItemRoadmap
        item={item}
        premier={index === 0}
        dernier={index === total - 1}
        onMonter={() => deplacer('Monter', index - 1)}
        onDescendre={() => deplacer('Descendre', index + 1)}
        onModifier={onModifier}
        onSupprimer={onSupprimer}
        poignee={
          <button
            type="button"
            ref={setActivatorNodeRef}
            aria-label={`Déplacer « ${item.titre} »`}
            className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded-sm border-0 bg-transparent p-0 text-encre-douce hover:bg-surface-muted active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical aria-hidden="true" className="size-[18px]" />
          </button>
        }
      />
    </li>
  )
}

export function Annee({
  annee,
  items,
  couleur,
  onAjouter,
  onDeplacer,
  onModifier,
  onSupprimer,
}: {
  annee: AnneeId
  items: Item[]
  couleur: string
  onAjouter: () => void
  onDeplacer: (de: number, vers: number) => void
  onModifier: (item: Item) => void
  onSupprimer: (item: Item) => void
}) {
  const capteurs = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const titreDe = (id: string | number) => items.find((i) => i.id === id)?.titre ?? ''
  const position = (id: string | number) => items.findIndex((i) => i.id === id) + 1

  const annonces: Announcements = {
    onDragStart: ({ active }) => `Élément « ${titreDe(active.id)} » saisi, en position ${position(active.id)} sur ${items.length}.`,
    onDragOver: ({ active, over }) =>
      over ? `Élément « ${titreDe(active.id)} » au-dessus de la position ${position(over.id)} sur ${items.length}.` : undefined,
    onDragEnd: ({ active, over }) =>
      `Élément « ${titreDe(active.id)} » déplacé en position ${position(over?.id ?? active.id)} sur ${items.length}.`,
    onDragCancel: ({ active }) => `Déplacement annulé : « ${titreDe(active.id)} » reste en position ${position(active.id)}.`,
  }

  function finGlisser({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    onDeplacer(
      items.findIndex((i) => i.id === active.id),
      items.findIndex((i) => i.id === over.id),
    )
  }

  return (
    <section aria-labelledby={`annee-${annee}`} className="relative flex flex-col gap-3 pb-8 pl-12 last:pb-0">
      <span
        aria-hidden="true"
        className="absolute top-1 left-[3px] size-[26px] rounded-full border-[5px] bg-surface"
        style={{ borderColor: couleur }}
      />
      <h2 id={`annee-${annee}`} className="titre-2 m-0">
        {annee}
      </h2>
      {items.length === 0 ? (
        <p className="m-0 text-encre-douce">
          Rien pour {annee} pour l’instant. Ajoute un projet à réaliser ou une notion à apprendre.
        </p>
      ) : (
        <DndContext
          id={`dnd-${annee}`}
          sensors={capteurs}
          collisionDetection={closestCenter}
          onDragEnd={finGlisser}
          accessibility={{ announcements: annonces, screenReaderInstructions: INSTRUCTIONS }}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {items.map((item, index) => (
                <ItemTriable
                  key={item.id}
                  item={item}
                  index={index}
                  total={items.length}
                  onDeplacer={onDeplacer}
                  onModifier={() => onModifier(item)}
                  onSupprimer={() => onSupprimer(item)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <div>
        <Button type="button" variant="outline" size="sm" data-ajouter={annee} onClick={onAjouter}>
          <Plus aria-hidden="true" />
          Ajouter à {annee}
        </Button>
      </div>
    </section>
  )
}
