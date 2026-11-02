# Chantier Silkhom (tâche 5)

Fichier de modifications : `recherche/silkhom.json` (122 modifications, aucune source ajoutée).
Vérification isolée : `REFUS (0)`, `ERREURS hors moyenne_verifiee (0)`, `erreurs moyenne_verifiee restantes : 0`.
Essai de fusion avec les quatre chantiers présents (`apec`, `rome-parcours`, `roadmap`, `silkhom`) : aucun refus, aucune erreur.

## Sources consultées (02/11/2026)

- `silkhom-it-2026`, page https://www.silkhom.com/les-salaires-informatique-et-electronique/ : grilles par ligne (Paris, grandes villes, régions ; tranches 0–2, 2–5 et + 5 ans pour la plupart des lignes). La page ne donne **pas** de moyenne par ligne, seulement deux palmarès « 10 plus fortes hausses / baisses ».
- Étude complète en PDF, liée depuis cette même page (« Téléchargez l'étude complète ») : https://www.silkhom.com/wp-content/uploads/2026/06/Barometre_des_salaires_2026_SILKHOM.pdf (293 pages, 30/06/2026). Chaque domaine s'ouvre sur un tableau de synthèse « Métier / Salaire moyen (k€/an) / Variation N-1 » : p. 14 (management), p. 45 (développement web, logiciel et QA), p. 90 (mobile), p. 99 (infrastructure, cloud, DevOps, sécurité), p. 162 (ERP, BI, CRM), p. 189 (data), p. 199 (embarqué, électronique), p. 254 (marketing et design). La p. 99 n'a pas de couche texte complète ; je l'ai lue sur l'image de la page. Les autres pages ont été lues sur le texte, puis recoupées sur l'image.
- `bdm-2026`, article du Blog du Modérateur du 07/07/2026 : il reprend une partie de ces moyennes, et toutes celles qu'il cite concordent avec le PDF (Cobol −5,8 %, QA −5,8 %, Unity −4,1 %, chef de projet ERP/CRM +0,6 %, CTO, DSI, CDO, etc.).
- `silkhom-ia-2026` : aucune des 37 moyennes ne relève de la page IA.

## Choix faits

### Source des moyennes
- J'ai pris les moyennes dans les tableaux de synthèse du PDF de Silkhom, cité sous l'`id` `silkhom-it-2026`. C'est l'étude complète de cette même source, téléchargée depuis la page. Le BDM n'a servi qu'à recouper : il ne contredit le PDF nulle part, et Silkhom l'emporte de toute façon. Le champ `source` de chaque modification précise la ligne, la valeur et la page du PDF.
- `moyenne_source` reçoit exactement l'`id` `silkhom-it-2026`.
- Une variation « Stable » ou « Nouveau poste » reste `variation_pct: null`. C'est la convention de la v1.0 (par exemple `dev-android`, `architecte-cloud` et `dsi`, tous « Stable », ont `null`). Je n'ai rempli que les variations chiffrées.

### Les 37 moyennes
Résultat : 35 vérifiées, aucune retirée, 2 laissées vides (n.d.), aucune divergence avec la v1.0. Pour les 25 blocs `moyenne_verifiee: false`, chaque valeur v1.0 a été retrouvée à l'identique, et chaque variation v1.0 aussi.

| Métier | v1.0 (moyenne / variation / vérifiée) | Ligne Silkhom (page PDF) | Après | Issue |
|---|---|---|---|---|
| `dev-legacy-cobol` | 42,2 / -5,8 / False | Développeur Cobol (p. 45) | 42,2 / -5,8 | vérifiée |
| `dev-bdd` | 47,9 / null / False | Développeur Base de Données (p. 99) | 47,9 / null | vérifiée |
| `dev-fullstack` | 47,4 / null / False | Développeur Fullstack JS (p. 45) | 47,4 / 0,2 | vérifiée + remplit variation_pct |
| `dev-frontend` | 41,9 / -1,9 / False | Développeur Frontend JS (p. 45) | 41,9 / -1,9 | vérifiée |
| `dev-jeu-video` | 41,9 / -4,1 / False | Développeur Unity (p. 45) | 41,9 / -4,1 | vérifiée |
| `ingenieur-qa-automatisation` | 44,2 / -5,8 / False | Ingénieur QA (p. 45) | 44,2 / -5,8 | vérifiée |
| `testeur-fonctionnel` | 34,4 / null / False | Testeur Fonctionnel (p. 45) | 34,4 / -0,6 | vérifiée + remplit variation_pct |
| `cloud-finops` | 52,8 / null / False | Cloud FinOps (p. 99) | 52,8 / null | vérifiée |
| `ingenieur-devops` | 52,8 / null / False | Ingénieur DevOps (p. 99) | 52,8 / -0,6 | vérifiée + remplit variation_pct |
| `ingenieur-cloud` | null / -3,5 / False | Ingénieur Cloud (p. 99) | 52,8 / -3,5 | vérifiée + remplit moyenne_keur |
| `platform-engineer` | 52,8 / null / False | Platform Engineer / Ingénieur Kubernetes (p. 99) | 52,8 / null | vérifiée |
| `sre` | null / -2,6 / False | Site Reliability Engineer (SRE) (p. 99) | 52,8 / -2,6 | vérifiée + remplit moyenne_keur |
| `dba` | 50,6 / null / False | Administrateur Base de Données (p. 99) | 50,6 / null | vérifiée |
| `ingenieur-reseaux` | 54,4 / null / False | Ingénieur Réseaux (p. 99) | 54,4 / -1,6 | vérifiée + remplit variation_pct |
| `ingenieur-systemes-linux` | 52,0 / null / False | Ingénieur Système Linux (p. 99) | 52,0 / -1,5 | vérifiée + remplit variation_pct |
| `technicien-systemes-reseaux` | 33,8 / null / False | Technicien Systèmes & Réseaux (p. 99) | 33,8 / null | vérifiée |
| `architecte-entreprise` | 77,5 / null / False | Architecte d'entreprise / Urbanisme SI (p. 99) | 77,5 / null | vérifiée |
| `lead-developer` | 53,4 / null / False | Lead Developer (p. 45) | 53,4 / null | vérifiée |
| `chef-projet-technique` | 48,8 / null / False | Chef de projet Technique (p. 45) | 48,8 / -1,8 | vérifiée + remplit variation_pct |
| `product-owner` | 49,3 / null / False | Product Owner (p. 45) | 49,3 / -0,6 | vérifiée + remplit variation_pct |
| `ingenieur-support-applicatif` | 44,9 / null / False | Ingénieur Support (p. 99) | 44,9 / null | vérifiée |
| `responsable-support-it` | 50,0 / null / False | Responsable Support IT (p. 99) | 50,0 / null | vérifiée |
| `technicien-support` | 33,1 / null / False | Technicien Support (p. 99) | 33,1 / null | vérifiée |
| `technical-writer` | 52,6 / null / False | Technical Writer (p. 45) | 52,6 / null | vérifiée |
| `engineering-manager` | 89,9 / null / False | Engineering Manager (p. 14) | 89,9 / null | vérifiée |
| `dev-backend` | null / null / null | Java, Python, PHP, .Net, Backend JS | null / null | laissée vide (n.d.), voir Cas douteux |
| `dev-mobile-multiplateforme` | null / null / null | Flutter, React Native | null / null | laissée vide (n.d.), voir Cas douteux |
| `dev-embarque` | null / null / null | Ingénieur Logiciel Embarqué (p. 199) | 47,2 / null | vérifiée + remplit moyenne_keur |
| `rssi` | null / null / null | Responsable Sécurité des SI (RSSI) (p. 14) | 88,3 / -3,2 | vérifiée + remplit les deux |
| `dev-bi` | null / null / null | Développeur BI (p. 162) | 40,8 / -0,7 | vérifiée + remplit les deux |
| `business-analyst-amoa` | null / null / null | Business Analyst / Key User (p. 162) | 48,4 / null | vérifiée + remplit moyenne_keur |
| `directeur-projet` | null / null / null | Directeur de projet (ERP/CRM/WMS/TMS/MES) (p. 14) | 70,2 / null | vérifiée + remplit moyenne_keur |
| `ui-designer` | null / null / null | UI / UX Designer (p. 254) | 43,5 / 3,1 | vérifiée + remplit les deux |
| `ux-designer` | null / null / null | UI / UX Designer (p. 254) | 43,5 / 3,1 | vérifiée + remplit les deux |
| `consultant-erp` | null / null / null | Chef de projet / Consultant ERP/CRM/WMS/TMS (p. 162) | 52,5 / 0,6 | vérifiée + remplit les deux |
| `ingenieur-affaires-it` | null / null / null | Ingénieur Commercial (p. 162) | 47,2 / -0,6 | vérifiée + remplit les deux |
| `formateur-informatique` | null / null / null | Formateur Applicatif (p. 162) | 42,8 / null | vérifiée + remplit moyenne_keur |

Pour un bloc à plusieurs grilles, la moyenne suit la `ligne` du bloc. Par exemple, `ux-designer` a `ligne: "UI / UX Designer"` et reçoit donc la moyenne de cette ligne, et non celle d'« UX Researcher » ou de « Product Designer ». Un bloc sans ligne principale (`dev-backend`, `dev-mobile-multiplateforme`) n'en reçoit pas.

### Les 5 blocs créés (tous par rapprochement)
Les grilles viennent de la page `silkhom-it-2026`, avec les tranches telles que la page les donne. La moyenne et la variation sont celles de la même ligne, prises dans le tableau de synthèse du PDF.

| Métier | Ligne Silkhom (`rapprochement.de`) | Tranches | Moyenne / variation | Fiabilité |
|---|---|---|---|---|
| `integrateur-web` | Développeur Frontend | 0–2 / 2–5 / 5+ | 41,9 / −1,9 (p. 45, « Développeur Frontend JS ») | moyenne (inchangée) |
| `ingenieur-informatique-industrielle` | Développeur (ERP / CRM / WMS / TMS / MES / GPAO / GMAO / SIRH) | 0–2 / 2–5 / 5+ | 47,7 / +0,6 (p. 162) | moyenne (inchangée) |
| `test-manager` | Ingénieur QA | 0–2 / 2–5 / 5+ | 44,2 / −5,8 (p. 45) | faible (inchangée) |
| `ingenieur-avant-vente` | Ingénieur Commercial | 0–2 / 2–5 / 5+ | 47,2 / −0,6 (p. 162) | **bonne → moyenne** |
| `devrel` | Technical Writer | 0–3 / 3–7 / 7+ | 52,6 / nouveau poste (p. 45) | nd (inchangée, jamais relevée) |

Aucune ligne Silkhom ne porte le nom de ces métiers ; j'ai cherché « intégrateur », « automatisme », « MES », « test manager », « lead QA », « avant-vente », « advocate » et « DevRel » sur les deux pages et dans le PDF. D'où un rapprochement pour chacun :
- intégrateur web : le développeur frontend fait le même travail d'interface, avec plus de JavaScript ;
- informatique industrielle : la ligne des développeurs de logiciels de gestion cite explicitement le MES, la GPAO et la GMAO ;
- test manager : la fiche PDF s'intitule « Ingénieur QA / Lead QA » et inclut « diriger l'équipe de testeurs », mais la grille ne s'appelle qu'« Ingénieur QA » ;
- avant-vente : la fiche « Ingénieur Commercial » décrit précisément l'avant-vente (« accompagner les commerciaux sur la partie technique », POC, appels d'offres, « passation entre l'avant-vente et l'équipe projet ») ;
- DevRel : le technical writer explique lui aussi un produit à des développeurs, et Silkhom lui prête le « sens de la vulgarisation ».

### Rapprochements implicites rendus explicites
- `directeur-projet` → « Directeur de projet (ERP / CRM / WMS / TMS / MES / GPAO / GMAO / SIRH) ». La ligne Silkhom ne vise que les projets ERP/CRM (« Objectif du Directeur de projet ERP »), alors que la fiche couvre les projets en général.
- `ingenieur-affaires-it` → « Ingénieur Commercial ». Le libellé ressemble à « ingénieur d'affaires », mais la fiche Silkhom décrit le soutien technique aux commerciaux, pas le commercial lui-même.
- `formateur-informatique` → « Formateur Applicatif ». Silkhom décrit un formateur qui apprend aux utilisateurs à se servir d'un logiciel, pas un formateur qui enseigne l'informatique. La note v1.0 le signalait déjà.
- `ingenieur-support-applicatif` → « Ingénieur Support ». La ligne Silkhom figure dans le domaine infrastructure et concerne le support N1/N2 du poste informatique, pas d'un logiciel métier.

Aucun de ces quatre métiers n'était en `bonne` : leur fiabilité ne change pas. Chacun reçoit une `fiabilite_note` limitée à Silkhom.

### Notes de fiabilité
- Notes corrigées parce que les nouvelles données les contredisent : `test-manager` (« pas de ligne Silkhom dédiée »), `ingenieur-informatique-industrielle` (« pas de ligne Silkhom équivalente ») et `devrel` (« aucun chiffre fiable trouvé »). Elles disent désormais que le salaire Silkhom vient d'un rapprochement.
- Notes v1.0 portant uniquement sur Silkhom, réémises **à l'identique** : `cloud-finops`, `platform-engineer`, `admin-systemes-reseaux`, `analyste-soc`, `ingenieur-reseaux`, `devsecops`, `ingenieur-iam`, `scrum-master`. Dès qu'un autre chantier écrit une note, la fusion remplace la note v1.0 par la jonction des notes des chantiers. Sans cette réémission, la note Silkhom de `cloud-finops` disparaissait déjà avec `apec.json`. Seul, ce chantier ne change rien pour ces huit métiers.

## Cas douteux

1. **`cloud-finops` et `platform-engineer` : pas de rapprochement déclaré, contrairement à ce que demandait le brief.** Silkhom publie bien des lignes dédiées, « Cloud FinOps » et « Platform Engineer / Ingénieur Kubernetes ». Chacune a sa grille sur la page, sa fiche (p. 152–155 du PDF) et sa moyenne (52,8 k€, nouveau poste, p. 99). Les chiffres v1.0 sont ceux de ces lignes. Ils sont identiques à ceux de DevOps, mais c'est Silkhom qui les a alignés, pas la v1.0. Déclarer `"de": "Ingénieur DevOps"` ferait croire à l'étudiant qu'il n'existe pas de ligne dédiée. Le `rapprochement` reste donc `null`, et les notes v1.0 « alignée sur DevOps » et « même grille que DevOps » restent exactes. Indice que Silkhom a cloné la ligne : sur la page, l'« Objectif du Platform Engineer » reprend mot pour mot celui du Cloud FinOps. Si Adrien préfère malgré tout un rapprochement, il suffit d'ajouter `salaires.silkhom.rapprochement` pour ces deux métiers, sans toucher à leur fiabilité (`faible` et `moyenne`).
2. **`dev-backend`, moyenne laissée vide.** Le bloc regroupe 5 lignes sans ligne principale : Java 45,0 (−1,1 %), Python 45,0 (−1,1 %), PHP 43,2 (−0,2 %), .Net 44,4 (−0,4 %), Backend JS 45,4 (−1,5 %) (p. 45). En choisir une serait arbitraire, et en faire la moyenne reviendrait à fabriquer un chiffre. Option possible : 45,0 / −1,1, puisque Java et Python ont des valeurs identiques et que le BDM les présente comme « les profils les plus courants ».
3. **`dev-mobile-multiplateforme`, moyenne laissée vide.** Flutter 54,2 (nouveau poste) et React Native 45,4 (+0,2 %) (p. 90) sont trop éloignés pour qu'un seul chiffre convienne.
4. **`ux-designer`**. La moyenne affichée est celle de « UI / UX Designer » (43,5), qui est la `ligne` du bloc. Les autres grilles du bloc ont des moyennes plus hautes : UX Researcher 49,9, Product Designer 53,7.
5. **`ingenieur-informatique-industrielle`**. L'autre candidat était « Ingénieur Mécatronique » (PDF seulement : 44,4 k€, +3,6 %). Sa fiche cite « Automatisme / PLC », mais c'est un métier de conception mécanique et électronique (CAO, prototypes). J'ai retenu la ligne ERP/MES parce que la fiche du métier est centrée sur le logiciel. La ligne Mécatronique n'est pas sur la page web : sa grille ne serait sourcée que par le PDF.
6. **`ingenieur-avant-vente` et `ingenieur-affaires-it` partagent la ligne « Ingénieur Commercial ».** Par sa description, elle correspond mieux à l'avant-vente ; par son libellé, à l'ingénieur d'affaires. Je l'ai déclarée en rapprochement pour les deux, par prudence. `ingenieur-avant-vente` passe donc de `bonne` à `moyenne`.
7. **`devrel` rapproché du Technical Writer.** C'est le rapprochement le plus lâche : un DevRel est souvent un ancien développeur et donne des conférences. Je l'ai gardé parce que la spec réserve le n.d. aux cas où aucun rapprochement n'a de sens, et que la raison affichée reste honnête. La fiabilité reste `nd`.
8. **`formateur-informatique` : la note perd sa partie Apec.** La note v1.0 était « ligne Silkhom « formateur applicatif » et Apec cadres salariés seulement ». Ma note ne parle que de Silkhom, et `apec.json` n'écrit pas de note pour ce métier : après fusion, « Apec cadres salariés seulement » disparaît. À réémettre côté Apec, ou à réintégrer à la main. Le même risque existe pour toute note v1.0 mixte (`ingenieur-cybersecurite`, `pentester` : partie Cigref), si un chantier écrit une note pour ces métiers.
9. **Les tranches d'expérience diffèrent entre la page et le PDF.** La page donne en général 0–2 / 2–5 / + 5 ans, le PDF 0–3 / 3–7 / 7 ans et + pour les mêmes montants (par exemple Ingénieur QA). La v1.0 suit la page, qui est l'URL de `silkhom-it-2026`, et les nouveaux blocs aussi. Ce n'est pas une proposition de changement, mais à savoir.
10. **Silkhom n'est pas cohérent d'un support à l'autre.** Le palmarès de la page et le tableau du PDF donnent des variations légèrement différentes : Data Scientist +11,8 % contre +11,9 %, Data Engineer +10,2 % contre +10,1 %, Ingénieur Production +3,7 % contre +3,6 %, Analyst SOC +3,9 % contre +4,0 %. Le texte d'introduction donne encore d'autres chiffres (+11,4 %, +10,4 %). Les « variations globales » des pages métier diffèrent aussi des tableaux (par exemple Ingénieur Cybersécurité −7,7 % contre −8,8 %). Ces métiers ne font pas partie des 37 et sont déjà vérifiés en v1.0 sur la page : je n'y ai pas touché. Les tableaux de synthèse sont la seule présentation « moyenne + variation » ; je les ai utilisés partout.
11. **Lead Developer**. La couche texte du PDF indique « n/d » en variation, l'image « Nouveau poste » : `variation_pct` reste `null` dans les deux cas.

## Propositions de changement de chiffres

Aucune. Les 25 moyennes v1.0 non vérifiées ont été retrouvées à l'identique dans le tableau de synthèse Silkhom (même moyenne, et même variation quand la v1.0 en donnait une). Aucune moyenne n'a dû être retirée. Aucun chiffre de grille v1.0 n'a été contredit pour les métiers traités. Les écarts entre supports Silkhom (cas douteux 9 et 10) ne touchent que des valeurs déjà sourcées par la page. Je ne les propose pas au changement.
