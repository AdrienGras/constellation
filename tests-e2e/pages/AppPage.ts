import type { Locator, Page } from '@playwright/test'

/** Base des écrans : navigation par ancre, barre de navigation, bandeau, lien d'évitement. */
export class AppPage {
  constructor(readonly page: Page) {}

  /** `route` s'écrit comme dans l'app : `/`, `/liste`, `/fiche/dsi`. */
  async allerA(route: string) {
    await this.page.goto(`./#${route}`)
    await this.attendreChargement()
  }

  /** Attend que l'app soit montée (la barre de navigation est rendue par la mise en page). */
  async attendreChargement() {
    await this.barre.waitFor()
  }

  /** Vide le localStorage de l'origine (la page doit déjà être chargée). */
  async viderStockage() {
    await this.page.evaluate(() => window.localStorage.clear())
  }

  get barre(): Locator {
    return this.page.getByRole('navigation', { name: 'Navigation principale' })
  }

  lienBarre(nom: 'Nuage' | 'Quiz' | 'Roadmap' | 'Sources'): Locator {
    return this.barre.getByRole('link', { name: nom, exact: true })
  }

  get lienEvitement(): Locator {
    return this.page.getByRole('link', { name: 'Aller au contenu' })
  }

  get contenu(): Locator {
    return this.page.locator('main')
  }

  get titre(): Locator {
    return this.page.getByRole('heading', { level: 1 })
  }

  /** Bandeau « ton navigateur ne garde rien », affiché quand le stockage est refusé. */
  get bandeauStockage(): Locator {
    return this.page.getByRole('status').filter({ hasText: 'Ton navigateur ne garde rien' })
  }
}

/** Échappe un texte pour l'inclure tel quel dans une expression régulière. */
export function echapper(texte: string): string {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
