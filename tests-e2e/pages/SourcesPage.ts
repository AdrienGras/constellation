import { AppPage } from './AppPage'

export class SourcesPage extends AppPage {
  async ouvrir() {
    await this.allerA('/sources')
  }
}
