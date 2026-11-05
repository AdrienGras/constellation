import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/** Violations axe WCAG 2.1 A/AA de la page affichée. */
export async function analyserAccessibilite(page: Page) {
  const resultat = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  return resultat.violations
}
