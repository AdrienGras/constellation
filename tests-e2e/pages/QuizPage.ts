import type { Locator } from '@playwright/test'
import { AppPage } from './AppPage'

export class QuizPage extends AppPage {
  async ouvrir() {
    await this.allerA('/quiz')
  }

  get reponses(): Locator {
    return this.page.getByRole('radiogroup', { name: 'Réponses' })
  }

  get boutonSuivant(): Locator {
    return this.page.getByRole('button', { name: 'Question suivante' })
  }

  get boutonResultat(): Locator {
    return this.page.getByRole('button', { name: 'Voir mon résultat' })
  }

  get titreResultat(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Tes 3 lignes de départ' })
  }

  get titreDepartage(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'Une dernière question' })
  }

  get lienVoirPlan(): Locator {
    return this.page.getByRole('link', { name: 'Voir mes lignes sur le plan' })
  }

  /** Une lettre par question : `a` coche la 1re réponse, `b` la 2e, etc. */
  async repondreTout(lettres: string) {
    const dernier = lettres.length - 1
    for (const [i, lettre] of [...lettres].entries()) {
      const rang = lettre.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)
      await this.reponses.getByRole('radio').nth(rang).check()
      await (i === dernier ? this.boutonResultat : this.boutonSuivant).click()
    }
  }

  /** Coche (ou choisit) les lignes à égalité, par le nom de leur catégorie, puis valide. */
  async departager(libelles: string[]) {
    for (const libelle of libelles) {
      const choix = this.page.getByRole(libelles.length > 1 ? 'checkbox' : 'radio', { name: libelle })
      await choix.check()
    }
    await this.boutonResultat.click()
  }
}
