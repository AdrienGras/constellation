import type { Locator } from '@playwright/test'
import { AppPage } from './AppPage'

export class FichePage extends AppPage {
  async ouvrir(id: string) {
    await this.allerA(`/fiche/${id}`)
  }

  /** Lien vers un métier voisin ou d'origine, dans le panneau « Repères ». */
  voisin(titre: string): Locator {
    return this.page
      .getByRole('complementary', { name: 'Repères' })
      .getByRole('link', { name: titre, exact: true })
  }

  get boutonViser(): Locator {
    return this.page.getByRole('button', { name: 'Viser ce métier dans ma roadmap' })
  }
}
