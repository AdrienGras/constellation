# Conventions de code

Squelettes et patterns récurrents du projet. À consulter avant de créer un nouveau
type de fichier ou de composant.

Si tu découvres un pattern récurrent : documente-le ici.

Une section par pattern (`## <Nom du pattern> — squelette`), avec le code minimal
reproductible dans un bloc de code, suivi si besoin d'une sous-section
`### Règles tacites`.

---

## Modification de metiers.json — squelette

```python
import json, sys
from pathlib import Path
sys.path.insert(0, "/srv/AdrienGras/constellation")
from scripts.fusionner import ecrire
from scripts.valider import valider

chemin = Path("/srv/AdrienGras/constellation/metiers.json")
d = json.loads(chemin.read_text(encoding="utf-8"))
m = {x["id"]: x for x in d["metiers"]}
m["dev-backend"]["rome"] = "M1855"          # une modification décidée
assert valider(d) == [], valider(d)
ecrire(chemin, d)
```

### Règles tacites

- Jamais `fusionner.py` sur la v1.1 ; jamais de lecture intégrale du fichier dans le contexte (≈ 230 Ko) : passer par des scripts.
- Tout chiffre a une source (`sources[]` par `id`). Un rapprochement : `{"de": "<libellé exact>", "raison": "<phrase lisible par un·e étudiant·e>"}` et `fiabilite` ≤ `moyenne`.
- Parcours : préfixes courts « ROME : » / « Cigref : » ; le détail (fiche, profil) va dans `source_texte_detail`.
- Quiz : situations de vie étudiante, tutoiement, inclusif ; poids 1 ou 2, 1–2 branches par réponse ; équilibre score max ≤ 10 % (validateur) et espérance au hasard ≤ 15 %.

## Fichier de chantier de recherche — squelette

```json
{"chantier": "apec", "sources_ajoutees": [], "modifications": [
  {"metier": "<id>", "champ": "salaires.apec", "valeur": {}, "source": "apec-2025, famille « … », p. N"}
]}
```

### Règles tacites

- Historique de la phase v1.0 → v1.1 (`recherche/`) ; chaque `.md` de chantier a « Choix faits », « Cas douteux », « Propositions de changement de chiffres ».

## Fonction pure de `src/logique/` + test — squelette

```ts
// src/logique/filtres.ts : aucune dépendance React, types depuis ../donnees/types
import type { TypeMetier } from '../donnees/types'
export function correspondFiltre(m: { categorie: string; type: TypeMetier }, f: Filtres): boolean { /* … */ }

// src/logique/filtres.test.ts, à côté du fichier
import { describe, expect, it } from 'vitest'
describe('correspondFiltre', () => {
  it('accepte tout avec les filtres vides', () => { expect(correspondFiltre(x, FILTRES_VIDES)).toBe(true) })
})
```

### Règles tacites

- La logique métier (filtres, quiz, salaires, roadmap, import / export) vit dans `src/logique/`, pure et testée ; les composants ne font que la brancher.
- **Couleurs uniquement par les tokens** (classes issues de `tokens.css` / `index.css`) : seules exceptions, `plan.json` pour le SVG et `#000` / `#fff` dans la feuille d'impression.
- Imports via l'alias `@/` (= `src/`) pour `components/` et `donnees/` ; textes d'interface en français, inclusifs, tutoiement.

## Page avec `usePageTitre` — squelette

```tsx
import { usePageTitre } from './usePageTitre'

export function SourcesPage() {
  usePageTitre('Sources et mentions')   // document.title = « … · constellation »
  return (
    <div className="flex max-w-[1100px] flex-col gap-7 px-12 pt-10 pb-16">
      <p className="etiquette m-0 text-encre-douce">Sources et mentions</p>
      <h1 className="titre-1 mt-1 mb-0">…</h1>   {/* un h1 unique, classe titre-1 */}
    </div>
  )
}
```

### Règles tacites

- Chaque page est déclarée dans `src/routes.tsx` (routage par ancre) et pose un titre via `usePageTitre`.
- Les écrans qui démontent le bouton cliqué (quiz, re-choix de cible) remettent le focus sur le `h1` ; les dialogues utilisent `useRetourFocus`.

## Composant métier porté de `bundle.js` — squelette

```tsx
// src/components/metier/BadgeFiabilite.tsx : table de variantes + composants ui/ + lucide-react
const NIVEAUX: Record<Fiabilite | 'nd', { variant: …; Icone: ComponentType; texte: string }> = { … }
export function BadgeFiabilite({ niveau, note }: { niveau: Fiabilite | 'nd'; note?: string | null }) { … }
```

### Règles tacites

- Source de comportement et de micro-copies : `maquette/design-system/components/bundle.js` et `index.d.ts` (lecture seule). Les règles de salaires (cible, jamais Silkhom + Apec ensemble, « n.d. ») sont portées par `CartoucheSilkhom` / `CartoucheApec` : ne pas les contourner.
- Un test par composant (`*.test.tsx`), fichiers voisins.

## Lecture / écriture du stockage — squelette

```ts
import { CLES, lire, ecrire } from '@/logique/stockage'
const etat = lire(CLES.roadmap, estEtatRoadmap)   // null si absent, illisible ou refusé par le validateur
ecrire(CLES.roadmap, etat)                         // renvoie false si le stockage est indisponible
```

### Règles tacites

- Clés versionnées (`constellation.<nom>.v1`) centralisées dans `CLES`. Toute valeur lue passe par un type guard (`estEtatQuiz`, `estEtatRoadmap`) ; une valeur invalide est ignorée sans être effacée.
- Les URL ne sont acceptées qu'en `http(s)` (import, état et rendu).
- Le stockage peut manquer (navigation privée) : l'app affiche l'avertissement et continue en mémoire.

## Test e2e de mise en page — squelette

```ts
import { expect, test } from './fixtures'

test.describe('quiz : barre collée (1366×633)', () => {
  test.use({ viewport: { width: 1366, height: 633 } })   // fenêtre réelle : barres du navigateur déduites

  test('le bouton reste dans la fenêtre', async ({ quiz }) => {
    await quiz.ouvrir()
    await quiz.poserStockage('constellation.quiz.v1', { version: 1, reponses: {}, question: 8, departage: [], termine: false })
    await quiz.defilerA(0)
    expect((await quiz.rectEcran(quiz.boutonAvancer)).bas).toBeLessThanOrEqual(await quiz.hauteurFenetre())
  })
})
```

### Règles tacites

- Fenêtres de mesure : 1366×633, 1280×590, 1536×731 et 1280×800 (hauteur d'écran moins les barres du navigateur). Projet `mobile` ignoré (`test.skip` dans `beforeEach`).
- Aucun sélecteur ni mesure DOM dans la spec : tout passe par les page objects (`poserStockage`, `rectEcran`, `hautDansLaPage`, `defilerA`, `hauteurFenetre`, `nombreDeLignes`). `poserStockage` écrit le `localStorage`, recharge et attend l'app.
- Un `sticky` ou une marge de défilement ne se testent qu'en e2e : jsdom ne mesure rien. Tolérance d'un pixel sur les comparaisons de position.
- Les constantes exportées d'une spec ne s'importent pas dans une autre spec (voir QUIRKS).
