import { useRef } from 'react'

/**
 * Radix ne rend le focus qu’à un `DialogTrigger`. Nos Dialog s’ouvrent depuis des boutons
 * quelconques : on retient l’élément focalisé au montage et on le refocalise à la fermeture.
 * `repli` sert quand l’opérateur a disparu (élément supprimé). À appeler dans le composant monté à l’ouverture du Dialog.
 */
export function useRetourFocus(repli?: () => HTMLElement | null) {
  const ouvreur = useRef<Element | null>(document.activeElement)
  return (e: Event) => {
    e.preventDefault()
    const cible = ouvreur.current
    if (cible instanceof HTMLElement && cible.isConnected) cible.focus()
    else repli?.()?.focus()
  }
}
