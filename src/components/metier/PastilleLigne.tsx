import { ligneParId } from '@/donnees'
import type { LigneId } from '@/donnees/types'
import { cn } from '@/lib/utils'

const RANGS = ['1er choix', '2e choix', '3e choix']

const TAILLES = {
  sm: 'size-[22px] text-[13px]',
  md: 'size-7 text-base',
  lg: 'size-10 text-[22px]',
}

export function PastilleLigne({
  ligne,
  taille = 'md',
  rang,
  sansNom = false,
}: {
  ligne: LigneId
  taille?: 'sm' | 'md' | 'lg'
  rang?: 1 | 2 | 3
  sansNom?: boolean
}) {
  const l = ligneParId(ligne)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[15px] leading-5 font-bold text-encre',
        taille === 'lg' && 'text-lg',
      )}
    >
      <span
        className={cn(
          'grid flex-none place-items-center rounded-full font-display font-extrabold shadow-[0_0_0_2px_var(--surface)]',
          TAILLES[taille],
        )}
        style={{ background: `var(--ligne-${l.id})`, color: `var(--sur-ligne-${l.id})` }}
        {...(sansNom
          ? { role: 'img', 'aria-label': `Ligne ${l.num}, ${l.libelle}` }
          : { 'aria-hidden': true })}
      >
        {l.num}
      </span>
      {sansNom ? null : (
        <span>
          <span className="sr-only">{`Ligne ${l.num}, `}</span>
          {l.libelle}
        </span>
      )}
      {rang ? (
        <span
          className="rounded-sm px-2 py-0.5 text-[13px] tracking-[0.06em] uppercase"
          style={{
            background: `var(--ligne-${l.id}-pastel)`,
            color: `var(--ligne-${l.id}-encre)`,
          }}
        >
          {RANGS[rang - 1]}
        </span>
      ) : null}
    </span>
  )
}
