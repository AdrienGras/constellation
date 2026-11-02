"""Jeu de données v1.1 minimal et valide, utilisé par les tests."""


def _silkhom(moyenne=42.2):
    """Bloc Silkhom complet : trois niveaux, tranches d'années qui se suivent."""
    return {
        "source": "silkhom.com/les-salaires-informatique-et-electronique (2026)",
        "ligne": None,
        "grilles": [
            {
                "ligne": None,
                "niveaux": [
                    {
                        "niveau": "junior",
                        "annees_min": 0,
                        "annees_max": 2,
                        "paris": [35, 42],
                        "grandes_villes": [30, 35],
                        "regions": [25, 30],
                    },
                    {
                        "niveau": "confirme",
                        "annees_min": 2,
                        "annees_max": 5,
                        "paris": [42, 52],
                        "grandes_villes": [35, 45],
                        "regions": [30, 38],
                    },
                    {
                        "niveau": "senior",
                        "annees_min": 5,
                        "annees_max": None,
                        "paris": [52, 70],
                        "grandes_villes": [45, 65],
                        "regions": [38, 50],
                    },
                ],
            }
        ],
        "moyenne_keur": moyenne,
        "variation_pct": -5.8 if moyenne is not None else None,
        "moyenne_verifiee": True if moyenne is not None else None,
        "moyenne_source": "silkhom-it-2026" if moyenne is not None else None,
        "rapprochement": None,
    }


def _apec():
    """Bloc Apec complet : médiane et déciles, avec zones."""
    return {
        "famille": "Développement informatique",
        "mediane": 50,
        "d1": 38,
        "d9": 74,
        "idf": {"mediane": 55, "d1": 43, "d9": 77},
        "autres_regions": {"mediane": 46, "d1": 36, "d9": 67},
        "moins_35_ans": {"mediane": 44},
        "rapprochement": None,
    }


def _metier(id_, categorie, type_, depuis, salaires, memes, autres):
    return {
        "id": id_,
        "categorie": categorie,
        "titre": f"Titre de {id_}",
        "type": type_,
        "depuis": depuis,
        "rome": "M1805",
        "brief": f"Brief de {id_}.",
        "missions": f"Missions de {id_}.",
        "competences": ["Python", "SQL"],
        "a_eviter_si": "Tu n'aimes pas apprendre.",
        "parcours": "Une licence puis une alternance.",
        "salaires": salaires,
        "fiabilite": "bonne",
        "fiabilite_note": None,
        "source_texte": "cigref",
        "source_texte_detail": "cigref-2025",
        "a_relire": False,
        "voisins_meme_categorie": memes,
        "voisins_autres_categories": autres,
        "roadmap_url": "https://roadmap.sh/backend",
    }


def donnees_valides():
    """Renvoie un jeu v1.1 valide, neuf à chaque appel."""
    return {
        "meta": {
            "version": "1.1",
            "genere_le": "2026-11-02",
            "nb_metiers": 3,
            "nb_liens": 2,
        },
        "categories": [
            {"id": "cat-a", "libelle": "Catégorie A", "nb": 2},
            {"id": "cat-b", "libelle": "Catégorie B", "nb": 1},
        ],
        "macro_branches": [
            {"id": "a", "libelle": "Branche A", "categories": ["cat-a"]},
            {"id": "b", "libelle": "Branche B", "categories": ["cat-b"]},
        ],
        "quiz": {
            "questions": [
                {
                    "id": "q01",
                    "intitule": "Projet de groupe, la veille du rendu. Tu es plutôt la personne qui…",
                    "reponses": [
                        {"id": "a", "texte": "cherche le bug", "poids": {"a": 2}},
                        {"id": "b", "texte": "prépare la démo", "poids": {"b": 2}},
                    ],
                },
                {
                    "id": "q02",
                    "intitule": "Un proche te demande de l'aide avec son ordinateur. Tu…",
                    "reponses": [
                        {"id": "a", "texte": "règles le problème", "poids": {"a": 1, "b": 1}},
                        {"id": "b", "texte": "expliques la marche à suivre", "poids": {"b": 2}},
                        {"id": "c", "texte": "installes un antivirus", "poids": {"a": 2}},
                    ],
                },
            ]
        },
        "metiers": [
            _metier(
                "metier-1", "cat-a", "entree", [],
                {"silkhom": _silkhom(), "apec": _apec()},
                ["metier-2"], ["metier-3"],
            ),
            _metier(
                "metier-2", "cat-a", "entree", [],
                {"silkhom": _silkhom(None), "apec": None},
                ["metier-1"], [],
            ),
            _metier(
                "metier-3", "cat-b", "evolution", ["metier-1"],
                {"silkhom": _silkhom(), "apec": _apec()},
                [], ["metier-1"],
            ),
        ],
        "sources": [
            {"id": "silkhom-it-2026", "titre": "Baromètre Silkhom", "editeur": "Silkhom"},
            {"id": "cigref-2025", "titre": "Nomenclature Cigref", "editeur": "Cigref"},
        ],
    }
