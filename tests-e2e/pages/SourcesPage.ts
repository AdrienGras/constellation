import type { Locator } from '@playwright/test'
import { AppPage } from './AppPage'

/** Nombre de sources de `metiers.json` : garde-fou des méthodes qui filtrent le tableau. */
const NOMBRE_DE_SOURCES = 6

export class SourcesPage extends AppPage {
  async ouvrir() {
    await this.allerA('/sources')
  }

  get tableau(): Locator {
    return this.page.getByRole('region', { name: 'Liste des sources' }).getByRole('table')
  }

  /** Cellules de la colonne « Date » (3e colonne : la 1re est un en-tête de ligne, d'où le 2e `td`). */
  async datesDuTableau(): Promise<Locator[]> {
    const cellules = await this.tableau.getByRole('row').locator('td:nth-of-type(2)').all()
    if (cellules.length !== NOMBRE_DE_SOURCES) {
      throw new Error(`${cellules.length} dates trouvées au lieu de ${NOMBRE_DE_SOURCES} : sélecteur cassé ?`)
    }
    return cellules
  }
}
