import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

const toggleVariants = cva(
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 bg-transparent px-3.5 py-2 text-[15px] leading-5 font-bold whitespace-nowrap text-encre hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-[18px]',
  {
    variants: {
      variant: {
        default: 'rounded-sm',
        outline: 'rounded-sm border border-trait-fort bg-surface',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Toggle({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
