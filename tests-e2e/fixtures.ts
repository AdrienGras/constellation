import { test as base, expect } from '@playwright/test'
import { FichePage } from './pages/FichePage'
import { ListePage } from './pages/ListePage'
import { PlanPage } from './pages/PlanPage'
import { QuizPage } from './pages/QuizPage'
import { RoadmapPage } from './pages/RoadmapPage'
import { SourcesPage } from './pages/SourcesPage'

interface Fixtures {
  plan: PlanPage
  liste: ListePage
  fiche: FichePage
  quiz: QuizPage
  roadmap: RoadmapPage
  sources: SourcesPage
}

export const test = base.extend<Fixtures>({
  plan: async ({ page }, use) => use(new PlanPage(page)),
  liste: async ({ page }, use) => use(new ListePage(page)),
  fiche: async ({ page }, use) => use(new FichePage(page)),
  quiz: async ({ page }, use) => use(new QuizPage(page)),
  roadmap: async ({ page }, use) => use(new RoadmapPage(page)),
  sources: async ({ page }, use) => use(new SourcesPage(page)),
})

export { expect }
