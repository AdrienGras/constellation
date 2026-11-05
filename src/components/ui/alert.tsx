import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Pas de role="alert" par défaut : à passer explicitement quand le message doit être annoncé.
const alertVariants = cva(
  'flex items-start gap-3 rounded-md p-4 [&>svg]:mt-[3px] [&>svg]:size-[18px] [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        info: 'bg-info-doux text-info [&_[data-slot=alert-description]]:text-encre',
        attention: 'bg-attention-doux text-attention [&_[data-slot=alert-description]]:text-encre',
        neutre: 'bg-surface-muted text-encre',
      },
    },
    defaultVariants: { variant: 'neutre' },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="alert-title"
      className={cn('m-0 text-[16px] leading-[22px] font-bold', className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('m-0 text-[15px] leading-[22px]', className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
