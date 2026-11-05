import type { TypeMetier } from '@/donnees/types'
import { Badge } from '@/components/ui/badge'

export function BadgeType({ type }: { type: TypeMetier }) {
  const evolution = type === 'evolution'
  return (
    <Badge variant="outline">
      <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
        {evolution ? (
          <>
            <circle cx={7} cy={7} r={5} fill="none" stroke="currentColor" strokeWidth={2.5} />
            <circle cx={7} cy={7} r={1.6} fill="currentColor" />
          </>
        ) : (
          <circle cx={7} cy={7} r={5.5} fill="currentColor" />
        )}
      </svg>
      {evolution ? 'Métier d’évolution' : 'Métier d’entrée'}
    </Badge>
  )
}
