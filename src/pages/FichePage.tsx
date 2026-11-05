import { Navigate, useParams } from 'react-router'
import { metierParId } from '../donnees'
import { usePageTitre } from './usePageTitre'

export function FichePage() {
  const { id = '' } = useParams()
  const metier = metierParId(id)
  usePageTitre(metier?.titre ?? 'Fiche métier')
  if (!metier) return <Navigate to="/" replace />
  return <h1>{metier.titre}</h1>
}
