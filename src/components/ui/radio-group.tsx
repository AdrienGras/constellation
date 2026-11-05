import * as React from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('flex min-w-0 flex-col gap-3', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'mt-0.5 grid size-[22px] shrink-0 cursor-pointer place-items-center rounded-full border-2 border-trait-fort bg-surface data-[state=checked]:border-primaire disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-primaire" />
    </RadioGroupPrimitive.Item>
  )
}

/** Choix en carte (quiz) : une étiquette cliquable avec lettre, pastille radio et texte. */
function RadioCarte({
  value,
  lettre,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, 'children'> & {
  lettre?: string
  children: React.ReactNode
}) {
  return (
    <label
      data-slot="radio-carte"
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-lg border-2 border-trait bg-surface px-6 py-4 text-[18px] leading-[26px] hover:border-trait-fort has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)] has-[[data-state=checked]]:border-primaire has-[[data-state=checked]]:shadow-[inset_0_0_0_1px_var(--primaire)]',
        className,
      )}
    >
      <RadioGroupItem value={value} className="mt-0 focus-visible:outline-none" {...props} />
      {lettre ? (
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-muted text-[15px] font-bold group-has-[[data-state=checked]]:bg-primary group-has-[[data-state=checked]]:text-primary-foreground"
        >
          {lettre}
        </span>
      ) : null}
      <span className="flex flex-col">{children}</span>
    </label>
  )
}

export { RadioGroup, RadioGroupItem, RadioCarte }
