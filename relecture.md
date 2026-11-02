# Relecture des 36 fiches `a_relire` — `metiers.json` v1.1

Première passe faite après la fusion du 2026-11-02 : textes, codes ROME, parcours et salaires comparés au Cigref 2025, au ROME 4.0 (version 62), à Silkhom et à l'Apec. Aucun texte de `metiers.json` n'a été modifié.
Chaque point donne le champ, le problème, la correction proposée et la source, plus une recommandation (« Reco ») pour trancher vite. Les pages Cigref sont les numéros imprimés (page du PDF = numéro imprimé + 6).

**Appliquer tes décisions.** Corrige `metiers.json` à la main (y compris le quiz, qui vit désormais dans `metiers.json`), puis lance `python3 scripts/valider.py metiers.json`. Ne relance pas `fusionner.py` : il refuse désormais de tourner sur une v1.1 sans `--force`, car il réécrirait tes corrections avec le contenu de `recherche/`.

## Propositions de changement de chiffres

Rien n'est appliqué tant que tu n'as pas validé. Ces propositions viennent des notes des chantiers (`recherche/*.md`), des revues et de cette relecture ; la validation de la v1.0 (tâche 1) n'avait relevé aucun défaut. Sources : `apec-2025` (pages du PDF), `silkhom-it-2026` (page web, et PDF de l'étude complète pour les moyennes), ROME 4.0 v62 (fiches consultables sur `candidat.francetravail.fr/metierscope/fiche-metier/<code>`).

### Salaires Apec

**P1 · `ux-designer` · `salaires.apec`**
- Actuel : « Art, création et design », médiane 45, D1 35, D9 60, sans IDF, régions ni moins de 35 ans (rapprochement explicité en v1.1).
- Proposé : « Marketing digital », médiane 52, D1 37, D9 74 ; IDF 55/40/77 ; autres régions 46/35/67 ; moins de 35 ans 45 ; `rapprochement: null`, et retrait de la note Apec de `fiabilite_note`.
- Raison : l'Apec nomme « UX designer » dans la famille Marketing digital, pas dans Art, création et design. Conséquence : `ui-designer` reste à 45 et `ux-designer` passe à 52.
- Source : apec-2025 p. 90 et p. 39. **Reco : oui.**

**P2 · `product-manager` · `salaires.apec`**
- Actuel : « Gestion de projets informatiques », médiane 57, D1 41, D9 79 ; IDF 63/45/87 ; régions 52/39/73 ; moins de 35 ans 48.
- Proposé : « Marketing digital », mêmes chiffres qu'en P1, avec `rapprochement: null`.
- Raison : « Chef·fe de produit digital » est le seul métier produit nommé par l'Apec. Ce poste est plus marketing que le PM d'un éditeur logiciel.
- Source : apec-2025 p. 90 et p. 53. **Reco : non, à moins de vouloir aligner sur P1.** Le rapprochement actuel est déjà déclaré.

**P3 · `analytics-engineer` · `salaires.apec`**
- Actuel : « Big Data », médiane 54, D1 40, D9 98 ; IDF 58/42/112 ; régions 48/36/70 ; moins de 35 ans 48.
- Proposé : « Business intelligence et décisionnel », médiane 50, D1 39, D9 75 ; IDF 54/42/76 ; régions 47/37/59 ; moins de 35 ans 45. Le rapprochement est conservé.
- Raison : c'est la famille de son voisin `dev-bi`, et l'analytics engineer modélise l'entrepôt comme lui. Le chantier Apec n'a pas examiné cette famille. Le D9 de Big Data (98) est tiré par les data scientists.
- Source : apec-2025 p. 63 et p. 62. **Reco : oui.** À lire avec la fiche 10 : la famille Apec (BI) et le code ROME (M1811, Data engineer) sont deux axes distincts, les deux recommandations coexistent.

**P4 · `mlops` · `salaires.apec`**
- Actuel : « Big Data », médiane 54. Proposé : « Développement informatique », médiane 50, D1 38, D9 74 ; IDF 55/43/77 ; régions 46/36/67 ; moins de 35 ans 44.
- Raison : la spec citait cette famille en exemple. Le chantier a préféré Big Data pour que les quatre métiers IA partagent la même famille.
- Source : apec-2025 p. 62 et p. 64. **Reco : garder Big Data.**

**P5 · `engineering-manager` · `salaires.apec`**
- Actuel : « Direction informatique », médiane 77, D1 49, D9 130, les mêmes chiffres que `cto` et `dsi`. Proposé : « Direction en études, R&D », médiane 65 ; IDF 75 ; régions 61 ; moins de 35 ans 48.
- Raison : un EM encadre une équipe de développement ; il ne dirige pas une DSI. Mais la famille R&D concerne surtout l'industrie et le BTP.
- Source : apec-2025 p. 52 et p. 66. **Reco : garder.** La grille Silkhom de l'EM (moyenne 89,9) confirme ce niveau.

**P6 · `integrateur-web` · `salaires.apec`**
- Actuel : « Développement informatique » par rapprochement, médiane 50. Proposé : `null` (n.d.).
- Raison : le poste est souvent non cadre (Silkhom : 28–32 k€ en régions pour un junior). Une médiane de cadres à 50 k€ induit l'étudiant en erreur. La spec réserve le n.d. aux postes non cadres, comme `technicien-support`.
- Source : apec-2025 p. 64 ; Silkhom page, ligne Développeur Frontend ; spec, § Salaires. **Reco : n.d.**

**P7 · `ingenieur-support-applicatif` et `responsable-support-it` · `salaires.apec`**
- Actuel : « Production et maintenance informatique », médiane 58, D1 37, D9 99, par rapprochement.
- Problème : la médiane est tirée vers le haut par les responsables de production. Silkhom donne 42–60 k€ pour le responsable support et 40–55 pour l'ingénieur support. Aucune famille Apec ne décrit le support.
- Source : apec-2025 p. 55 ; Silkhom page. **Reco : garder les deux.** Le rapprochement et sa raison sont affichés, et le badge est déjà à `moyenne`.

**P19 · `chief-data-officer` · `salaires.apec`** (fiche `a_relire: false`, ajoutée par la revue finale)
- Actuel : « Big Data » en correspondance directe, médiane 54, D1 40, D9 98 ; IDF 58/42/112 ; régions 48/36/70 ; moins de 35 ans 48 ; `rapprochement: null`, badge `bonne`, aucune note.
- Problème : la grille Silkhom du CDO donne 100–115 k€ en régions dès le niveau confirmé (moyenne 129,6), et `dsi` et `cto` affichent 77, `engineering-manager` 77 aussi (par rapprochement). Un·e étudiant·e verrait le CDO payé comme un data analyst. La famille Big Data mélange data analysts, data scientists et directions des données.
- Option (a) : rattacher à « Direction informatique » par `rapprochement`, mêmes chiffres que `dsi` et `cto` : médiane 77, D1 49, D9 130 ; IDF 91/56/139 ; autres régions 65/46/96 ; moins de 35 ans 52. Badge `moyenne`.
- Option (b) : garder Big Data (54/40/98) avec la note « médiane de toute la famille Big Data, où le CDO côtoie data analysts et data scientists ; sous-estime nettement ce poste de direction », et badge `moyenne`.
- Source : apec-2025 p. 62 (Big Data) et p. 52 (Direction informatique) ; Silkhom page, ligne Chief Data Officer. **Reco : (a).** Même la médiane Direction informatique (77) reste sous la grille Silkhom du CDO, mais l'écart est cohérent avec les autres postes de direction.

### Salaires Silkhom et badges

**P8 · `devrel` · `fiabilite`, `salaires`**
- Actuel : badge `nd`, alors que deux salaires s'affichent. Silkhom est rapproché du Technical Writer (52,6) et l'Apec de Développement informatique (50). Les deux raisons se contredisent : l'une dit qu'on devient DevRel depuis le développement, l'autre prend la ligne du rédacteur technique.
- Proposé : badge `faible`. Pour l'Apec, deux options. (a) Garder Développement informatique : c'est le plus réaliste, puisque `depuis` cite `dev-backend` et `dev-fullstack`. (b) Passer à « Rédaction technique et documentation » (médiane 43, D1 33, D9 65), cohérent avec Silkhom mais plus bas.
- Source : apec-2025 p. 64 et p. 39 ; Silkhom page (Technical Writer). **Reco : badge `faible` + option (a)**, avec une `fiabilite_note` qui dit que les deux sources sont rapprochées de métiers voisins différents.

**P9 · `ingenieur-informatique-industrielle` · `salaires.silkhom`**
- Correction d'un argument du chantier Silkhom. Il affirmait que la ligne « Ingénieur Mécatronique » n'était pas sur la page web. C'est faux : la page la publie. Paris 36–42 / 38–48 / 45–65 ; régions 34–40 / 38–45 / 44–60 (0–2, 2–5, 5+ ans) ; moyenne 44,4 k€ (PDF p. 199).
- Actuel : ligne Développeur ERP/MES (Paris 40–45 / 45–60 / 60–70 ; moyenne 47,7).
- Source : Silkhom page, lignes « Ingénieur Mécatronique » et « Développeur (ERP / CRM / WMS / TMS / MES…) ». **Reco : garder ERP/MES.** La fiche est centrée sur le logiciel et le MES, alors que la mécatronique relève de la conception mécanique et électronique.

**P10 · `ingenieur-support-applicatif` · `salaires.silkhom`**
- Actuel : ligne « Ingénieur Support » (Paris 40–45 / 45–50 / 50–55 ; moyenne 44,9). Elle relève du domaine infrastructure et vise le support du poste de travail.
- Proposé : « Technicien Support Applicatif » (Paris 35–40 / 40–48 / 48–55 ; régions 25–28 / 28–36 / 36–40 ; moyenne 36,8, stable). Plus proche par l'objet (support d'un logiciel), mais d'un niveau inférieur.
- Source : Silkhom page ; PDF p. 162. **Reco : garder « Ingénieur Support »**, puisque la fiche décrit un poste d'ingénieur.

**P11 · `dev-backend` · `salaires.silkhom.moyenne_keur`**
- Actuel : `null`. Le bloc a 5 lignes sans ligne principale.
- Proposé : 45,0 / −1,1 % (Java et Python, mêmes valeurs). Les autres lignes : PHP 43,2, .Net 44,4, Backend JS 45,4.
- Source : Silkhom PDF p. 45. **Reco : laisser n.d.**, par cohérence avec `dev-mobile-multiplateforme` et P12.

**P12 · `dev-rust-systeme` · `salaires.silkhom.moyenne_keur`**
- Actuel : 70,8, qui est la moyenne de Rust seul (BDM et PDF). La fiche s'intitule « Rust / Go » et le bloc a deux grilles sans ligne principale. Go est à 54,6 (+0,9 %).
- Proposé : `null`, selon la règle appliquée à `dev-backend`. Autre option : garder 70,8 et nommer « Rust » comme ligne principale.
- Source : Silkhom PDF p. 45 ; bdm-2026. **Reco : `null`.** 70,8 k€ affiché sur une fiche d'entrée « Rust / Go » surestime ce qu'un junior Go peut attendre.

**P13 · `analyste-soc`, `ingenieur-production`, `scrum-master` · `salaires.silkhom.moyenne_keur`**
- Actuel : `null`, alors que `variation_pct` est rempli et `moyenne_verifiee` vaut `true` (état v1.0, hors des 37 moyennes traitées). La fiche affichera une variation sans moyenne.
- Proposé : Analyst SOC 44,6 (+4,0 % dans le PDF, +3,9 % sur la page) ; Ingénieur Production 52,0 (+3,6 % dans le PDF, +3,7 % sur la page) ; Scrum Master 49,1 (−7,0 %).
- Source : Silkhom PDF p. 99 (lue sur l'image) et p. 45. **Reco : remplir les moyennes et garder les variations de la page** (convention v1.0).

### Codes ROME et parcours

**P14 · `ingenieur-production` · `rome`** : M1810 → **M1884**.
- M1810 « Technicien d'exploitation informatique » est une fiche de technicien.
- M1884 a l'appellation « Ingénieur de production informatique » (bac+5). Le chantier ROME proposait M1878 « Responsable de la production informatique », mais c'est un poste d'encadrement.
- Source : ROME M1810, M1884, M1878. **Reco : M1884.**

**P15 · `ingenieur-reseaux` · `rome`** : M1804 → **M1802**.
- M1804 « Ingénieur télécoms et environnement » vise les réseaux d'opérateurs.
- M1802 a l'appellation « Ingénieur réseau informatique ».
- Source : ROME M1804, M1802. **Reco : M1802.**

**P16 · `ingenieur-support-applicatif` · `rome`** : M1802 → **M1871**.
- M1802 « Expert systèmes et réseaux » ne correspond pas.
- M1871 « Gestionnaire d'applications SI » (bac+3 à bac+5) couvre le support d'un logiciel métier.
- Alternatives : M1826, qui a l'appellation « Ingénieur support informatique » mais décrit la supervision d'un datacenter ; M1874.
- Source : ROME M1802, M1871, M1826, M1874. **Reco : M1871.**

**P17 · `responsable-support-it` · `rome`, `parcours`** : M1874 → **I1406**.
- M1874 « Spécialiste support » est annoncé à bac+5. Ça contredit `depuis: technicien-support`, un poste accessible à bac+2 dès le premier emploi (Cigref 5.2, p. 180).
- I1406 « Superviseur hot line en informatique » a l'appellation « Superviseur help desk en informatique ». Il est accessible à bac+2 ou bac+3, avec ITIL comme atout.
- Parcours à réécrire en conséquence, par exemple : « ROME : bac+2 à bac+3 en informatique, souvent après une expérience de technicien support ; une certification ITIL est un atout. »
- Source : ROME M1874, I1406 ; Cigref 5.2. **Reco : I1406.**

**P18 · `dev-backend` · `parcours`** (valeur v1.0)
- Actuel : « Cléor BFC (France Travail), métier M1805 : 80 % des salaires entre 1 800 et 4 100 € nets/mois ; 5 900 emplois… (chiffres du rapport, non revérifiés) ». C'est un chiffre de salaire et d'emploi, pas un parcours, et il cite M1805 alors que `rome` vaut M1855.
- Proposé : « ROME : bac+3 à bac+5 (licence pro, master ou diplôme d'ingénieur) ; Cigref : bac+2/3 ou ingénieur pour le profil Concepteur / développeur. »
- Source : ROME M1855 ; Cigref 3.2, p. 103. **Reco : oui.**

## Fiches, de la plus douteuse à la plus sûre

- Pointeur : `chief-data-officer` est `a_relire: false` et n'a pas de fiche ci-dessous, mais il est concerné par **P19** (salaire Apec).

### 1. `devrel` — Developer advocate
- `fiabilite`, `salaires` : badge `nd` alors que des chiffres s'affichent, et deux rapprochements incohérents entre eux → **P8**.
- `rome`, `parcours` : `null`, à juste titre. Aucune fiche ROME (pas d'appellation « advocate » ni « évangéliste ») et aucun profil Cigref. Rien à changer.

### 2. `dev-backend` — Développeur·se back-end
- `parcours` : statistique Cléor au lieu d'un parcours → **P18**.
- `source_texte_detail` : cite « ROME M1805 », alors que `rome` vaut M1855 (M1855 a l'appellation « Développeur back-end »). Correction : remplacer par M1855. Source : ROME M1855.
- `salaires.silkhom` : moyenne n.d. → **P11**.
- `source_texte: rapport` : voir T9.

### 3. `responsable-support-it` — Responsable support IT
- `rome`, `parcours` : bac+5 incohérent avec le passage depuis technicien support → **P17**.
- `salaires.apec` : médiane 58 probablement haute → **P7**.
- `salaires.silkhom` : la grille affiche un niveau « junior 0–2 ans » pour un poste d'encadrement. C'est la donnée Silkhom, mais l'étiquette « junior » sonnera faux à un étudiant. Correction : voir T6. Source : Silkhom page.

### 4. `ingenieur-informatique-industrielle` — Ingénieur·e informatique industrielle
- `salaires.silkhom` : argument du chantier à corriger, la ligne Mécatronique existe sur la page → **P9**.
- `rome` : H1208 « Automaticien en bureau d'études » est accessible à bac+3, et la plupart de ses appellations sont des postes de technicien, alors que le titre dit « Ingénieur·e ».
  - Aucune fiche ne colle mieux. M1806 a l'appellation « Intégrateur en informatique industrielle », mais c'est une fiche de consultant fonctionnel SI.
  - Reco : garder H1208 (automates et supervision sont le cœur des missions) et `parcours: null`. Source : ROME H1208, M1806.

### 5. `sre` — Site Reliability Engineer
- `type`, `depuis` : la fiche est un métier d'entrée sans origine. Pour le Cigref, le SRE est une évolution du DevOps « en fonction de son niveau de séniorité ». Correction : `type: evolution`, `depuis: ["ingenieur-devops"]`. Source : Cigref 3.6 DevOps, p. 123.
- `parcours` : `null`, alors que le Cigref en décrit un. Proposition : « Cigref : évolution du profil DevOps, lui-même accessible après un début de carrière de développeur ou d'administrateur systèmes (bac+2/3 avec expérience, ou ingénieur). » Source : Cigref 3.6, p. 122-123.
- `roadmap_url` : lien vers `devops`, limite → T5.

### 6. `analyste-soc` — Analyste SOC
- `parcours` : « des certifications de sécurité comme CISSP ou GIAC sont couramment demandées » reprend fidèlement le ROME. Mais le CISSP exige 5 ans d'expérience professionnelle : pour un étudiant de B2, la phrase décrit une barrière d'entrée qui n'existe pas pour un premier poste. Correction : « des certifications en sécurité sont un plus ». Source : ROME M1883 ; isc2.org/certifications/cissp (« five years of cumulative, paid work experience »).
- `salaires.silkhom` : variation sans moyenne → **P13**.

### 7. `dev-rust-systeme` — Développeur·se Rust / Go
- `salaires.silkhom` : la moyenne 70,8 vaut pour Rust seul → **P12**.
- `fiabilite_note` (`null`) : la grille Rust démarre à 40–55 k€ en régions pour 0–3 ans, contre 40–45 pour Go. Silkhom explique ce niveau par la rareté des profils. Correction : ajouter « chiffres Rust tirés par la rareté du profil ; Go plus proche du back-end classique ». Source : Silkhom page (introduction, grilles Rust et Go).
- `parcours` : générique (« la fiche est générale ») → T3.
- `roadmap_url` : `rust`, alors que `golang` existe aussi → T5.

### 8. `integrateur-web` — Intégrateur·rice web / accessibilité
- `salaires.apec` : médiane de cadres pour un poste souvent non cadre → **P6**.
- `parcours` : « bac+3 à bac+5 » (fiche Développeur web) paraît haut pour un intégrateur → T4.

### 9. `dev-jeu-video` — Développeur·se jeu vidéo (Unity)
- `salaires.apec` : correspondance directe avec Développement informatique, médiane 50, la même que tous les développeurs. Ce chiffre contredit `a_eviter_si` (« le secteur paie moins »), que Silkhom confirme pourtant (Unity 41,9, −4,1 %). L'Apec n'isole pas le jeu vidéo.
- Correction : déclarer un `rapprochement`, par exemple « L'Apec ne distingue pas le jeu vidéo : ce chiffre vaut pour tous les développeur·ses. » Le badge reste `moyenne`, aucun chiffre ne change. Source : apec-2025 p. 64 ; chantier Apec, cas douteux.

### 10. `analytics-engineer` — Analytics engineer
- `salaires.apec` : Big Data plutôt que Business intelligence (famille de `dev-bi`) → **P3**.
- `rome` : le chantier hésitait entre M1811 (Data engineer) et M1824 (Développeur décisionnel). Reco : garder M1811, puisque les transformations sous dbt relèvent de l'ingénierie des données. `parcours: null` est justifié. Source : ROME M1811, M1824.
- Cohérence avec **P3** : les deux recommandations coexistent. La famille Apec (BI, pour le salaire) et le code ROME (M1811, pour la fiche métier) sont deux axes différents : l'Apec classe le poste par famille de rémunération, le ROME par contenu du métier. Si tu acceptes P3 (famille BI parce qu'il modélise l'entrepôt comme `dev-bi`) tout en gardant M1811, il n'y a pas de contradiction. Si tu préfères aligner les deux sur la BI, il faudrait aussi passer le ROME à M1824.

### 11. `ingenieur-affaires-it` — Ingénieur·e d'affaires IT
- `fiabilite_note` : Silkhom ne mesure que le fixe, alors que `a_eviter_si` insiste sur la rémunération variable. Pour ce métier, l'écart entre le chiffre affiché et la paie réelle est le plus fort. Correction : ajouter « salaire fixe seulement ; la part variable peut être importante ». Source : `meta.unites` ; apec-2025, famille « Commerciaux dans l'informatique ».
- `salaires.silkhom.grilles[0].ligne` : « Ingénieur commercial » s'écrit sans majuscule ici, avec majuscule dans `rapprochement.de` et dans `ingenieur-avant-vente`. Correction : « Ingénieur Commercial ». Source : Silkhom page.

### 12. `lead-developer` — Lead developer
- `salaires.silkhom` : la grille commence par « junior 0–3 ans » pour un métier d'évolution (donnée Silkhom). L'étiquette sonnera faux → T6.
- `rome` : M1805 est générique et `parcours` reste `null` ; aucune fiche « lead dev » n'existe dans le ROME. Rien à changer.

### 13. `mlops` — Ingénieur·e MLOps
- `salaires.apec` : Big Data plutôt que Développement informatique → **P4** (reco : garder). Rien d'autre.

### 14. `dev-embarque` — Développeur·se logiciel embarqué
- `parcours` : « bac+5 » (fiche M1892, Ingénieur en informatique embarquée), alors que le titre dit « Développeur·se ». M1805 a l'appellation « Développeur systèmes embarqués », accessible de bac+2 à bac+5.
- Correction : garder M1892 et compléter le parcours, par exemple « … ; des postes de développeur systèmes embarqués s'ouvrent aussi dès bac+2/3 (fiche Développeur informatique) ». Source : ROME M1892, M1805.

### 15. `devsecops` — Ingénieur·e DevSecOps
- `type` : métier d'entrée. Pour le Cigref, le DevOps (qui intègre la sécurité) « fait suite à un début de carrière » de développeur ou d'administrateur. Le ROME M1827 l'ouvre directement à bac+5. À considérer : `type: evolution`, `depuis: ["ingenieur-devops", "dev-backend"]`. Source : Cigref 3.6, p. 122 ; ROME M1827.
- `parcours` : `null`. Le parcours Cigref du DevOps (voir `sre`) pourrait servir.

### 16. `platform-engineer` — Platform engineer
- `parcours` : `null`. Le Cigref décrit la gestion des plateformes (Kubernetes, cloud) comme une compétence clé du DevOps : même proposition de parcours que pour `sre`. Source : Cigref 3.6, p. 124.
- `salaires.silkhom` : grille identique à celle du DevOps, mais la ligne est dédiée. Le chantier n'a donc pas déclaré de rapprochement (chantier Silkhom, cas douteux 1). Reco : garder sans rapprochement.

### 17. `cloud-finops` — Cloud FinOps
- `rome` : M1879 (Ingénieur cloud computing) est un choix par défaut, car le FinOps n'a pas de fiche ROME. Rien de mieux.
- `parcours` : `null`, justifié. Le Cigref ne cite le FinOps que comme conseil du DevOps (p. 124). Même remarque Silkhom que pour `platform-engineer`.

### 18. `ui-designer` — UI designer
- `salaires.apec` : si P1 est accepté, `ui-designer` (45) et `ux-designer` (52) n'auront plus les mêmes chiffres. C'est cohérent avec le Cigref, qui présente l'UX comme une évolution du web designer. Rien à faire en dehors de P1. Source : Cigref 3.7 UX Designer, p. 127.

### 19. `dev-bdd` — Développeur·se base de données
- `rome` : M1894 est la fiche du DBA (même code que `dba`), mais elle a l'appellation « Ingénieur bases de données ». Reco : garder.
- `roadmap_url` : `sql` est une roadmap de compétence → T5.

### 20. `dev-mobile-multiplateforme` — Flutter / React Native
- `roadmap_url` : `flutter`, alors que `react-native` existe aussi → T5. La moyenne reste n.d. (deux lignes trop éloignées : 54,2 et 45,4), à juste titre.

### 21. `ingenieur-cloud` — Ingénieur·e cloud
- `roadmap_url` : `cloud-computing`, roadmap généraliste → T5. Rien d'autre.

### 22. `dev-legacy-cobol` — Développeur·se Cobol / mainframe
- `parcours` : générique (« la fiche est générale et ne décrit pas de parcours propre à Cobol ») → T3.

### 23. `formateur-informatique` — Formateur·rice en informatique
- `parcours` : « ROME (fiche Formateur) » ; la fiche K2111 a l'appellation « Formateur informatique ». Correction : « ROME (fiche Formateur, appellation formateur informatique) : … ». Source : ROME K2111.
- `salaires.silkhom.rapprochement.de` : « Formateur Applicatif » (majuscule), alors que la ligne de la grille Silkhom est « Formateur applicatif ». Reco : aligner la casse sur la grille (« Formateur applicatif »).

### Fiches sans problème propre
- `ingenieur-iam` : rien à signaler. M1817 est le code le moins éloigné, aucune fiche ROME ne traite de l'IAM.
- `dev-fullstack` : rien à signaler (voir T4 sur le niveau d'études).
- `dev-frontend` : rien à signaler (voir T4).
- `dev-android` : rien à signaler (voir T3 sur la mention « fiche générale »).
- `dev-ios` : rien à signaler (voir T3).
- `dev-ia-embarquee` : rien à signaler.
- `dev-bi` : rien à signaler.
- `ingenieur-ia-generative` : rien à signaler.
- `ml-engineer` : rien à signaler.
- `ingenieur-computer-vision` : rien à signaler.
- `ingenieur-avant-vente` : rien à signaler.
- `technical-writer` : rien à signaler.
- `cto` : rien à signaler.

## Points transverses

**T1 · Quiz (`quiz`, « rédigé, à relire »)**. Remarques des revues, pas encore traitées :
- q01d et q06d : « problème d'environnement » vaut `qualite-archi` 2 + `infra-cloud` 1 en q01d, mais `infra-cloud` 2 en q06d. Harmoniser, par exemple `infra-cloud` 2 dans les deux cas.
- q02a : « ce qu'elle faisait » genre la personne de la famille, alors que l'énoncé dit « une personne ». La formulation tient ; vérifier que c'est voulu.
- q03c (pitch, + `management` 1) et q08a (tableau pour/contre → `data-ia` 2) : pondérations discutables. Pour q08a, `produit-design` ou `management` sont plausibles.
- q04a : « un petit jeu ou une appli » ; élargir à « un bot Discord, une petite API » pour parler aux profils back-end.
- q07b : réponse universelle (tout le monde s'inquiète d'un passager clandestin), elle discrimine peu.
- q09 : seule question sur l'alternance, alors que tous les B2 n'en ont pas fait. Ajouter « (ou de stage) » ou « imagine… ».
- q11c : l'accessibilité donne `developpement` 2 ; elle relève plutôt de `produit-design`.
- q12d : « pour être prêt·es tous les deux » mêle inclusif et masculin ; préférer « pour que chacun·e soit prêt·e à l'oral ».
- q13 : « C'est plutôt sur… » est oral, préférer « Elle porte plutôt sur… ». q13d est bancale, préférer « comment quelqu'un a fait grandir une petite équipe tech jusqu'à une grande entreprise ».
- q16b : réponse « morale », que tout le monde choisira. q16d (des semaines sans chiffre d'usage) décrit une situation peu étudiante.
- Équilibre des branches : `developpement` et `management` apparaissent dans 11 réponses, quatre branches dans 9. En répondant au hasard, l'attendu va de 4,25 à 4,75 points selon la branche, soit un écart d'environ 12 %. Aucun changement proposé ; à savoir si tu veux rééquilibrer.

**T2 · Préfixes de `parcours`**. Sur les 18 parcours v1.0, 17 commencent par « Cigref : » (le 18ᵉ est celui de `dev-backend`, voir P18) ; les 37 de la v1.1 par « ROME (fiche X) : » (26) ou « Cigref (profil X) : » (8), plus 3 par « Cigref : ». Reco : harmoniser en « ROME : » / « Cigref : » et déplacer le nom de la fiche dans `source_texte_detail`, ou bien adopter le format long partout.

**T3 · Parcours génériques**. Pour `dev-legacy-cobol` et `dev-rust-systeme`, la phrase dit elle-même qu'elle ne décrit pas de parcours propre. Reco : `null`, ou réécrire sans la mention, par exemple « ROME : bac+2 à bac+5 en informatique ». La même mention (« la fiche est générale, sans parcours propre à… ») figure dans `dev-android`, `dev-ios` et `dev-mobile-multiplateforme` : la retirer.

**T4 · Niveau d'études des fiches de développement web**. `dev-backend`, `dev-fullstack`, `dev-frontend` et `integrateur-web` suivent le ROME M1855 : « bac+3 à bac+5 ». Le Cigref 3.2 (Concepteur / développeur) indique « bac+2/3 ou ingénieur », et le ROME M1805 cite le titre professionnel Développeur web et web mobile (bac+2). Pour des B2, « bac+3 minimum » décourage à tort. Reco : ajouter la mention Cigref aux quatre parcours. Source : Cigref 3.2, p. 103 ; ROME M1855, M1805.

**T5 · Liens roadmap.sh limites, à confirmer un par un**
- `dba` → `postgresql-dba` : page propre à PostgreSQL, alors que la fiche cite aussi Oracle et SQL Server.
- `dev-bdd` → `sql` : roadmap de compétence, pas de métier.
- `ingenieur-cloud` → `cloud-computing` : roadmap généraliste.
- `dev-mobile-multiplateforme` → `flutter`, alors que `react-native` existe.
- `dev-rust-systeme` → `rust`, alors que `golang` existe.
- `sre` → `devops` : la page s'intitule « DevOps Engineer or SRE ».

Source : chantier roadmap, cas douteux.

**T6 · Tranches d'expérience Silkhom**
- La page donne 0–2 / 2–5 / 5+ ans et le PDF 0–3 / 3–7 / 7+ pour les mêmes montants. La v1.0 et la v1.1 suivent la page.
- Sur la page elle-même, les nouvelles lignes (Rust, Lead Developer, Technical Writer, IA) utilisent 0–3 / 3–7 / 7+ : deux fiches voisines peuvent afficher des tranches différentes.
- Pour les métiers d'évolution (`lead-developer`, `responsable-support-it`), l'étiquette « junior » sonne faux. Reco : afficher les années plutôt que « junior / confirmé / senior » (décision côté app).
- Les variations diffèrent aussi légèrement entre la page et le PDF (Analyst SOC +3,9 / +4,0 %).
- Source : Silkhom page et PDF ; chantier Silkhom, cas douteux 9 et 10.

**T7 · `moyenne_source` hétérogène**. 26 blocs v1.0 vérifiés gardent un texte libre (« BDM », « page Silkhom IA », « BDM (Rust) », « BDM / page Silkhom »…) au lieu d'un `id` de `sources[]`. Reco : normaliser en `bdm-2026`, `silkhom-ia-2026` ou `silkhom-it-2026`. Aucun chiffre ne change.

**T8 · Badge et rapprochements croisés**. `ingenieur-avant-vente` est passé de `bonne` à `moyenne`, parce que son salaire Silkhom est désormais déclaré rapproché (« Ingénieur Commercial »). C'est le seul badge modifié par la fusion. À valider.

**T9 · `source_texte: "rapport"`**. Sept fiches (`dev-legacy-cobol`, `dev-rust-systeme`, `dev-backend`, `dev-bdd`, `dev-fullstack`, `dev-frontend`, `integrateur-web`), toutes à relire, citent le rapport de recherche interne, qui n'est pas dans `sources[]`. Reco : les réattribuer à « rédaction », ou au Cigref 3.2 quand le texte en est proche.

## Décisions d'Adrien (02/11/2026)

Toutes les décisions ci-dessous sont appliquées dans `metiers.json` (quiz compris) ; `python3 scripts/valider.py metiers.json` passe.

### Propositions de changement de chiffres
- **P1** `ux-designer` : famille « Marketing digital » (52/37/74 ; IDF 55/40/77 ; régions 46/35/67 ; moins de 35 ans 45), `rapprochement: null`, note Apec retirée de `fiabilite_note`.
- **P2** `product-manager` : on garde « Gestion de projets informatiques ».
- **P3** `analytics-engineer` : famille « Business intelligence et décisionnel » (50/39/75 ; IDF 54/42/76 ; régions 47/37/59 ; moins de 35 ans 45), rapprochement conservé (de : BI).
- **P4** `mlops` : on garde Big Data.
- **P5** `engineering-manager` : on garde Direction informatique.
- **P6** `integrateur-web` : `salaires.apec` à `null` (n.d.), note Apec retirée, `fiabilite_note` signale un poste souvent non cadre.
- **P7** `ingenieur-support-applicatif` et `responsable-support-it` : on garde.
- **P8** `devrel` : badge `faible`, Apec gardé en Développement informatique, `fiabilite_note` sur les deux rapprochements différents (Silkhom : technical writer ; Apec : développement).
- **P9** `ingenieur-informatique-industrielle` : on garde ERP/MES.
- **P10** `ingenieur-support-applicatif` : on garde « Ingénieur Support ».
- **P11** `dev-backend` : moyenne Silkhom laissée n.d.
- **P12** `dev-rust-systeme` : `moyenne_keur` à `null` ; `variation_pct` était déjà `null` ; `moyenne_verifiee` et `moyenne_source` passent à `null`, comme pour `dev-backend`.
- **P13** `analyste-soc` 44,6, `ingenieur-production` 52,0, `scrum-master` 49,1 : moyennes remplies, variations de la page gardées, `moyenne_source: silkhom-it-2026`.
- **P14** `ingenieur-production` : ROME M1884.
- **P15** `ingenieur-reseaux` : ROME M1802.
- **P16** `ingenieur-support-applicatif` : ROME M1871.
- **P17** `responsable-support-it` : ROME I1406, parcours réécrit (bac+2 à bac+3, après technicien support, ITIL en atout).
- **P18** `dev-backend` : parcours « ROME : bac+3 à bac+5 (…) ; Cigref : bac+2/3 ou ingénieur pour le profil Concepteur / développeur. »
- **P19** `chief-data-officer` : Direction informatique par rapprochement (77/49/130 ; IDF 91/56/139 ; régions 65/46/96 ; moins de 35 ans 52), badge `moyenne`, note Apec.

### Fiches
- `sre` : `type: evolution`, `depuis: [ingenieur-devops]`, parcours Cigref (évolution du DevOps).
- `devsecops` : `type: evolution`, `depuis: [ingenieur-devops, dev-backend]`, même parcours Cigref.
- `platform-engineer` : même parcours Cigref ; son type était déjà `evolution`, pas d'incohérence.
- `dev-backend` : `source_texte_detail` M1805 → M1855.
- `analyste-soc` : « des certifications en sécurité sont un plus » remplace la mention CISSP/GIAC.
- `dev-rust-systeme` : `fiabilite_note` « chiffres Rust tirés par la rareté du profil ; Go plus proche du back-end classique ».
- `dev-jeu-video` : rapprochement Apec déclaré (Développement informatique, le jeu vidéo n'est pas distingué), note ajoutée, badge `moyenne` inchangé.
- `ingenieur-affaires-it` : `fiabilite_note` complétée (« salaire fixe seulement ; la part variable peut être importante ») ; ligne Silkhom « Ingénieur Commercial ».
- `dev-embarque` : parcours complété (postes de développeur systèmes embarqués dès bac+2/3).
- `formateur-informatique` : rapprochement Silkhom « Formateur applicatif ».
- `analytics-engineer` : on garde ROME M1811.

### Points transverses
- **T1** quiz : poids q01d → `infra-cloud` 2 (comme q06d) ; q11c → `produit-design` 2 + `developpement` 1 ; q08a → `produit-design` 2 + `data-ia` 1 ; q03c sans `management`. Textes q04a, q07b, q09, q12d, q13, q13d, q16b et q16d reformulés. Rééquilibrage, **à valider** (q01b et q14c restent `produit-design` 2 + `management` 1) : q01c → `relation-transmission` 2 + `produit-design` 1 ; q10d → `developpement` 2 seul ; q13a → `qualite-archi` 2 + `infra-cloud` 1 ; q15a → `relation-transmission` 2 + `management` 1 ; q16b → `management` 2 + `relation-transmission` 1 ; q08c → `data-ia` 2 + `produit-design` 1, avec un nouveau texte (« tu fais un mini-sondage auprès de personnes qui pourraient s'en servir, et tu regardes ce qui en ressort »). Écart des scores maximaux 5,9 %, écart attendu au hasard 11,7 %.
- **T2** : tous les parcours commencent par « ROME : » ou « Cigref : » ; le nom de la fiche ou du profil est passé dans `source_texte_detail`.
- **T3** : mention « fiche générale » retirée des parcours de `dev-legacy-cobol`, `dev-rust-systeme`, `dev-android`, `dev-ios`, `dev-mobile-multiplateforme`.
- **T4** : « Cigref : bac+2/3 ou ingénieur » ajouté à `dev-fullstack`, `dev-frontend`, `integrateur-web` (et `dev-backend` par P18).
- **T5** : on garde `dba`, `dev-bdd`, `ingenieur-cloud`, `sre` ; `roadmap_url` retiré de `dev-mobile-multiplateforme` et `dev-rust-systeme` (29 liens sur 68).
- **T6** : l'app affiche les années d'expérience (« 0–2 ans »), pas « junior / confirmé / senior » (règle ajoutée à la PRD).
- **T7** : `moyenne_source` normalisé en `bdm-2026`, `silkhom-it-2026` ou `silkhom-ia-2026`.
- **T8** : badge `moyenne` d'`ingenieur-avant-vente` validé.
- **T9** : `source_texte: rapport` réattribué : `dev-backend` → `cigref` (profil 3.2, rapprochement) ; les six autres → `redaction`.

### Salaires cibles et relecture
- Les salaires sont présentés comme des salaires cibles, pas des salaires de sortie d'études : `meta.unites`, `meta.mentions` et PRD (fiche métier, règles d'affichage) le disent.
- Les 36 fiches `a_relire` passent à `false`.
