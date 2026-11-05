# Backlog & idées

Choses identifiées comme "à faire un jour" mais pas prioritaires. Si tu trouves une
amélioration en passant, note-la ici plutôt que de l'oublier ou de la coder
maintenant.

Une fois faite, déplace-la en `INDEX.md` (livré) ou supprime-la (abandonnée).

Organise les entrées par thème (`## <Thème>`), chaque idée étant une case à cocher
`- [ ] …`.

---

## Décisions ouvertes (PRD)

- [x] Licence des textes propres : CC BY 4.0 (code MIT ; Cigref et salaires sous les conditions de leurs sources), validée par Adrien le 05/11/2026.
- [ ] Question à Yoan : seuil de 12 élèves (article 8) et absence du groupe B2-I.
- [x] Configurer GitHub Pages (source « GitHub Actions ») : fait par Adrien, première publication le 05/11/2026 (https://adriengras.github.io/constellation/).
- [ ] Envoyer le lien GitHub Pages à scolarite-orleans@coda.school avant le 21/05/2027.

## Données

- [ ] Badge `ux-designer` à `moyenne` sans note ni rapprochement (même situation qu'`ui-designer`) : justifier ou remonter.
- [x] `meta.unites.silkhom` (et `meta.mentions`) alignés sur la PRD (règle « premier emploi » avec l'exception des métiers d'évolution).
- [ ] Tous les compteurs (16 questions, 29 liens roadmap…) sont écrits en dur dans la PRD : à resynchroniser après toute modification de données.

## Scripts

- [ ] Mineurs de revue non traités : `ECRASABLES` dupliqué dans `fusionner.py`, chaîne vide acceptée comme valeur, `except ImportError` trop large, CLI de `valider.py` sans gestion d'un fichier absent.

## Maquette

- [ ] Modéliser d'autres fiches dans la maquette si Adrien veut tester plus de parcours (aujourd'hui : dev-backend, dsi, integrateur-web, mlops ; les 64 autres stations n'ouvrent qu'une infobulle).
- [ ] Le canevas ne partage pas d'état entre artboards : le résultat du quiz n'allume pas E2 en direct (valeurs d'exemple). À reproduire correctement dans l'app.
- [ ] Tester le thème sombre sur le vrai vidéoprojecteur de CODA avant le 28/05/2027 (risque de délavage en salle éclairée).
- [ ] Rendre les scripts de `maquette/outils/` indépendants du dossier de session (chemins de sortie en argument partout).

## App

- [ ] Workflow Pages : `actions/deploy-pages@v4` cible Node 20, déprécié sur les runners (avertissement au run du 05/11/2026) ; passer à la version majeure suivante quand elle sortira.

- [ ] Premier run du workflow `.github/workflows/pages.yml` à surveiller après l'activation de Pages (jamais exécuté sur GitHub).
- [ ] Passe visuelle avec Adrien : textes secondaires à 13-15 px repris de la maquette (à trancher). Le haut du plan est traité par la repasse UX, étape 2 (258 / 298 px) ; l'écart d'en-tête et de légende est validé (05/11/2026) ; reste à lui montrer le rendu réel (passe visuelle) et à faire valider le déplacement de « Effacer les filtres ».
- [ ] Repasse UX, suites : barre du quiz sur 2 lignes en mobile (environ 130 px), plus haute que les marges de défilement `scroll-mb-32` / `scroll-mb-40`.
- [ ] Repasse UX, suites : bouton « Plein écran » sur sa propre rangée sous 1280 px (aujourd'hui masqué avec la légende posée, absent du flux étroit).
- [ ] Repasse UX, suites : ni capture ni test du rendu réel en plein écran (ratio du plan, légende, bulle).
- [ ] Repasse UX, suites : libellés du plan à 11 px et textes secondaires de 13 à 15 px (n° 6 de l'audit) ; cosmétiques n° 7 à 13, dont les marges noires du PDF (à confirmer dans la boîte d'impression).
- [ ] Repasse UX, suites : retirer le rappel « point de départ » de l'encart du quiz si une ligne s'ajoute à l'en-tête (2 px de marge sous le plafond de 300 px).
- [ ] Déplacer un élément de roadmap d'une année à l'autre (aujourd'hui : supprimer puis recréer).
- [ ] Zoom du plan sur mobile.
- [ ] 10 vulnérabilités modérées en devDependencies (`npm audit`) ; 0 en dépendances d'exécution.
- [x] Avertissement de taille de chunk au build : clos, `metiers.json` est embarqué (aucun appel réseau) et la limite relevée est justifiée dans `vite.config.ts`.
- [ ] Stockage : sonde restante si `removeItem` jette ; `window.localStorage` qui jette non testé ; résultat d'`ecrire` ignoré côté quiz ; valeur illisible du stockage écrasée à la première modification (`lire` renvoie `null`, la modification repart de l'état vide et réécrit).
- [ ] Roadmap : `estObjet` dupliqué ; `annees` non tableau ignoré en silence ; cible non-chaîne sans `cibleInconnue` ; `remplacer` sans contrôle de cible inconnue ; `choisirCible(null)` sans changement remet le drapeau sans réécrire ; `ouvertParDefaut` dupliqué (ListePage / Competences) ; ref inline du `<li>` recréé à chaque rendu (`Annee.tsx`) ; Supprimer sans variant destructif ; condition `urlOk` dupliquée à l'impression ; date d'impression calculée au rendu.
- [ ] UI : RadioGroupItem 22 px hors RadioCarte, focus de RadioCarte sur la pastille ; bordure d'erreur 2 px qui décale ; `Progress` ignore `max` ; Tabs / Select / RadioCarte / Progress / Tooltip / Table non testés ; `TooltipProvider` par badge ; `PlageSalaire` sans clamp ; `PastilleLigne` taille md en plus ; `PastilleLigne`/cartouches : rendu n.d. et bloc « raison » dupliqués.
- [ ] Plan et fiches : station atténuée par l'opacité seule ; `onBlur`/`onMouseLeave` partagent l'état ; tests manquants (redirection mobile, légende de zone avant quiz, navigation de `BasculeVue`) ; `<details>` de la liste remontés au passage recherche vide / non vide (perte d'ouverture manuelle) ; h2 `.etiquette` 13 px et « À éviter si » dans `AlertTitle`.
- [ ] Quiz : départage à 1 place sans test ; `m!.titre` ; déplacer `exemplesDeLigne` dans `categories.ts` ; `allerA` réécrit même sans changement ; pas de test provider pour un stockage quiz illisible.
- [ ] E2E : régions Silkhom multi-onglets de même nom ; voie clavier dnd non testée en jsdom (couverte en e2e).
- [ ] Test `echelleApec` quasi tautologique ; lignes > `printWidth` 100 ; bloc `directories` résiduel dans `package.json`.
