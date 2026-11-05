import * as React from 'react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col', className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('inline-flex w-fit flex-wrap gap-1 rounded-md bg-surface-muted p-1', className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-sm border-0 bg-transparent px-3.5 py-2 text-[15px] leading-5 font-bold whitespace-nowrap text-encre-douce disabled:cursor-not-allowed disabled:opacity-60 data-[state=active]:bg-surface data-[state=active]:text-encre data-[state=active]:shadow-carte',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('pt-4', className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
