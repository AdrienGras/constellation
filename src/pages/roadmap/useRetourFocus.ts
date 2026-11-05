import { useRef } from 'react'

/**
 * Radix ne rend le focus qu’à un `DialogTrigger`. Nos Dialog s’ouvrent depuis des boutons
 * quelconques : on retient l’élément focalisé au montage et on le refocalise à la fermeture.
 * À appeler dans le composant monté à l’ouverture du Dialog.
 */
export function useRetourFocus() {
  const ouvreur = useRef<Element | null>(document.activeElement)
  return (e: Event) => {
    e.preventDefault()
    const cible = ouvreur.current
    if (cible instanceof HTMLElement && cible.isConnected) cible.focus()
  }
}
