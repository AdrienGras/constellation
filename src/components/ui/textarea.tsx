import * as React from 'react'
import { cn } from '@/lib/utils'
import { styleChamp } from '@/components/ui/input'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(styleChamp, 'min-h-24 resize-y', className)}
      {...props}
    />
  )
}

export { Textarea }
