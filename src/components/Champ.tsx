import { useId, type ReactNode } from 'react'
import { Label } from '@/components/ui/label'

type PropsControle = { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }

/**
 * Étiquette + contrôle + aide + erreur. L’erreur n’a pas de `role="alert"` :
 * elle est reliée au contrôle par `aria-describedby` (et `aria-invalid`).
 */
export function Champ({
  label,
  aide,
  erreur,
  facultatif,
  children,
}: {
  label: ReactNode
  aide?: ReactNode
  erreur?: string
  facultatif?: boolean
  children: (props: PropsControle) => ReactNode
}) {
  const id = useId()
  const idAide = `${id}-aide`
  const idErreur = `${id}-erreur`
  const decrit = [aide ? idAide : null, erreur ? idErreur : null].filter(Boolean).join(' ')
  const props: PropsControle = { id }
  if (decrit) props['aria-describedby'] = decrit
  if (erreur) props['aria-invalid'] = true

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {facultatif ? <span className="font-normal text-encre-douce"> (facultatif)</span> : null}
      </Label>
      {children(props)}
      {aide ? (
        <p id={idAide} className="m-0 text-[14px] leading-5 text-encre-douce">
          {aide}
        </p>
      ) : null}
      {erreur ? (
        <p id={idErreur} className="m-0 text-[14px] leading-5 text-danger">
          {erreur}
        </p>
      ) : null}
    </div>
  )
}
