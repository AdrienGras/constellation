import type { Locator } from '@playwright/test'
import { AppPage, echapper } from './AppPage'

export class PlanPage extends AppPage {
  async ouvrir() {
    await this.allerA('/')
  }

  /** Station du plan, trouvée par le début de son nom accessible (le titre du métier). */
  station(titre: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(`^${echapper(titre)}, `) })
  }

  async ouvrirStation(titre: string) {
    await this.station(titre).click()
  }

  /** Tracés de lignes ; avec `etat`, seulement ceux de cet état (`top` ou `exploration`). */
  traces(etat?: 'top' | 'exploration'): Locator {
    return this.page.locator(etat ? `[data-trace][data-etat="${etat}"]` : '[data-trace]')
  }

  get lienCommencerQuiz(): Locator {
    return this.page.getByRole('link', { name: 'Commencer le quiz' })
  }

  get lienVueListe(): Locator {
    return this.page.getByRole('link', { name: 'Liste', exact: true })
  }
}
