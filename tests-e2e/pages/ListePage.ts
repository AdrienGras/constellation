import type { Locator } from '@playwright/test'
import { AppPage } from './AppPage'

export class ListePage extends AppPage {
  async ouvrir() {
    await this.allerA('/liste')
  }

  lienMetier(titre: string): Locator {
    return this.page.getByRole('link', { name: titre, exact: true })
  }

  get recherche(): Locator {
    return this.page.getByRole('searchbox', { name: 'Chercher un métier' })
  }
}
