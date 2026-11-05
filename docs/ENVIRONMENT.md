# Environnement du projet

Carte des paths, services, accès, commandes. À jour au fil des découvertes.

À consulter **avant de lancer toute commande non-triviale**.

---

## Repo

- **Path hôte** : `/srv/AdrienGras/constellation`
- **Remote** : `git@github.com:AdrienGras/constellation.git` (`origin`)
- **Branche par défaut** : `main`
- **Convention de merge** : une branche par chantier (`donnees-v1.1`…), fusion locale `--no-ff` dans `main` puis push, sur demande d'Adrien uniquement. Commits en français, avec le trailer `Co-Authored-By`.

## Stack d'exécution

- **Runtime** : Node 24 / npm (`.nvmrc`) pour l'app ; Python 3.12, bibliothèque standard seule, pour les scripts de données. App : React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui, dans `src/`.
- **Commandes de l'app** :
  - `npm run dev` : serveur de dev, `http://localhost:5173/constellation/`.
  - `npm test` : tests unitaires et de composants (Vitest + jsdom).
  - `npm run lint` : ESLint.
  - `npm run build` : `tsc -b` puis build Vite dans `dist/`.
  - `npm run e2e` : Playwright (Page Object Model dans `tests-e2e/pages/`) ; il lance lui-même `npm run build && npx vite preview --port 4173 --strictPort` (port 4173), deux projets desktop 1280×800 et mobile 390×844, axe inclus.
- **Commandes de données** :
  - `python3 scripts/valider.py metiers.json` : valide le jeu de données (code 0 si tout va bien).
  - `python3 -m unittest discover -s tests -t . -v` : 56 tests (validateur, fusion, validité du vrai `metiers.json`).
  - `python3 scripts/fusionner.py --essai` : dry run de la fusion `recherche/` → `metiers.json`. **Ne plus lancer sans `--essai`** : refuse sur une v1.1 sans `--force` (voir QUIRKS).

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `PRD — App métiers du numérique (module TEM, CODA).md` | PRD de l'app (5 écrans, règles d'affichage, contraintes) |
| `metiers.json` | **Unique source de données de l'app** (v1.1) : meta, categories, macro_branches, quiz, metiers, sources |
| `relecture.md` | Relecture des 36 fiches + décisions d'Adrien (02/11/2026), toutes appliquées |
| `recherche/` | Trace des recherches (Apec, Silkhom, ROME/parcours, roadmap.sh) ; historique, plus appliqué |
| `scripts/`, `tests/` | Validateur et script de fusion |
| `src/`, `tests-e2e/` | App React (donnees, logique, etat, pages, composants) et e2e Playwright |
| `.github/workflows/pages.yml` | Build et tests sur chaque PR vers `main` ; build, tests et publication sur GitHub Pages à chaque push sur `main` |
| `docs/superpowers/specs/`, `plans/` | Design et plan de la phase données |

## Services

| Service | Rôle | Accès |
|---|---|---|
| GitHub Pages | Hébergement de l'app (100 % statique, pas de backend), déployé par `.github/workflows/pages.yml` à chaque push sur `main` (job `deploy` sauté sur les PR) | `https://adriengras.github.io/constellation/` ; activé (source « GitHub Actions »), publié depuis le 05/11/2026 |
| SonarCloud | Analyse de chaque PR (check « SonarCloud Code Analysis », bloquant) : quality gate sur le **nouveau code** — notes de fiabilité, sécurité et maintenabilité à A, duplication ≤ 3 %, hotspots revus à 100 % | Projet `AdrienGras_constellation`, API publique : `https://sonarcloud.io/api/qualitygates/project_status?projectKey=AdrienGras_constellation&pullRequest=<n>` et `https://sonarcloud.io/api/issues/search?componentKeys=AdrienGras_constellation&pullRequest=<n>&resolved=false` |

## Variables d'environnement

| Bloc | Variables clés |
|---|---|
| — | aucune |

## Accès / secrets

- Aucun secret. Pas de tracking, pas de compte, pas d'appel réseau à l'exécution.
