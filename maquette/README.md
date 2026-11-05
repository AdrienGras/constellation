# Maquette de constellation

La maquette vit sur claude.ai ; ce dossier en garde les sources pour pouvoir la régénérer.

- **Design system** « constellation » : https://claude.ai/artifact/VHX2ssXV1wRTpzDimUkkge — copie de ses fichiers dans `design-system/` (`tokens.json`, `tokens.css`, `components/bundle.js` et `bundle.css`, un aperçu et un guide par composant).
- **Canevas des maquettes** (16 artboards, jouables avec Play) : https://claude.ai/artifact/WzcbrRpVeq6Ghw9aUgXevM
- `canevas/` : copie des 16 artboards (`*.dc.html`) et de l'index `canvas.json`, telles que publiées le 05/11/2026. Pour republier : `Artifact publish` avec `root` = un dossier contenant `project/` (copier `canevas/` en `project/`).
- `plan.json` : positions calculées des 68 stations, tracés des 8 lignes et étiquettes des quartiers (réutilisables par l'app).

## Outils (`outils/`)

Les scripts ont été écrits dans le dossier temporaire d'une session : les chemins de sortie sont passés en argument, mais certains lisent `lignes.json` / `lignes-sombre.json` dans le dossier courant. Lancer depuis `maquette/outils/`.

| Script | Rôle |
|---|---|
| `couleurs.py` | contraste WCAG, OKLCH, simulation de daltonisme |
| `palette.py`, `sombre.py` | couleurs des 8 lignes (clair, historique ; sombre, retenu) |
| `tokens.py <tokens.json>` | réécrit les couleurs de `tokens.json` (thème sombre) et vérifie 121 paires WCAG AA |
| `plan.py <tokens.json> <plan.json>`, `etiquettes.py <plan.json>`, `svgplan.py` | plan de métro du nuage |
| `fiches.py`, `quiz.py`, `roadmap.py`, `divers.py` | assemblage des artboards (chemins de sortie en dur vers le dossier de session : à adapter) |
| `nuage2.py`, `routes.py`, `roadmap2.py`, `mobile2.py` | passe d'interactivité du 05/11 (prennent en argument le dossier `project/` du canevas) |

## Écarts validés avec l'app

- **En-tête et légende du plan (validé par Adrien le 05/11/2026 : choix de l'approche, puis approbation du design).** L'app compacte l'en-tête de l'accueil (étiquette « Accueil » supprimée, chapeau du plan sur une ligne, encart du quiz réduit après le quiz) et pose la légende des lignes dans le plan à partir de 1280 px, en coin haut gauche, au lieu d'une rangée au-dessus. Raison : le haut du dessin du plan doit rester à 300 px ou moins en PC portable (258 px avant le quiz, 298 px après). Un bouton « Plein écran » s'ajoute au coin haut droit du plan. La maquette reste la référence pour tout le reste.
- **Reste à valider** : la passe visuelle sur le rendu réel, et le déplacement de « Effacer les filtres » sur la rangée du libellé « Catégorie ».
