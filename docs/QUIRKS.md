# Quirks & pièges connus

Comportements non-évidents découverts au fil du projet. **Catalogue perpétuel** :
un `##` par piège, jamais purgé — les entrées restent utiles indéfiniment.

Le titre de chaque section est **le seul élément injecté automatiquement** au
démarrage de session (index sans corps). Il doit donc être **descriptif du piège
concret**, jamais générique — un titre vague le rend invisible dans l'index, même
si le corps qui le détaille est correct. Format exact :
`## Sujet concret du piège (AAAA-MM-JJ)`.

**Si tu en découvres un nouveau pendant une session : ajoute-le ici dès la
découverte, pas plus tard.**

Corps attendu pour chaque entrée : `**Découvert**` (contexte de la découverte),
`**Symptôme**` (ce qui a été observé), `**Cause**` (l'explication), `**Workaround**`
(contournement ou correction), `**Référence**` (fichier·s/commande·s concerné·s).

---

## Relancer fusionner.py sur la v1.1 écrase les décisions manuelles (2026-11-02)

**Découvert** : revue finale de la phase données.
**Symptôme** : une relance réécrivait des `rapprochement` remis à `null`, des notes et le quiz depuis `recherche/`, avec code 0 et sans erreur de validation.
**Cause** : la fusion considère toute valeur vide comme « à remplir » et écrase librement `fiabilite_note` ; `recherche/` reflète l'état d'avant la relecture.
**Workaround** : le script refuse désormais d'écrire si `meta.version == "1.1"` sans `--force`. Modifier `metiers.json` par script Python, puis `valider.py`.
**Référence** : `scripts/fusionner.py` (`main`), `relecture.md` (« Décisions appliquées »).

## recherche/quiz.json est périmé : le quiz vit dans metiers.json (2026-11-02)

**Découvert** : application des décisions d'Adrien.
**Symptôme** : `recherche/quiz.json` ne contient ni les retouches ni le rééquilibrage validés.
**Cause** : depuis la fusion, la seule source est la clé `quiz` de `metiers.json`.
**Workaround** : lire et modifier le quiz dans `metiers.json` uniquement.
**Référence** : `metiers.json` → `quiz.questions`.

## metiers.json s'écrit sans saut de ligne final, indent 2, ensure_ascii=False (2026-11-02)

**Découvert** : script de fusion.
**Symptôme** : un autre format réécrit tout le fichier et rend le diff illisible.
**Cause** : format d'origine de la v1.0.
**Workaround** : écrire avec `scripts.fusionner.ecrire(Path, dict)` ou `json.dumps(d, ensure_ascii=False, indent=2)` sans `\n` final.
**Référence** : `scripts/fusionner.py` (`ecrire`), test `test_aller_retour_identique`.

## Les grilles Silkhom ne commencent pas toutes à 0 an (2026-11-02)

**Découvert** : vérification de la règle « premier emploi ».
**Symptôme** : 9 fiches (chief-data-officer, dsi, rssi, cto, engineering-manager, architecte-entreprise, architecte-cloud, directeur-projet, scrum-master) ont une 1re tranche à 2, 3, 4 ou 6 ans ; dsi et rssi ont deux tranches ouvertes (6+ et 15+). Tranches aussi variables d'une ligne à l'autre (0–2/2–5/5+ ou 0–3/3–7/7+), avec parfois un trou.
**Cause** : données Silkhom telles que publiées sur la page web (le PDF donne d'autres tranches ; on suit la page).
**Workaround** : afficher les années depuis `annees_min`/`annees_max`, jamais `niveau` ; « premier emploi » seulement si `annees_min == 0`.
**Référence** : PRD, « Règles d'affichage » ; `meta.unites.silkhom`.

## L'Apec ne couvre que les cadres et donne des médianes toutes expériences (2026-11-02)

**Découvert** : recherche Apec.
**Symptôme** : techniciens et intégrateur web en « n.d. » côté Apec ; médianes bien au-dessus d'un salaire d'embauche.
**Cause** : baromètre Apec = cadres du privé, fixe + variable, tous âges.
**Workaround** : présenter l'Apec comme « salaire cible, pas un salaire d'embauche » ; ne jamais le mettre sur le même graphique que Silkhom.
**Référence** : `meta.unites.apec`, PRD.

## Pages Cigref : page du PDF = numéro imprimé + 6 (2026-11-02)

**Découvert** : relecture des parcours.
**Symptôme** : les numéros de page cités ne tombent pas sur la bonne page du PDF.
**Cause** : pagination imprimée décalée dans le PDF Cigref 2025.
**Workaround** : ajouter 6 pour ouvrir la page dans le PDF.
**Référence** : `sources[]` id `cigref-2025`.

## Lancer Python avec -I depuis le dépôt nécessite sys.path.insert pour importer scripts (2026-11-02)

**Découvert** : scripts de vérification.
**Symptôme** : `ModuleNotFoundError: scripts` avec `python3 -I`.
**Cause** : `-I` retire le répertoire courant de `sys.path`.
**Workaround** : `sys.path.insert(0, '/srv/AdrienGras/constellation')` avant `from scripts.valider import valider`.
**Référence** : `scripts/`.

## Un fichier copié depuis un autre artefact doit être listé avant d'être republié (2026-11-04)

**Découvert** : mise à jour du bundle du design system dans le canevas des maquettes.
**Symptôme** : `Artifact publish` refuse tout l'envoi (« published content is not what you last saw ») pour `project/ds/constellation/components/bundle.js`.
**Cause** : les fichiers copiés côté serveur (`files: {"…": {"artifact": url, "path": …}}`) n'ont jamais été lus ni listés par la session ; l'outil protège contre l'écrasement de contenu non vu.
**Workaround** : `Artifact` action `list`, `scope: "files"` sur le canevas, puis republier la même commande.
**Référence** : canevas https://claude.ai/artifact/WzcbrRpVeq6Ghw9aUgXevM, `project/ds/constellation/`.

## Les artefacts claude.ai refusent les .d.ts et ne génèrent tokens.css qu'à l'enregistrement (2026-11-04)

**Découvert** : première publication du design system.
**Symptôme** : publication refusée pour `components/index.d.ts` (« extension .ts is not served ») ; aucun `tokens.css` servi tant que personne n'a enregistré depuis la page, donc les artboards du canevas n'avaient pas de variables CSS.
**Cause** : seuls les types web courants sont servis ; `tokens.css` est généré par la page du design system à l'enregistrement.
**Workaround** : envoyer `index.d.ts` avec `contentType: "text/plain"` ; écrire soi-même `project/tokens.css` (1re ligne `/* constellation — generated from tokens.json */`) et le citer dans la section « Utiliser ce système » du README.
**Référence** : `maquette/design-system/tokens.css`, `maquette/design-system/README.md`.

## Le badge « premier emploi » n’existe que pour les métiers d’entrée (2026-11-04)

**Découvert** : builder check du design de la maquette.
**Symptôme** : 14 des 23 métiers d'évolution (dont mlops, sre, lead-developer) ont une 1re tranche Silkhom à 0 an ; la règle mécanique de la PRD leur aurait donné « la plus proche d'un premier emploi ».
**Cause** : pour un métier d'évolution, les années comptent l'expérience dans le poste, pas depuis la sortie d'études.
**Workaround** : décision d'Adrien (04/11) : badge seulement si `type == "entree"` ; sinon phrase « Métier d'évolution : les années comptent l'expérience dans ce poste, après un premier métier (…) ». Implémenté dans `CartoucheSilkhom`, reporté dans la PRD.
**Référence** : PRD « Règles d'affichage » ; `maquette/design-system/components/bundle.js` (`GrilleSilkhom`).


## La règle a:hover d'un artboard repeint le texte des boutons-liens (2026-11-04)

**Découvert** : commentaire d'Adrien sur le bouton « Voir mes lignes sur le plan » (E8).
**Symptôme** : au survol, le texte d'un `<a class="cs-btn cs-btn-default">` passe en blanc sur fond blanc cassé.
**Cause** : le `<helmet>` de chaque artboard déclare `a:hover{color:#ffffff}`, plus spécifique que `.cs-btn-default`.
**Workaround** : `bundle.css` du design system fixe la couleur de `a.cs-btn-<variante>` et `a.cs-btn-<variante>:hover`. Tout nouveau style de lien-bouton doit faire de même.
**Référence** : `maquette/design-system/components/bundle.css`.

## Le scratchpad de session est vidé entre deux sessions (2026-11-05)

**Découvert** : reprise de la maquette le lendemain.
**Symptôme** : `scratchpad/` vide ; les artboards et scripts écrits la veille n'y sont plus.
**Cause** : le dossier temporaire est propre à la session et nettoyé.
**Workaround** : garder la source de vérité dans `maquette/` (design system, canevas, outils) ; pour modifier le canevas, relire ses fichiers avec `Artifact read` (`paths`) puis republier depuis `scratchpad/artifact-files/<id>/`.
**Référence** : `maquette/README.md`.

