# Recherche roadmap.sh (2026-11-02)

Méthode : liste des roadmaps lue sur https://roadmap.sh/roadmaps, puis chaque URL retenue chargée (HTTP 200). Un slug inexistant renvoie 404 (testé : `/sre`, `/platform-engineer`, `/soc-analyst`, `/pentester`). 31 métiers liés, 37 laissés à `null`.

## Choix faits

- Correspondance directe rôle à rôle : dev-backend (backend), dev-fullstack (full-stack), dev-frontend (frontend), dev-android (android), dev-ios (ios), dev-jeu-video (game-developer), ingenieur-devops (devops), devsecops (devsecops), ingenieur-reseaux (network-engineer), ingenieur-cybersecurite (cyber-security), data-analyst, data-engineer, data-scientist (ai-data-scientist), ml-engineer (machine-learning), mlops, ingenieur-ia-generative (ai-engineer), architecte-logiciel (software-architect), product-manager, ux-designer (ux-design), devrel, technical-writer, engineering-manager.
- ingenieur-qa-automatisation et testeur-fonctionnel : la page `qa` couvre test manuel et automatisé, donc les deux.
- sre : la page `devops` s'intitule « DevOps Engineer or SRE » ; il n'y a pas de page `/sre`.
- ingenieur-systemes-linux : page `linux` (compétence centrale du poste).
- Sans page : dev-legacy-cobol, dev-ia-embarquee, dev-embarque, ingenieur-informatique-industrielle, ingenieur-iam, ingenieur-computer-vision, analytics-engineer, cloud-finops, architecte-entreprise, rssi, tous les postes de gestion de projet, de support, de vente, de formation, de direction (cto, dsi, chief-data-officer), scrum-master, product-owner, lead-developer, consultant-erp.

## Cas douteux

Liés mais à relire :
- dba -> `postgresql-dba` : la page est spécifique à PostgreSQL ; la fiche cite aussi Oracle et SQL Server. Le contenu (sauvegarde, réplication, optimisation, sécurité) colle au métier. À supprimer si Adrien veut un lien strictement générique.
- dev-bdd -> `sql` : roadmap de compétence, pas de rôle ; SQL est le coeur du métier (PL/SQL non couvert).
- ingenieur-cloud -> `cloud-computing` : roadmap généraliste, la fiche vise AWS/Azure/GCP. Pas d'`aws` retenu car la fiche est multi-fournisseurs.
- dev-mobile-multiplateforme -> `flutter` : la fiche cite Flutter ou React Native ; un seul lien possible, `react-native` existe aussi.
- dev-rust-systeme -> `rust` : la fiche dit « Rust / Go » ; `golang` existe aussi.

Laissés à `null` malgré une page proche :
- platform-engineer : `kubernetes` est un outil, pas le métier ; la page ne couvre pas la plateforme interne (Helm, GitOps) et `/platform-engineer` n'existe pas (404). Lien retiré au tour 1 de correction.
- analyste-soc, pentester, rssi : seule `cyber-security` (généraliste) existe, jugée trop large pour ces postes.
- architecte-cloud : pas de page d'architecte cloud ; `software-architect` vise le logiciel, `cloud-computing` est un parcours d'apprentissage.
- dev-bi : `bi-analyst` décrit un rôle d'analyste, pas de construction d'entrepôts et d'ETL.
- ui-designer : `product-design` et `design-system` débordent ou ne couvrent qu'une partie.
- test-manager : `qa` est technique, pas du management de test. cto : `engineering-manager` est un poste différent.
- integrateur-web : seules `html`/`css` existent (compétences isolées, pas le métier).
- dev-embarque : `cpp`/`c` sont des langages, pas le métier. admin-systemes-reseaux, technicien-systemes-reseaux : `linux` et `network-engineer` ne couvrent qu'une moitié.
- product-owner, scrum-master : aucune page.

## Propositions de changement de chiffres

Aucune.
