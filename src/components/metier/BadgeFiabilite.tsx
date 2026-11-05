import { CircleAlert, CircleHelp, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Fiabilite } from '@/donnees/types'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const NIVEAUX: Record<
  Fiabilite | 'nd',
  { variant: 'succes' | 'attention' | 'danger' | 'neutre'; Icone: ComponentType; texte: string }
> = {
  bonne: { variant: 'succes', Icone: ShieldCheck, texte: 'Fiabilité bonne' },
  moyenne: { variant: 'attention', Icone: CircleAlert, texte: 'Fiabilité moyenne' },
  faible: { variant: 'danger', Icone: ShieldAlert, texte: 'Fiabilité faible' },
  nd: { variant: 'neutre', Icone: CircleHelp, texte: 'n.d.' },
}

export function BadgeFiabilite({
  niveau,
  note,
}: {
  niveau: Fiabilite | 'nd'
  note?: string | null
}) {
  const { variant, Icone, texte } = NIVEAUX[niveau] ?? NIVEAUX.nd
  const badge = (
    <Badge variant={variant}>
      <span aria-hidden="true" className="contents">
        <Icone />
      </span>
      {texte}
    </Badge>
  )
  if (!note) return badge
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="rounded-sm">
            {badge}
          </span>
        </TooltipTrigger>
        <TooltipContent>{note}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
