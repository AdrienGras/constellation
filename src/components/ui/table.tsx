import * as React from 'react'
import { cn } from '@/lib/utils'

function Table({
  className,
  label,
  ...props
}: React.ComponentProps<'table'> & { /** Nom du conteneur défilable, lu par les lecteurs d'écran quand il prend le focus. */ label: string }) {
  return (
    // Défilable à l'horizontale sur écran étroit : il doit être focalisable au clavier (axe, scrollable-region-focusable).
    <div
      data-slot="table-container"
      role="region"
      aria-label={label}
      tabIndex={0}
      className="relative w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
    >
      <table
        data-slot="table"
        className={cn('w-full border-collapse text-[16px] leading-[22px]', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader(props: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" {...props} />
}

function TableBody(props: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return <tr data-slot="table-row" className={className} {...props} />
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'bg-surface-muted px-3 py-2.5 text-left text-[13px] leading-[18px] font-bold tracking-[0.06em] text-encre-douce uppercase',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn('border-b border-trait p-3 align-top', className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('pb-2 text-left text-[15px] text-encre-douce', className)}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption }
