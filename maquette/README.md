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
