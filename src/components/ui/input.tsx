import * as React from 'react'
import { cn } from '@/lib/utils'

export const styleChamp =
  'box-border min-h-11 w-full rounded-sm border border-trait-fort bg-surface px-3 py-2.5 text-[16px] leading-[22px] text-encre placeholder:text-encre-douce disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-encre-douce aria-[invalid=true]:border-2 aria-[invalid=true]:border-danger'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return <input type={type} data-slot="input" className={cn(styleChamp, className)} {...props} />
}

export { Input }
