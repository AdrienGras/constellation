# ToggleGroup

Choix exclusif entre deux à quatre options courtes, visibles d'un coup. Props : `label` (obligatoire, nom du groupe), `items`, `defaultValue` ou `value` + `onValueChange`.

Usages : zone Silkhom (**Régions par défaut**), filtre Entrée / Évolution du nuage, bascule Graphe / Liste. L'option active passe en `primaire` et porte `aria-pressed="true"`.

Un item avec `href` devient un lien (`aria-current="page"` sur l'actif) : c'est la forme à utiliser pour la bascule Graphe / Liste, qui change de vue.
