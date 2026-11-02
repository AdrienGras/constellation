# Chantier ROME et parcours

Sources : ROME 4.0 version 62 (publiée le 19/10/2026, 1923 fiches), jeu « Toutes les données du ROME » de data.gouv.fr (Licence Ouverte), lu dans les fiches (intitulé, appellations, « accès au métier »). Nomenclature Cigref 2025 (PDF de `metiers.json`), lue en paraphrase ; les pages citées sont les numéros imprimés en tête de page.

Résultat : `rome` rempli pour 62 métiers sur 63 (seul `devrel` reste `null`) ; `parcours` rempli pour 37 des 50 métiers vides, 13 restent `null`.

## Choix faits

**Codes ROME.** Je choisis la fiche dont l'intitulé ou une appellation correspond au métier, puis la fiche dont la définition s'en rapproche le plus.
- Web : `dev-backend`, `dev-frontend`, `dev-fullstack` et `integrateur-web` vont tous en M1855 (Développeur web), dont les appellations listent littéralement back-end, front-end, full-stack et intégrateur web.
- Développement généraliste : `dev-legacy-cobol` et `dev-rust-systeme` en M1805 (aucune fiche ne cible Cobol ou Rust) ; `dev-android`, `dev-ios`, `dev-mobile-multiplateforme` en M1861 (Développeur logiciel ou d'application) ; `dev-jeu-video` M1831 ; `dev-embarque` M1892 ; `dev-ia-embarquee` M1873.
- Bases de données : `dba` et `dev-bdd` en M1894 (« Administrateur de bases de données » est une appellation de cette fiche).
- Infra : `admin-systemes-reseaux` M1801, `ingenieur-systemes-linux` M1802, `ingenieur-devops` M1827, `ingenieur-cloud` M1879, `architecte-cloud` M1860. `technicien-systemes-reseaux` et `technicien-support` en I1401 (Technicien de maintenance en informatique), seule fiche dont les appellations couvrent à la fois systèmes, réseaux, postes et help desk.
- Sécurité : `analyste-soc` M1883, `ingenieur-cybersecurite` M1856, `pentester` M1866, `rssi` M1812.
- Données et IA : `data-analyst` M1419, `data-scientist` M1405, `data-engineer` M1811, `dev-bi` M1824, `chief-data-officer` M1423 (ces quatre codes hors famille M18 existent bien dans ROME 4.0). `ml-engineer` M1889 (appellation « Ingénieur machine learning »).
- Architecture, gestion de projet et produit : `architecte-entreprise` M1838 (Urbaniste SI), `architecte-logiciel` M1818 (appellation « Architecte logiciel »), `chef-projet-technique` M1859, `directeur-projet` M1870, `scrum-master` M1814, `product-owner` M1864, `product-manager` M1703 (appellation « Product manager », fiche située hors famille M18), `engineering-manager` M1844 (appellation « Responsable des développements informatiques »), `cto` M1803 (appellation « Chief Technical Officer - CTO »).
- Test : `ingenieur-qa-automatisation`, `test-manager`, `testeur-fonctionnel` en M1815.
- Autres : `ui-designer` et `ux-designer` E1206 ; `consultant-erp` M1813 (appellations « Consultant ERP », « Paramétreur de logiciels ») ; `ingenieur-avant-vente` M1823 ; `ingenieur-affaires-it` D1407 (appellation « Ingénieur d'affaires BtoB ») ; `formateur-informatique` K2111 (appellation « Formateur informatique ») ; `technical-writer` H1207 (appellation « Rédacteur technique en informatique »).
- Les 5 codes déjà présents (M1810 `ingenieur-production`, M1804 `ingenieur-reseaux`, M1806 `business-analyst-amoa`, M1802 `ingenieur-support-applicatif`, M1803 `dsi`) ne sont pas touchés.

**Parcours.**
- Cigref d'abord quand la fiche du métier renvoie déjà à un profil Cigref (`source_texte_detail`) et que ce profil décrit un parcours : 11 métiers. Ils sont reformulés, pas recopiés. Les pages sont les numéros imprimés.
- ROME (rubrique « accès au métier ») pour les métiers dont le code ROME est solide : 26 métiers. Le texte nomme la fiche utilisée. Quand la fiche est générale (Cobol, Rust, Android, iOS, Flutter, technico-commercial), la phrase le dit.
- `pentester` et `architecte-cloud` utilisent ROME plutôt que le Cigref : la fiche ROME porte le nom exact du métier, alors que le rattachement Cigref de la v1.0 est approximatif (6.2 Auditeur SSI) ou un rapprochement (4.9 Architecte technique).
- `null` quand aucune source ne décrit le parcours (voir Cas douteux).

## Cas douteux

Codes ROME à relire (rapprochement par défaut, aucune fiche exacte) :
- `cloud-finops` M1879 : la fiche Ingénieur cloud computing cite l'optimisation des coûts cloud, mais le FinOps n'a pas de fiche propre. Parcours laissé `null`.
- `platform-engineer`, `sre`, `devsecops` M1827 (DevOps) : ROME ne connaît ni platform engineering, ni SRE, ni DevSecOps ; la fiche DevOps parle de pipelines, de disponibilité et de sécurité des infrastructures. Parcours `null`.
- `ingenieur-iam` M1817 : la fiche Administrateur sécurité informatique ne parle pas de gestion des identités et des accès. Aucune fiche n'en parle ; M1817 est le moins mauvais choix. Parcours `null`.
- `analytics-engineer` M1811 (Data engineer) ou M1824 (Développeur décisionnel) : hésitation entre les deux. Parcours `null`.
- `ingenieur-ia-generative`, `mlops`, `ingenieur-computer-vision` M1889 : ROME n'a qu'une fiche IA générale. Parcours `null`, car le diplôme décrit est celui d'un ingénieur IA généraliste.
- `lead-developer` M1805 : pas de fiche « lead dev » ; M1805 est la fiche développeur. Parcours `null`.
- `ingenieur-informatique-industrielle` H1208 (Automaticien en bureau d'études) : la fiche vise un niveau bac+3 et des techniciens, pas un ingénieur ; M1806 contient aussi l'appellation « Intégrateur en informatique industrielle ». Parcours `null`.
- `test-manager` M1815 : le Cigref 3.3 dit seulement que certains testeurs peuvent piloter une équipe ; le parcours du profil Testeur (bac+2/3 ou ingénieur débutant) ne décrit pas un test manager. Parcours `null`.
- `devrel` : aucune fiche ROME ni profil Cigref (pas d'appellation « developer advocate » ou « évangéliste »). `rome` et `parcours` restent `null`.
- `product-manager` M1703 : l'appellation « Product manager » y figure, mais la fiche M1703 (chef de produit, accès par le commerce ou le marketing) est plus marketing que le profil Cigref 2.8. M1864 (Product Owner) est une alternative.
- `dev-embarque` : M1892 (Ingénieur en informatique embarquée, bac+5) ou M1805 (qui a l'appellation « Développeur systèmes embarqués »). J'ai pris M1892 pour le contenu.
- `technicien-systemes-reseaux` I1401 : M1816 (Technicien réseaux informatiques et télécoms) ou M1810 sont des alternatives raisonnables.
- `responsable-support-it` M1874 : la fiche Spécialiste support (appellation « Superviseur hotline ») ; I1401 contient aussi « Chef d'équipe de help desk ».
- `engineering-manager` : parcours tiré de M1844 (bac+5) ; la fiche est plus proche d'un responsable d'applications que d'un manager d'équipes de développement. Le rapprochement Cigref 7.5 de la v1.0 ne décrit pas non plus un manager de développeurs, je ne l'ai pas utilisé.
- Les parcours ROME ne donnent que le niveau de diplôme et les certifications, pas la progression ; la progression n'est donnée que pour les parcours tirés du Cigref.
- Les pages Cigref sont les numéros imprimés (page PDF = numéro imprimé + 6).

## Propositions de changement de chiffres

Aucune valeur v1.0 non nulle n'est modifiée par le fichier JSON. Points à trancher par Adrien :

| Métier | Champ | Valeur actuelle | Valeur proposée | Raison | Source |
|---|---|---|---|---|---|
| ingenieur-production | rome | M1810 | M1878 | M1810 est « Technicien d'exploitation » (bac+2) ; M1878 « Responsable de la production informatique » (bac+5, ingénierie) est plus proche d'un·e ingénieur·e de production | ROME fiches M1810 et M1878 |
| ingenieur-reseaux | rome | M1804 | M1802 | M1804 est « Ingénieur télécoms et environnement » (réseaux opérateurs) ; M1802 a l'appellation « Ingénieur réseau informatique » | ROME fiches M1804 et M1802 |
| ingenieur-support-applicatif | rome | M1802 | M1871 (ou M1874) | M1802 est « Expert systèmes et réseaux » ; M1871 « Gestionnaire d'applications SI » correspond au support d'un logiciel métier | ROME fiches M1802, M1871, M1874 |
| dev-backend | parcours | « Cléor BFC (France Travail), métier M1805 : 80 % des salaires entre 1 800 et 4 100 € nets/mois ; 5 900 emplois… » | un parcours (diplôme, expérience) | Le texte actuel est un chiffre de salaire et d'emploi, pas un parcours ; il cite M1805 alors que le code ROME 4.0 proposé dans le JSON est M1855 (Développeur web, appellation « Développeur back-end »). Si Adrien préfère M1805, il faut changer `rome` de `dev-backend` | ROME fiches M1805 et M1855 |
