# CartoucheSilkhom

Le bloc « Salaire cible · Silkhom » d'une fiche. Il applique les règles d'affichage de la PRD, le consommateur ne les réécrit pas.

Props : `silkhom` (l'objet `salaires.silkhom` de `metiers.json`, ou `null`), `type` (`entree` / `evolution`), `depuis` (titres des métiers « depuis »), `ligne` (couleur des barres), `zoneParDefaut` (`regions`), `raisonAbsence` si `silkhom` est `null`.

- Titre **« Salaire cible »**, jamais « salaire de sortie ». Sous-titre : brut annuel fixe, hors primes.
- Zone **Régions (Dijon) par défaut**, sélecteur Paris / Grandes villes / Régions.
- Tranches en **années** (« 0–2 ans », « 6 ans et plus »), dans l'ordre des données, sans combler un trou ; **aucune étiquette junior / confirmé / senior / expert**.
- Badge « la plus proche d'un premier emploi » : première tranche, **zone Régions, `annees_min == 0`, métier d'entrée** seulement.
- Première tranche > 0 an : encadré « Pas de premier emploi direct : métier accessible après N ans d'expérience. »
- Métier d'évolution à 0 an : encadré « Métier d'évolution : les années comptent l'expérience dans ce poste, après un premier métier (…). »
- Plusieurs profils Silkhom : un onglet par profil. Moyenne affichée, ou **n.d.** ; `variation_pct` jamais affiché.
- Rapprochement : « Données du profil Silkhom « … » : <raison> » sous la grille.
- Toujours **au-dessus ou au-dessous** du cartouche Apec, jamais côte à côte.
