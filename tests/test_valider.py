import unittest

from scripts.valider import scores_max_quiz, valider
from tests.fixtures import donnees_valides


class TestValider(unittest.TestCase):
    def assertErreur(self, donnees, texte):
        erreurs = valider(donnees)
        self.assertTrue(
            any(texte in e for e in erreurs),
            f"aucune erreur ne contient {texte!r} : {erreurs}",
        )
        return erreurs

    def assertPasErreur(self, donnees, texte):
        erreurs = valider(donnees)
        self.assertFalse(
            any(texte in e for e in erreurs),
            f"une erreur contient {texte!r} : {erreurs}",
        )

    def test_donnees_valides_sans_erreur(self):
        self.assertEqual(valider(donnees_valides()), [])

    def test_reference_voisin_inconnue(self):
        d = donnees_valides()
        d["metiers"][0]["voisins_meme_categorie"].append("inexistant")
        self.assertErreur(d, "inexistant")

    def test_categorie_sans_macro_branche(self):
        d = donnees_valides()
        d["macro_branches"][1]["categories"] = []
        self.assertErreur(d, "cat-b")

    def test_categorie_dans_deux_macro_branches(self):
        d = donnees_valides()
        d["macro_branches"][1]["categories"].append("cat-a")
        self.assertErreur(d, "cat-a")

    def test_silkhom_min_superieur_max(self):
        d = donnees_valides()
        niveau = d["metiers"][0]["salaires"]["silkhom"]["grilles"][0]["niveaux"][0]
        niveau["regions"] = [40, 30]
        self.assertErreur(d, "regions")

    def test_silkhom_tranches_chevauchantes(self):
        d = donnees_valides()
        niveaux = d["metiers"][0]["salaires"]["silkhom"]["grilles"][0]["niveaux"]
        niveaux[1]["annees_min"] = niveaux[0]["annees_max"] - 1
        self.assertErreur(d, "annees_min")

    def test_apec_deciles_incoherents(self):
        d = donnees_valides()
        apec = d["metiers"][0]["salaires"]["apec"]
        apec["d1"] = apec["mediane"] + 1
        self.assertErreur(d, "d1")

    def test_moyenne_non_verifiee_affichee(self):
        d = donnees_valides()
        silkhom = d["metiers"][0]["salaires"]["silkhom"]
        silkhom["moyenne_keur"] = 42.0
        silkhom["moyenne_verifiee"] = False
        self.assertErreur(d, "moyenne_verifiee")

    def test_rapprochement_incomplet(self):
        d = donnees_valides()
        d["metiers"][0]["salaires"]["apec"]["rapprochement"] = {"de": "X", "raison": ""}
        self.assertErreur(d, "raison")

    def test_rapprochement_absent_du_bloc(self):
        d = donnees_valides()
        del d["metiers"][0]["salaires"]["apec"]["rapprochement"]
        self.assertErreur(d, "rapprochement")

    def test_rapprochement_plafonne_fiabilite(self):
        d = donnees_valides()
        d["metiers"][0]["salaires"]["apec"]["rapprochement"] = {
            "de": "Développement informatique",
            "raison": "Métier proche du développement.",
        }
        d["metiers"][0]["fiabilite"] = "bonne"
        self.assertErreur(d, "fiabilite")
        d["metiers"][0]["fiabilite"] = "moyenne"
        self.assertEqual(valider(d), [])

    def test_fiabilite_hors_echelle(self):
        d = donnees_valides()
        d["metiers"][0]["fiabilite"] = "excellente"
        self.assertErreur(d, "fiabilite")

    def test_type_inconnu(self):
        d = donnees_valides()
        d["metiers"][0]["type"] = "autre"
        self.assertErreur(d, "type")

    def test_rome_mal_forme(self):
        d = donnees_valides()
        d["metiers"][0]["rome"] = "M18"
        self.assertErreur(d, "rome")

    def test_roadmap_url_hors_roadmap_sh(self):
        d = donnees_valides()
        d["metiers"][0]["roadmap_url"] = "http://example.com"
        self.assertErreur(d, "roadmap_url")

    def test_quiz_poids_invalide(self):
        d = donnees_valides()
        reponse = d["quiz"]["questions"][0]["reponses"][0]
        reponse["poids"] = {"a": 3}
        self.assertErreur(d, "poids")
        reponse["poids"] = {"inconnue": 2}
        self.assertErreur(d, "inconnue")

    def test_quiz_reponse_sans_branche_ou_trop_de_branches(self):
        d = donnees_valides()
        reponse = d["quiz"]["questions"][0]["reponses"][0]
        reponse["poids"] = {}
        self.assertErreur(d, "q01")
        reponse["poids"] = {"a": 1, "b": 1, "c": 1}
        self.assertErreur(d, "q01")

    def test_quiz_ids_de_questions_dupliques(self):
        d = donnees_valides()
        d["quiz"]["questions"][1]["id"] = "q01"
        self.assertErreur(d, "q01")

    def test_quiz_desequilibre(self):
        d = donnees_valides()
        for reponse in d["quiz"]["questions"][1]["reponses"]:
            reponse["poids"] = {"a": 2}
        branches = [b["id"] for b in d["macro_branches"]]
        self.assertEqual(scores_max_quiz(d["quiz"], branches), {"a": 4, "b": 2})
        self.assertErreur(d, "équilibre")

    def test_scores_max_quiz_prend_le_maximum_par_question(self):
        d = donnees_valides()
        self.assertEqual(scores_max_quiz(d["quiz"], ["a", "b"]), {"a": 4, "b": 4})

    def test_compteurs_faux(self):
        d = donnees_valides()
        d["meta"]["nb_liens"] += 1
        self.assertErreur(d, "nb_liens")
        d = donnees_valides()
        d["categories"][0]["nb"] += 1
        self.assertErreur(d, "cat-a")

    def test_nb_metiers_faux(self):
        d = donnees_valides()
        d["meta"]["nb_metiers"] += 1
        self.assertErreur(d, "nb_metiers")

    def test_cle_v1_manquante(self):
        d = donnees_valides()
        del d["metiers"][0]["brief"]
        self.assertErreur(d, "brief")

    def test_cle_de_premier_niveau_manquante(self):
        d = donnees_valides()
        del d["quiz"]
        self.assertErreur(d, "quiz")


if __name__ == "__main__":
    unittest.main()
