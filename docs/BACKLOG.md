# Backlog & idées

Choses identifiées comme "à faire un jour" mais pas prioritaires. Si tu trouves une
amélioration en passant, note-la ici plutôt que de l'oublier ou de la coder
maintenant.

Une fois faite, déplace-la en `INDEX.md` (livré) ou supprime-la (abandonnée).

Organise les entrées par thème (`## <Thème>`), chaque idée étant une case à cocher
`- [ ] …`.

---

## Décisions ouvertes (PRD)

- [ ] Licence des textes propres (CC BY 4.0 proposée).
- [ ] Question à Yoan : seuil de 12 élèves (article 8) et absence du groupe B2-I.
- [ ] Configurer GitHub Pages ; envoyer le lien à scolarite-orleans@coda.school avant le 21/05/2027.

## Données

- [ ] Badge `ux-designer` à `moyenne` sans note ni rapprochement (même situation qu'`ui-designer`) : justifier ou remonter.
- [ ] `meta.unites.silkhom` énonce encore l'ancienne règle « premier emploi » (sans l'exception des métiers d'évolution) : à aligner sur la PRD par script.
- [ ] Tous les compteurs (16 questions, 29 liens roadmap…) sont écrits en dur dans la PRD : à resynchroniser après toute modification de données.

## Scripts

- [ ] Mineurs de revue non traités : `ECRASABLES` dupliqué dans `fusionner.py`, chaîne vide acceptée comme valeur, `except ImportError` trop large, CLI de `valider.py` sans gestion d'un fichier absent.

## Maquette

- [ ] Modéliser d'autres fiches dans la maquette si Adrien veut tester plus de parcours (aujourd'hui : dev-backend, dsi, integrateur-web, mlops ; les 64 autres stations n'ouvrent qu'une infobulle).
- [ ] Le canevas ne partage pas d'état entre artboards : le résultat du quiz n'allume pas E2 en direct (valeurs d'exemple). À reproduire correctement dans l'app.
- [ ] Tester le thème sombre sur le vrai vidéoprojecteur de CODA avant le 28/05/2027 (risque de délavage en salle éclairée).
- [ ] Rendre les scripts de `maquette/outils/` indépendants du dossier de session (chemins de sortie en argument partout).

