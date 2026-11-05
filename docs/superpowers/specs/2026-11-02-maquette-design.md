# Design — Maquette des 5 écrans (planche HTML façon canevas)

2 novembre 2026 · Adrien Gras

**Statut : maquette validée par Adrien le 5 novembre 2026** (canevas jouable, écarts au design ci-dessous acceptés).

## Révision du 4 novembre 2026 (fait foi sur le reste du document)

Décisions prises avec Adrien après la rédaction ; elles remplacent les passages correspondants plus bas.

- **Format** : plus de planche HTML locale. La maquette est un **canevas Design claude.ai** (https://claude.ai/artifact/WzcbrRpVeq6Ghw9aUgXevM) : pages « Écrans desktop », « Mobile », « Références », 16 artboards, notes de décision en post-it. Adrien commente directement sur le canevas. Sources gardées dans `maquette/`.
- **Design system** : un artefact Design System « constellation » (https://claude.ai/artifact/VHX2ssXV1wRTpzDimUkkge), validé par Adrien le 04/11, remplace la page « Système » : tokens, 23 composants (14 primitives shadcn + 9 du domaine), aperçus et guides. Les artboards montent ses vrais composants (`window.Constellation`).
- **Direction visuelle** : **thème sombre unique** (décision d'Adrien : « ça claque »), fond graphite bleuté `#0c1117`, 8 lignes **fluo**, chacune ≥ 4,5:1 sur le fond (donc utilisables en texte), interface en blanc cassé. Le thème clair est abandonné. WCAG 2 AA vérifié (121 paires, `maquette/outils/tokens.py`). Risque assumé : la projection en salle éclairée.
- **Plan du nuage** : les 8 lignes **rayonnent depuis un pôle central « ta formation »** ; métiers d'entrée près du centre, d'évolution vers les terminus ; quartiers = bandes larges le long du tracé ; liens « voisin » au survol seulement.
- **Après le quiz (E2)** : le reste du plan n'est **pas atténué** (c'est la zone d'exploration) : top 3 épaissi et lumineux, 5 autres lignes avec un liseré pointillé « zone d'exploration ».
- **Fiche** : les salaires viennent **après** missions, compétences, « à éviter si » et parcours.
- **Interactivité** : demande d'Adrien, la maquette doit être jouable avant le développement. Déjà jouables : liens entre écrans, quiz complet (16 vraies questions, vrai calcul du top 3), roadmap (ajouter, modifier, monter, descendre, supprimer), onglets et zones Silkhom. Reste une passe d'interactivité (voir `docs/BACKLOG.md`).

## Intention

Avant tout plan et tout code de l'app, Adrien veut **voir** constellation et la valider : à quoi ressemblent les 5 écrans de la PRD, comment les règles délicates (salaires cibles, n.d., rapprochements, tranches en années) se lisent à l'écran, et quelle identité visuelle porte l'app. La maquette est l'étape « maquette → validation » de l'ordre décidé par Adrien : maquette → validation → plan → implémentation → publication.

Elle sert deux lecteurs :

- **Adrien**, qui la commente directement dans T3 Code (rendu HTML dans le fil) pour itérer.
- **Le builder de l'implémentation**, qui doit pouvoir en tirer le plan sans revenir vers Adrien : chaque artboard montre des données réelles et les cas difficiles, avec des annotations.

Le public final ne change pas : une dizaine d'étudiants de B2, sur leur portable, et le formateur qui projette l'app au vidéoprojecteur dans une salle éclairée. Desktop d'abord, lisible sur mobile.

## Objectifs

1. Montrer les 5 écrans (nuage, fiche, quiz, roadmap, sources) en desktop 1280 px, et 3 écrans en mobile 390 px.
2. Fixer une **identité visuelle propre** à constellation : la piste « plan de métro », en thème clair, avec des couleurs franches et leurs versions pastel.
3. Rendre visibles **toutes les règles d'affichage des salaires** de la PRD sur des fiches réelles qui les mettent à l'épreuve.
4. Prouver que la palette respecte **WCAG 2 niveau AA**, ratios calculés à l'appui.
5. Rester fidèle à **shadcn/ui** (tokens, anatomie des composants), pour que l'implémentation soit une traduction directe.

## Non-objectifs

- Aucun code de l'app : pas de React, pas de `npm`, pas de build. La pile technique reste à trancher au plan (shadcn rend React probable).
- Pas de prototype entièrement cliquable : les artboards sont des écrans figés ; les états (survol, après quiz, impression) sont des artboards distincts.
- Pas de canevas Claude Design ni de fichier Figma (voir « Approches »).
- Pas de logique réelle : le quiz ne calcule rien, la roadmap ne sauvegarde rien.

## Anti-objectifs (ce serait un échec même si « c'est joli »)

- Un salaire qui se lit comme un salaire de sortie d'études, une étiquette « junior / confirmé / senior », Silkhom et Apec côte à côte dans un même graphique ou une même colonne, une valeur estimée là où les données disent n.d.
- Des couleurs qui ne tiennent pas au vidéoprojecteur, ou qui échouent aux contrastes AA.
- La couleur comme seul moyen de distinguer une catégorie, une branche ou un type (WCAG 1.4.1).
- Une identité qui rappelle Questionator (fond sombre violacé, accent magenta → violet, Geist, menu latéral à tuiles).
- Un quiz dont le résultat sonne comme un verdict.
- Une maquette en données inventées : tout chiffre et tout texte vient de `metiers.json` v1.1.

## Contraintes

- Données : `metiers.json` v1.1, lu par script Python, jamais modifié par ce travail.
- Règles d'affichage de la PRD (section « Règles d'affichage ») et de `CLAUDE.md` : salaire cible, n.d., Silkhom ≠ Apec, tranches en années.
- Français, tutoiement côté étudiant, écriture inclusive des fiches (« Développeur·se »).
- WCAG 2 AA, exigence d'Adrien (voir « Couleurs »).
- Rendu dans T3 Code : chaque artboard doit tenir dans un document HTML autonome (styles en ligne ou dans une balise `<style>`, images en chemins absolus, polices distantes autorisées) de moins de 512 Ko.
- Commit et push uniquement sur demande d'Adrien.

## Approches envisagées

| Approche | Pour | Contre | Décision |
|---|---|---|---|
| **1. Planche HTML écrite directement** : artboards HTML/CSS autonomes générés par un script Python depuis `metiers.json`, réunis dans une planche façon canevas | Itérations rapides, commentaires directs dans T3, aucune dépendance, données et graphe réels, respecte l'ordre « rien ne se code avant validation » | Fidélité shadcn seulement visuelle (pas les composants React eux-mêmes) | **Retenue par Adrien** |
| 2. Mini-projet React + shadcn (Vite) | Vrais composants, code en partie réutilisable | `npm install`, build à chaque itération, tentation de faire de la maquette le début de l'app ; tranche la pile de fait | Écartée |
| 3. Canevas Claude Design (format de l'exemple Questionator) | Format apprécié d'Adrien | Outil `Artifact` absent de la session ; Adrien préfère commenter en local dans T3 | Écartée (le format de planche s'en inspire) |
| 4. Fichier Figma | Outil de référence | Connecteur Figma non autorisé dans la session | Écartée |

## Décisions prises

### Format de la maquette

- Dossier `maquette/` à la racine du dépôt.
- `maquette/ecrans/<page>/<artboard>.html` : un fichier autonome par artboard (largeur fixe 1280 px ou 390 px, hauteur selon le contenu), rendu tel quel dans T3.
- `maquette/index.html` : la **planche**, inspirée du canevas Questionator. Onglets de pages (Écrans, Mobile, Système, Références), rangées titrées, chaque artboard affiché dans une `iframe` à l'échelle avec son titre et ses notes de décision en marge. Ouvrable localement dans un navigateur.
- `maquette/outils/construire.py` : lit `metiers.json`, calcule la disposition du nuage, injecte les vraies valeurs dans les gabarits et écrit les artboards. `maquette/outils/contrastes.py` : calcule les ratios WCAG de la palette et échoue si un couple requis passe sous le seuil. (Décision de Claude : un générateur plutôt que des fichiers écrits à la main, pour que 68 nœuds et 175 arêtes soient réels et que les valeurs ne soient jamais recopiées à la main.)
- Les **annotations** (notes de décision, renvois aux règles de la PRD) sont posées en marge des artboards, dans un style de note autocollante, jamais dans l'écran lui-même.

### Direction visuelle : « plan de métro » en clair

Choix d'Adrien : piste B (signalétique franche), thème clair, couleurs « pastel / bien flashées ». Références retenues par Adrien (Dribbble, détail dans `/tmp/constellation-refs/selection.md`, copiées dans la page Références) :

| Réf. | Ce qu'on en prend |
|---|---|
| 16 — Forward Subway Map | La métaphore centrale : les 8 macro-branches sont des **lignes**, les métiers des **stations**. |
| 02 — Knowledge Graph clusters | Chaque catégorie forme un **quartier** ancré, dans une enveloppe translucide légendée ; bascule **Graphe / Liste**. |
| 05 — Routed Career Explorer | Des parcours qui partent de « toi » vers les métiers : résultat du quiz et roadmap. |
| 18 — Fives Skill Tree | Le « chemin recommandé » : la roadmap se lit comme un trajet. Pris pour l'idée, pas pour le thème sombre. |
| 10 — SellerCrowd Compensation report | La **source et le contexte avant les chiffres**, des cartouches distincts : un cartouche Silkhom, un cartouche Apec. |

Principes (décisions de Claude, à valider sur la maquette) :

- **Fond blanc** légèrement chaud, encre presque noire ; l'interface (boutons, navigation) reste neutre (encre marine) pour que les couleurs vives soient réservées aux données : lignes, quartiers, badges.
- **Pastilles de ligne numérotées** comme les lignes de métro (« 1 Développement », « 3 Cybersécurité ») : la ligne se reconnaît par son numéro et son nom, pas seulement par sa couleur. La pastille apparaît partout où la branche apparaît : légende, fiche, quiz, roadmap. Le numéro d'une ligne est **fixe** (ordre de `macro_branches`) ; le rang du top 3 ne le remplace jamais et s'écrit en toutes lettres à côté de la pastille (« 1er choix », « 2e choix », « 3e choix »). (Décision de Claude, issue du builder check.)
- **Vocabulaire** : « ligne » est réservé aux macro-branches. À l'écran, les lignes Silkhom (Java, Python…) s'appellent des **profils Silkhom** (« Données du profil Silkhom « Développeur Frontend » : … »). (Décision de Claude, issue du builder check.)
- **Typographie** : une sans-serif de signalétique très lisible de loin pour le texte (piste : Atkinson Hyperlegible, conçue pour la lisibilité), une grotesque plus affirmée pour les titres (piste : Bricolage Grotesque ou Space Grotesk), une monospace pour les chiffres tabulaires. Polices Google Fonts dans la maquette ; l'app finale les embarquera (aucun appel réseau à l'exécution).
- **Icônes** : Lucide, le jeu d'icônes par défaut de shadcn.
- **Composants shadcn** reproduits avec leurs tokens (`--background`, `--foreground`, `--card`, `--muted`, `--primary`, `--border`, `--ring`, `--radius`…) et leur anatomie : Card, Badge, Button, Tabs, ToggleGroup, Select, Command (recherche), Tooltip, Alert, Separator, Table, Dialog, RadioGroup, Input, Textarea, Progress, Sheet (mobile).

### Couleurs et accessibilité (WCAG 2 AA)

Exigence d'Adrien : couleurs et nuances conformes à WCAG 2. Niveau retenu : **AA**. (Si Adrien veut AAA, 7:1 pour le texte, la palette devra être revue : ça éteint le côté « flashé ».)

- **8 lignes** (une par macro-branche), chacune avec trois jetons :
  - `ligne-N` : la couleur vive, pour les traits, nœuds et pastilles ; **≥ 3:1 sur le fond** (WCAG 1.4.11, éléments graphiques).
  - `ligne-N-pastel` : le fond des quartiers, cartouches et badges ; ne porte jamais seule une information.
  - `ligne-N-encre` : le texte posé sur le pastel ou sur le fond ; **≥ 4,5:1** sur les deux (WCAG 1.4.3).
- **17 catégories** : des nuances de la couleur de leur ligne, chacune encore ≥ 3:1 sur le fond. Dans le nuage, la catégorie se reconnaît d'abord par son **quartier légendé** (position fixe + nom écrit), la nuance ne fait que renforcer.
- **Type entrée / évolution** : station pleine pour un métier d'entrée, station à anneau (comme une correspondance) pour un métier d'évolution, plus le libellé dans le survol, la fiche et la liste.
- **Focus clavier** visible partout (anneau `--ring`, ≥ 3:1).
- Teintes choisies pour rester distinctes en deutéranopie et protanopie (Cybersécurité et Infra & cloud ne reposent pas sur un couple rouge / vert) ; vérification par simulation sur la page Système. (Décision de Claude : ce n'est pas exigé par WCAG, mais une partie de la promo est probablement concernée.)
- Une jaune vive ne tient pas 3:1 sur blanc : une ligne jaune, si elle existe, prend une version moutarde pour `ligne-N` et garde le jaune vif en pastel.
- `contrastes.py` calcule tous les couples requis ; la page Système affiche la palette avec ses ratios. Une maquette dont un couple échoue n'est pas présentée.

### Navigation (toutes les pages)

- Barre du haut : nom « constellation » (logotype avec un petit tracé de ligne), liens **Nuage · Quiz · Roadmap · Sources**, lien d'évitement « Aller au contenu ». Pas de menu latéral (anti-Questionator, et plus de place pour le graphe).
- La fiche s'ouvre depuis le nuage, la liste, une fiche voisine ou la roadmap ; elle a une URL propre (à trancher au plan : route ou ancre).
- Bandeau discret si le stockage du navigateur est indisponible : « Ton navigateur ne garde rien : ton résultat de quiz et ta roadmap seront perdus en fermant l'onglet. Pense à exporter. »

### Inventaire des artboards

Validé par Adrien. Desktop 1280 px sauf mention contraire.

**Page « Écrans »**

| # | Artboard | Ce qu'il doit montrer |
|---|---|---|
| E1 | Nuage, première visite | Les 17 quartiers ancrés regroupés par ligne, 68 stations, 175 arêtes ; légende des 8 lignes ; filtres catégorie (multi) et type (Tous / Entrée / Évolution) ; bascule Graphe / Liste ; un nœud survolé (Tooltip avec titre, catégorie, type) et ses voisins mis en évidence ; invitation « Fais le quiz pour voir tes 3 lignes de départ ». |
| E2 | Nuage après le quiz | Les 3 lignes du top 3 en couleur pleine, numérotées 1-2-3 ; le reste du nuage signalé « Ta zone d'exploration : choisis 3 métiers ici » (traitement atténué mais lisible, contraste AA conservé) ; rappel « point de départ, pas un verdict » ; lien « Refaire le quiz ». |
| E3 | Nuage, vue liste | Les 68 métiers groupés par ligne puis catégorie, avec pastille de ligne, type, et filtres identiques ; navigable au clavier ; marque « hors de ton top 3 » après le quiz. |
| E4 | Fiche `dev-backend` | Métier d'entrée, fiabilité moyenne, **5 lignes Silkhom** (Java, Python, PHP, Net, Backend JS) en onglets, zone Régions par défaut, tranches 0–2 / 2–5 ans, première tranche signalée « la plus proche d'un premier emploi », moyenne Silkhom **n.d.** ; Apec « Développement informatique » ; lien roadmap.sh présent. |
| E5 | Fiche `dsi` | Métier d'évolution avec 3 métiers « depuis » cliquables ; Alert « Pas de premier emploi direct : métier accessible après 6 ans d'expérience » ; tranches « 6 ans et plus » puis « 15 ans et plus » ; pas de lien roadmap.sh ; fiabilité bonne. |
| E6 | Fiche `integrateur-web` | Rapprochement Silkhom (« données de Développeur Frontend ») avec sa raison sous le cartouche ; cartouche Apec en **n.d.** avec la raison tirée de `fiabilite_note` ; pas de lien roadmap.sh. |
| E7 | Fiche `mlops` | Métier d'évolution (depuis DevOps, data engineer, ML engineer) ; tranches 0–3 / 3–7 / 7 ans et plus, **sans** badge premier emploi mais avec la phrase « Métier d'évolution : les années comptent l'expérience dans ce poste… » ; rapprochement **Apec** (« données de Big Data ») avec sa raison ; lien roadmap.sh présent. |
| E8 | Quiz, question en cours | « Question 6 sur 16 » (q06, texte réel), barre de progression, 4 réponses en grandes cartes (RadioGroup, sélection au clavier), Précédent / Suivant. |
| E9 | Quiz, résultat | Le top 3 des lignes en « 3 lignes qui partent de ta station » (réf. 05), chacune avec ses catégories et 2-3 métiers d'exemple ; titre du type « Tes 3 lignes de départ » ; mention « un point de départ, pas un verdict : ce matin, tu vas justement explorer ailleurs » ; boutons « Voir sur le nuage » et « Refaire le quiz » ; « Résultat gardé dans ce navigateur ». |
| E10 | Roadmap vide | Choix du métier cible (recherche Command sur les 68 métiers) ; la grille 2027 → 2031 déjà visible et vide, avec une invite par année ; boutons d'import JSON. |
| E11 | Roadmap remplie | Cible `dev-backend` ; trajet vertical 2027 → 2031, une station par année, items en cartes à côté de chaque station ; chaque item : type (« Projet à réaliser » / « Notion à apprendre », icône + libellé), titre, URL, note ; poignée de déplacement **et** boutons monter / descendre (accessibilité clavier) ; colonne de droite fixe « Compétences de la fiche cible » + lien vers la fiche ; barre d'actions : Ajouter, Imprimer (PDF), Exporter JSON, Importer JSON ; indicateur « Enregistré dans ce navigateur ». Un Dialog d'ajout d'item en vignette annexe. |
| E12 | Roadmap, aperçu A4 | Format A4 portrait à l'échelle : une année par bloc, sans navigation ni couleur de fond, texte noir, URL imprimées en clair, en-tête avec métier cible et date. |
| E13 | Sources et mentions | Texte de `meta.mentions` ; tableau des 6 sources (titre, éditeur, date, usage, licence, lien) ; licence des textes propres affichée « à décider » tant qu'Adrien n'a pas tranché. |

**Page « Mobile »** (390 px) : M1 nuage (vue liste par défaut, le graphe reste accessible mais dense), M2 fiche `dev-backend` (sections empilées, onglets Silkhom défilants), M3 roadmap remplie (années empilées, compétences dans un Sheet).

**Page « Système »** : palette des 8 lignes × (vive, pastel, encre) et des 17 nuances de catégories, avec ratios mesurés et simulation daltonisme ; typographie ; composants shadcn utilisés et leurs états (repos, survol, focus, désactivé).

**Page « Références »** : les 5 shots retenus par Adrien et ce que chacun apporte.

La fiche projetée pendant les présentations n'a pas d'artboard dédié : l'artboard desktop suffit (décision d'Adrien), à condition que la fiche reste lisible à 1280 px de loin (corps de texte ≥ 16 px, titres de section marqués).

### Nuage : disposition

- Disposition calculée par `construire.py` : chaque catégorie a une **ancre fixe** sur une carte 16:9 ; les catégories d'une même ligne sont voisines ; une simulation de forces à graine fixe place les stations autour de leur ancre ; les quartiers sont des enveloppes arrondies translucides (pastel de la ligne) avec leur nom écrit.
- **Trajets de métro** (décision d'Adrien, issue du builder check) : chaque ligne trace un trajet coloré épais (`ligne-N`) qui relie toutes ses stations, en segments à 0°, 45° et 90° comme sur un plan de métro. Ordre de passage (décision de Claude) : les catégories de la ligne dans l'ordre de `macro_branches[].categories`, et dans chaque catégorie les métiers d'entrée d'abord, puis les métiers d'évolution, pour que les terminus portent les métiers les plus avancés. Une station n'appartient qu'à une ligne ; les trajets de lignes différentes ne se croisent pas si possible. Le numéro de ligne est posé en pastille aux deux terminus, comme sur un plan.
- **Liens « voisin »** (les 175 liens, même catégorie et autres catégories) : **masqués par défaut**, affichés seulement au survol ou au focus d'une station, en traits fins dans la couleur de sa ligne (décision d'Adrien : le plan reste lisible au vidéoprojecteur). La fiche et la vue liste donnent toujours accès aux voisins.
- Le graphe de la maquette est un SVG figé. La bibliothèque de graphe de l'app (et le choix de pré-calculer ou non les positions) se décidera au plan.

### Fiche métier : structure

- **En-tête** : pastille de ligne + catégorie, titre, badges type (Entrée / Évolution) et fiabilité (Bonne / Moyenne / Faible / n.d., chacun avec icône et libellé, jamais la couleur seule), code ROME, brief en chapô.
- **Corps, deux colonnes** : à gauche le contenu (missions, compétences en badges, « À éviter si », parcours) ; à droite les **repères** : métiers « depuis » (si évolution), voisins cliquables (même catégorie, autres catégories), lien roadmap.sh (si présent, sinon rien), source du texte et note de fiabilité.
- **Salaires**, section pleine largeur sous le brief, inspirée de la réf. 10 :
  - Un chapeau commun : « Salaires cibles : ce que tu peux viser après quelques années, pas un salaire de sortie d'études. Les deux sources ci-dessous ne mesurent pas la même chose : ne les compare pas entre elles. »
  - **Cartouche « Salaire cible · Silkhom »** (brut annuel fixe, hors primes) : onglets par ligne Silkhom s'il y en a plusieurs ; ToggleGroup de zone **Paris / Grandes villes / Régions (Dijon)**, Régions par défaut ; un tableau des tranches **dans l'ordre des données**, libellées en années (« 0–2 ans », « 6 ans et plus »), avec la fourchette « 30 – 35 k€ » et une barre de plage sur une échelle propre au cartouche ; un trou entre deux tranches reste visible tel quel ; badge « la plus proche d'un premier emploi » sur la première tranche, **seulement en zone Régions, si elle commence à 0 an, et pour un métier d'entrée** ; pour un **métier d'évolution** dont la première tranche commence à 0 an (14 métiers sur 23, dont `mlops`, `sre`, `lead-developer`), pas de badge mais la phrase « Métier d'évolution : les années comptent l'expérience dans ce poste, après un premier métier (<métiers « depuis »>). » (décision d'Adrien, issue du builder check) ; si la première tranche ne commence pas à 0 an, Alert « Pas de premier emploi direct : métier accessible après N ans d'expérience », visible quelle que soit la zone ; moyenne Silkhom affichée en petit (« Moyenne relevée : 52,8 k€ », ou « n.d. ») ; rapprochement éventuel sous le cartouche : « Données de la ligne « … » : <raison> ».
  - **Cartouche « Salaire cible · Apec »** (fixe + variable, cadres du privé) : mention en tête « Médiane des cadres, toutes expériences, pas un salaire d'embauche » ; la médiane en grand ; une réglette D1 – médiane – D9 ; un petit tableau Île-de-France / autres régions / moins de 35 ans ; famille Apec nommée ; rapprochement éventuel sous le cartouche avec sa raison ; si `apec` est `null`, cartouche « n.d. » avec la raison tirée de `fiabilite_note`.
  - Les deux cartouches sont **deux cartes séparées, l'une au-dessus de l'autre** (pas côte à côte sur desktop, pour qu'aucun œil ne compare deux colonnes), chacune avec sa source. (Décision de Claude.)
  - Jamais d'étiquette `niveau`, jamais de `variation_pct` (sens non défini dans la PRD ; décision de Claude).

### Quiz

- Une question par écran, retour possible, réponses modifiables avant la fin.
- Résultat : les 3 lignes, rang 1 à 3, **sans score chiffré** (un score ressemble à une note, donc à un verdict ; décision de Claude). Les cas d'égalité se traitent au plan.

### Roadmap

- Trajet vertical (réf. 16 et 18) : une station par année, 2027 en haut, 2031 en bas, items à droite de chaque station ; la colonne « Compétences de la fiche cible » reste visible à droite (sticky).
- Ajout d'un item par Dialog (type en RadioGroup, titre requis, URL, note facultative).
- La logique (sauvegarde, export, import, impression) n'est que représentée.

## Validation

1. `python3 maquette/outils/contrastes.py` passe (tous les couples requis ≥ 3:1 ou ≥ 4,5:1).
2. Chaque artboard s'affiche dans T3 (`html_preview` sans erreur console, < 512 Ko) et s'ouvre dans la planche locale.
3. Grille de vérification des règles, cochée artboard par artboard sur les fiches E4–E7 et M2 : titre « Salaire cible » sur chaque cartouche ; mention Apec ; Silkhom et Apec séparés ; tranches en années, aucune étiquette de niveau ; badge premier emploi seulement si 0 an, Régions et métier d'entrée ; phrase « Métier d'évolution… » pour `mlops` ; message « pas de premier emploi direct » pour `dsi` ; n.d. sans estimation ; rapprochements avec raison ; badge de fiabilité ; lien roadmap.sh présent ou absent selon les données.
4. Adrien valide les pages une à une dans T3 ; ses commentaires sont repris jusqu'à validation explicite de l'ensemble.
5. `metiers.json` inchangé (`git diff --stat metiers.json` vide).

## Laissé au builder

- Valeurs exactes des couleurs (dans le cadre ci-dessus, validées par `contrastes.py`), espacements, rayons, tailles de texte précises.
- Choix final des polices parmi les pistes, si un rendu au vidéoprojecteur simulé en départage.
- Texte exact des micro-copies non citées ici (invites vides, infobulles), en respectant le tutoiement et l'écriture inclusive.
- Position exacte des ancres de catégories sur la carte, tant que les catégories d'une même ligne restent voisines.
- Exemples de métiers montrés dans le résultat du quiz (E9) et contenu d'exemple de la roadmap (E11), plausibles pour un·e étudiant·e de B2 attiré·e par le back-end.

## Livrables

- `maquette/index.html`, `maquette/ecrans/**.html`, `maquette/outils/construire.py`, `maquette/outils/contrastes.py`.
- `maquette/references/` : vignettes des 5 shots Dribbble retenus, **non versionnées** (visuels de tiers, dépôt public) : le dossier est ajouté à `.gitignore`, et la page Références affiche le titre, l'auteur et le lien Dribbble, plus la vignette quand elle est présente en local. Le dossier `maquette/` ne fait pas partie de l'app publiée sur GitHub Pages ; la configuration de publication (plan) devra l'exclure. (Décision de Claude, issue du builder check.)
- Mise à jour mémoire en fin de session : `docs/INDEX.md`, `docs/HANDOFF.md`, et `docs/QUIRKS.md` / `docs/CONVENTIONS.md` si besoin.
