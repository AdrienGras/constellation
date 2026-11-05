import { useCallback, useEffect, useState, type RefObject } from 'react'

/** Plein écran d'un élément : `disponible` selon l'API du navigateur, `actif` suit `fullscreenchange`. */
export function usePleinEcran(cible: RefObject<HTMLElement | null>) {
  const [actif, setActif] = useState(false)
  const disponible = typeof document !== 'undefined' && document.fullscreenEnabled === true

  useEffect(() => {
    const suivre = () => setActif(document.fullscreenElement !== null && document.fullscreenElement === cible.current)
    document.addEventListener('fullscreenchange', suivre)
    return () => document.removeEventListener('fullscreenchange', suivre)
  }, [cible])

  const basculer = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void cible.current?.requestFullscreen()
    }
  }, [cible])

  return { disponible, actif, basculer }
}
