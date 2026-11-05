# CartoucheApec

Le bloc « Salaire cible · Apec » d'une fiche. Props : `apec` (l'objet `salaires.apec`, ou `null`), `raisonAbsence` (tirée de `fiabilite_note`) quand il est `null`.

- Mention en tête, toujours : **« Médiane des cadres, toutes expériences, pas un salaire d'embauche. »**
- La médiane en `chiffre-grand`, la famille Apec nommée, une réglette 1er décile – médiane – 9e décile sur **sa propre échelle**.
- Tableau Île-de-France / Autres régions / Moins de 35 ans ; une valeur absente s'écrit **n.d.** (les moins de 35 ans n'ont qu'une médiane).
- Rapprochement : « Données de la famille Apec « … » : <raison> ».
- `apec: null` : « n.d. » et la raison, sans aucun chiffre de remplacement.
- Entre les deux cartouches, la fiche rappelle que les deux sources ne se comparent pas.
