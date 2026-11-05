import { useEffect } from 'react'

export function usePageTitre(titre: string): void {
  useEffect(() => {
    document.title = `${titre} · constellation`
  }, [titre])
}
