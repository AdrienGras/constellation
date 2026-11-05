import { expect, type Locator } from '@playwright/test'
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

  /** Rangée des boutons de navigation, collée en bas de la fenêtre. */
  get barreNavigation(): Locator {
    return this.page.locator('[data-barre-quiz]')
  }

  /** Bouton « Question suivante » ou « Voir mon résultat ». */
  get boutonAvancer(): Locator {
    return this.page.getByRole('button', { name: /^(Question suivante|Voir mon résultat)$/ })
  }

  /** Dernière carte de réponse (question) ou de ligne à départager. */
  get dernierChoix(): Locator {
    return this.page
      .locator('[data-slot="radio-carte"], [role="group"][aria-label="Lignes à égalité"] > label')
      .last()
  }

  get note(): Locator {
    return this.page.getByText('Il n’y a pas de bonne réponse')
  }

  async cocherPremiere() {
    await this.reponses.getByRole('radio').first().check()
  }

  /** Pose le focus sur la 1re réponse, puis descend de `n` réponses aux flèches et attend l’arrivée du focus. */
  async descendreAuClavier(n: number) {
    const radios = this.reponses.getByRole('radio')
    await radios.first().focus()
    for (let i = 1; i <= n; i++) {
      await this.page.keyboard.press('ArrowDown')
      // Radix déplace le focus après coup : on attend chaque arrivée avant la flèche suivante.
      await expect(radios.nth(i)).toBeFocused()
    }
  }

  /** Départage à plusieurs places : focus sur la 1re case, puis Tab jusqu'à la dernière, en attendant chaque arrivée. */
  async tabulerJusquAuDerniereCase() {
    const cases = this.page.getByRole('checkbox')
    const total = await cases.count()
    await cases.first().focus()
    for (let i = 1; i < total; i++) {
      await this.page.keyboard.press('Tab')
      await expect(cases.nth(i)).toBeFocused()
    }
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
