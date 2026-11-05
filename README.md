# constellation

App web statique pour la journée « Construire son avenir dans le numérique » (module TEM, CODA Dijon, 28/05/2027) : les étudiant·es découvrent 68 métiers (plan, liste, fiches, quiz) puis construisent leur roadmap 2027–2031, qu'elles et ils sauvegardent, réimportent et impriment.

React 19 + Vite + Tailwind CSS v4 + shadcn/ui, 100 % statique, aucune donnée envoyée. Données : `metiers.json`.

## Commandes

Node 24 (`.nvmrc`).

- `npm install`
- `npm run dev` : `http://localhost:5173/constellation/`
- `npm test` : Vitest
- `npm run lint`
- `npm run build`
- `npm run e2e` : Playwright (Page Object Model), construit puis sert `dist/` sur le port 4173
- `python3 scripts/valider.py metiers.json` et `python3 -m unittest discover -s tests -t .` : jeu de données

## Publication

GitHub Pages via `.github/workflows/pages.yml` : https://adriengras.github.io/constellation/ (à activer : Settings > Pages > source « GitHub Actions »).

Spécification fonctionnelle : `PRD — App métiers du numérique (module TEM, CODA).md`. Mémoire du projet : `docs/`.
