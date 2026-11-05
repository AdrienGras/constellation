import * as React from 'react'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { toggleVariants } from '@/components/ui/toggle'

const groupe =
  'inline-flex w-fit rounded-sm border border-trait-fort bg-surface'
// Pas d'overflow-hidden sur le groupe (il rognerait le contour de focus) : les items extrêmes
// épousent eux-mêmes l'arrondi intérieur du conteneur (6 px - 1 px de bordure).
const separateur =
  'border-l border-trait-fort first:rounded-l-[5px] first:border-l-0 last:rounded-r-[5px]'

function ToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn(groupe, className)} {...props} />
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleVariants(), 'rounded-none', separateur, className)}
      {...props}
    />
  )
}

export type ItemLien = { href: string; label: React.ReactNode; actif: boolean }

/**
 * Bascule en liens (Graphe / Liste) : même rendu que le ToggleGroup, mais de vrais `<a>`
 * dans un `<nav>`, l’actif portant `aria-current="page"`. Radix ToggleGroup est pensé
 * pour des boutons ; `rendreLien` permet d’y brancher un `<Link>` de routeur.
 */
function ToggleLiens({
  label,
  items,
  className,
  rendreLien,
}: {
  label: string
  items: ItemLien[]
  className?: string
  rendreLien?: (props: React.ComponentProps<'a'>) => React.ReactNode
}) {
  return (
    <nav aria-label={label} data-slot="toggle-liens" className={cn(groupe, className)}>
      {items.map((item) => {
        const props: React.ComponentProps<'a'> = {
          href: item.href,
          'aria-current': item.actif ? 'page' : undefined,
          className: cn(
            toggleVariants(),
            'rounded-none no-underline aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground aria-[current=page]:hover:bg-primary',
            separateur,
          ),
          children: item.label,
        }
        return rendreLien ? (
          <React.Fragment key={item.href}>{rendreLien(props)}</React.Fragment>
        ) : (
          <a key={item.href} {...props} />
        )
      })}
    </nav>
  )
}

export { ToggleGroup, ToggleGroupItem, ToggleLiens }
