# Registre des features livrées

Catalogue chronologique de ce qui a été construit. Pour chaque entrée : spec (le
quoi/pourquoi), plan (le comment), statut. Une ligne par feature.

Voir aussi : `ENVIRONMENT.md` · `QUIRKS.md` · `BACKLOG.md` · `HANDOFF.md`

---

## Features

| Feature | Date | Spec | Plan | Statut | Notes |
|---|---|---|---|---|---|
| Données `metiers.json` v1.1 (salaires complétés, ROME, parcours, roadmap.sh, macro-branches, quiz) | 2026-11-02 | `docs/superpowers/specs/2026-11-02-donnees-v1.1-design.md` | `docs/superpowers/plans/2026-11-02-donnees-v1.1.md` | Livré, relu et validé par Adrien | Décisions dans `relecture.md` ; trace des recherches dans `recherche/` |
| PRD de l'app (5 écrans) | 2026-11-02 | `PRD — App métiers du numérique (module TEM, CODA).md` | — | À jour avec la v1.1 | Hors ligne retiré ; règles « salaire cible » et tranches en années |
| Design system « constellation » (tokens sombres fluo WCAG AA, 23 composants) | 2026-11-04 | `docs/superpowers/specs/2026-11-02-maquette-design.md` | — | Validé par Adrien | https://claude.ai/artifact/VHX2ssXV1wRTpzDimUkkge ; copie dans `maquette/design-system/` |
| Maquettes des 5 écrans (canevas Design, 16 artboards, quiz et roadmap jouables) | 2026-11-04 | `docs/superpowers/specs/2026-11-02-maquette-design.md` | — | **Validé par Adrien le 05/11/2026**, jouable de bout en bout | https://claude.ai/artifact/WzcbrRpVeq6Ghw9aUgXevM ; sources dans `maquette/` |
| App constellation (React/Vite : plan, liste, fiches, quiz, roadmap, sources ; 18 tâches, tests unitaires, e2e POM, axe, workflow Pages) | 2026-11-05 | `docs/superpowers/specs/2026-11-05-implementation-app-design.md` | `docs/superpowers/plans/2026-11-05-implementation-app.md` | Livré sur la branche `app`, relu tâche par tâche ; mise en ligne en attente | Premier run du workflow et activation de Pages à faire (BACKLOG) ; sources dans `src/` |
| Repasse UX, étape 1 : audit des résolutions de PC portable (5 viewports MDPI, 17 scénarios, 13 problèmes) | 2026-11-05 | `docs/ux/repasse-2026-11/rapport.md` | — | Audit livré, corrections en attente des priorités d'Adrien | 21 captures dans `docs/ux/repasse-2026-11/captures/` ; sondes Playwright restées dans le scratchpad |
| Repasse UX, étape 2 : résolutions des problèmes 1 à 5 de l'audit (en-tête compact du plan, légende dans le plan, plein écran, barre du quiz collée, colonne sticky de la roadmap, exemples Management, bouton `ghost` désactivé, filet Apec) | 2026-11-05 | `docs/superpowers/specs/2026-11-05-repasse-ux-resolutions-design.md` | `docs/superpowers/plans/2026-11-05-repasse-ux-resolutions.md` | Livré sur la branche `app` (`230280c..cdcd91a`), 230 tests unitaires, 93 e2e passés, 53 ignorés (specs desktop sur le projet mobile), puis une vague de correctifs de relecture finale (centre du plan visible en 1366×633, anti-recouvrement réparé, constantes dans `tests-e2e/donnees.ts`) ; « Effacer les filtres » déplacé sur la rangée « Catégorie », à faire valider par Adrien | Haut du plan à 258 px avant le quiz, 260 px après (288 px en 1280 de large), mesurés dans 7 fenêtres (cible ≤ 300 px) ; centre « TA FORMATION » visible en 1366×633 ; spec `tests-e2e/mise-en-page.spec.ts` ; 3 captures « après correction » dans `docs/ux/repasse-2026-11/captures/` |

## Commandes / scripts utilitaires

| Commande | Date | Cible |
|---|---|---|
| `npm run dev\|test\|lint\|build\|e2e` | 2026-11-05 | Serveur de dev, Vitest, ESLint, build statique, Playwright (voir ENVIRONMENT) |
| `python3 scripts/valider.py metiers.json` | 2026-11-02 | Valide schéma, références, salaires, rapprochements, quiz, compteurs |
| `python3 scripts/fusionner.py --essai` | 2026-11-02 | Fusion `recherche/*.json` → `metiers.json` (usage unique v1.0 → v1.1 ; refuse une v1.1 sans `--force`) |
| `python3 -m unittest discover -s tests -t . -v` | 2026-11-02 | 56 tests |
| `cd maquette/outils && python3 tokens.py ../design-system/tokens.json` | 2026-11-04 | Régénère les couleurs du design system et vérifie les 121 paires de contraste WCAG AA |
