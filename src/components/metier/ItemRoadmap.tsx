import { ArrowDown, ArrowUp, BookOpen, Code, GripVertical, Pencil, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { urlAcceptable, type Item } from '@/logique/roadmap'

export function ItemRoadmap({
  item,
  premier,
  dernier,
  onMonter,
  onDescendre,
  onModifier,
  onSupprimer,
  poignee,
}: {
  item: Item
  premier: boolean
  dernier: boolean
  onMonter: () => void
  onDescendre: () => void
  onModifier: () => void
  onSupprimer: () => void
  poignee?: ReactNode
}) {
  const projet = item.type === 'projet'
  const Icone = projet ? Code : BookOpen
  const libelleType = projet ? 'Projet à réaliser' : 'Notion à apprendre'
  const actions = [
    { Icone: ArrowUp, verbe: 'Monter', onClick: onMonter, desactive: premier },
    { Icone: ArrowDown, verbe: 'Descendre', onClick: onDescendre, desactive: dernier },
    { Icone: Pencil, verbe: 'Modifier', onClick: onModifier, desactive: false },
    { Icone: Trash2, verbe: 'Supprimer', onClick: onSupprimer, desactive: false },
  ]
  return (
    <article
      aria-label={`${libelleType} : ${item.titre}`}
      className="flex min-w-0 items-start gap-3 rounded-md bg-surface p-4 shadow-carte"
    >
      <div data-poignee className="contents">
        {poignee ?? (
          <span aria-hidden="true" className="cursor-grab pt-0.5 text-encre-douce">
            <GripVertical />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span>
          <span data-type className="inline-flex items-center gap-1.5 rounded-sm bg-surface-muted px-2.5 py-[3px] text-[14px] leading-5 font-bold text-encre">
            <Icone aria-hidden="true" className="size-3.5" />
            {libelleType}
          </span>
        </span>
        <p data-titre-element className="m-0 text-[17px] leading-6 font-bold">{item.titre}</p>
        {item.url && urlAcceptable(item.url) ? (
          <a
            data-lien-ecran
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm font-mono text-[14px] leading-5 [overflow-wrap:anywhere] text-info underline"
          >
            {item.url.replace(/^https?:\/\//, '')}
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        ) : null}
        {item.url && urlAcceptable(item.url) ? (
          <span data-url-imprimee className="hidden font-mono [overflow-wrap:anywhere]">
            {item.url}
          </span>
        ) : null}
        {item.note ? <p className="m-0 text-[15px] leading-[22px] text-encre-douce">{item.note}</p> : null}
      </div>
      <div data-actions-item className="flex flex-col gap-0.5">
        {actions.map(({ Icone: I, verbe, onClick, desactive }) => (
          <Button
            key={verbe}
            type="button"
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label={`${verbe} « ${item.titre} »`}
            disabled={desactive}
            onClick={onClick}
          >
            <I aria-hidden="true" />
          </Button>
        ))}
      </div>
    </article>
  )
}
