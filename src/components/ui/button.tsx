import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

// Le focus visible vient de la règle globale `:focus-visible` de index.css (jetons) :
// pas de `ring-*` ni de `outline-none` ici.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-sm border border-transparent text-[16px] leading-5 font-bold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:border-trait disabled:bg-surface-muted disabled:text-encre-douce [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primaire-survol',
        secondary: 'bg-surface-muted text-encre hover:bg-trait',
        outline: 'border-trait-fort bg-surface text-encre hover:bg-surface-muted',
        ghost: 'bg-transparent text-encre hover:bg-surface-muted',
        link: 'h-auto bg-transparent p-0 text-primaire underline underline-offset-[3px]',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-[15px]',
        lg: 'h-[52px] px-8 text-[17px]',
        icon: 'h-11 w-11 px-0',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
