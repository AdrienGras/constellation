"""Assemble les artboards de fiche métier à partir de metiers.json et des composants du design system."""
import json, html
D = json.load(open('/srv/AdrienGras/constellation/metiers.json', encoding='utf-8'))
M = {m['id']: m for m in D['metiers']}
CAT = {c['id']: c['libelle'] for c in D['categories']}
LIGNE = {c: mb['id'] for mb in D['macro_branches'] for c in mb['categories']}
FICHES = {'dev-backend': 'fiche-dev-backend.dc.html', 'dsi': 'fiche-dsi.dc.html', 'integrateur-web': 'fiche-integrateur-web.dc.html', 'mlops': 'fiche-mlops.dc.html'}
SRC = {'cigref': 'Cigref, nomenclature des profils métiers du SI (2025)', 'rome': 'France Travail, ROME 4.0', 'redaction': 'Rédaction CODA, relue par Adrien Gras'}
e = lambda s: html.escape(s or '', quote=True)
def lien(i): return FICHES.get(i, '#')
def fiche(mid, hauteur):
    m = M[mid]; s = m['salaires']; lid = LIGNE[m['categorie']]
    sk = s['silkhom'] and {'grilles': [{'ligne': g['ligne'], 'niveaux': [{k: n[k] for k in ('annees_min', 'annees_max', 'paris', 'grandes_villes', 'regions')} for n in g['niveaux']]} for g in s['silkhom']['grilles']], 'moyenne_keur': s['silkhom']['moyenne_keur'], 'rapprochement': s['silkhom']['rapprochement']}
    vals = {
      'silkhom': sk, 'apec': s['apec'], 'type': m['type'], 'depuis': [M[d]['titre'] for d in m['depuis']],
      'competences': [{'t': c} for c in m['competences']],
      'depuisLiens': [{'t': M[d]['titre'], 'href': lien(d)} for d in m['depuis']],
      'voisinsMeme': [{'t': M[v]['titre'], 'href': lien(v), 'ligne': LIGNE[M[v]['categorie']], 'cat': M[v]['categorie'], 'type': M[v]['type']} for v in m['voisins_meme_categorie']],
      'voisinsAutres': [{'t': M[v]['titre'], 'href': lien(v), 'ligne': LIGNE[M[v]['categorie']], 'cat': M[v]['categorie'], 'type': M[v]['type']} for v in m['voisins_autres_categories']],
      'roadmap': m.get('roadmap_url'), 'aDepuis': bool(m['depuis']), 'aRoadmap': bool(m.get('roadmap_url')), 'pasRoadmap': not m.get('roadmap_url'),
      'raisonApec': m.get('fiabilite_note'),
    }
    note = m.get('fiabilite_note') or ''
    src = SRC.get(m['source_texte'], m['source_texte'])
    voisin_item = '''<li style="display: flex; align-items: center; gap: 10px; min-height: 36px">
<x-import component-from-global-scope="Constellation.Station" ligne="{{v.ligne}}" categorie="{{v.cat}}" type="{{v.type}}"></x-import>
<a href="{{v.href}}" style="color: var(--encre); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--trait-fort)">{{v.t}}</a>
</li>'''
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fiche {e(m['titre'])}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="ds/constellation/tokens.css">
<link rel="stylesheet" href="ds/constellation/components/bundle.css">
<script src="ds/constellation/components/bundle.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&amp;family=Bricolage+Grotesque:opsz,wght@12..96,500..800&amp;family=JetBrains+Mono:wght@400;500;600&amp;display=swap">
<style>
body{{margin:0}}
a{{color:#eef2f7}}a:hover{{color:#ffffff}}
</style>
</helmet>
<div style="width: 1280px; min-height: {hauteur}px; background: var(--fond); color: var(--encre); font-family: var(--font-sans); font-size: 17px; line-height: 26px">
<x-import component-from-global-scope="Constellation.BarreNavigation" actif="nuage"></x-import>
<main id="contenu" style="display: flex; flex-direction: column; gap: 32px; padding: 24px 48px 64px">
<a href="Main.dc.html" style="align-self: flex-start; font-size: 15px; font-weight: 700; color: var(--encre-douce); text-decoration: none">← Retour au plan</a>
<header style="display: flex; flex-direction: column; gap: 12px; max-width: 900px">
<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
<x-import component-from-global-scope="Constellation.PastilleLigne" ligne="{lid}"></x-import>
<span style="color: var(--encre-douce)">·</span>
<span class="etiquette" style="color: var(--ligne-{lid}-encre)">{e(CAT[m['categorie']])}</span>
</div>
<h1 class="titre-affiche" style="margin: 0">{e(m['titre'])}</h1>
<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
<x-import component-from-global-scope="Constellation.BadgeType" type="{m['type']}"></x-import>
<x-import component-from-global-scope="Constellation.BadgeFiabilite" niveau="{m['fiabilite']}"{(' note="' + e(note) + '"') if note else ''}></x-import>
{('<x-import component-from-global-scope="Constellation.Badge" variant="outline">ROME ' + e(m['rome']) + '</x-import>') if m.get('rome') else ''}
</div>
<p class="chapo" style="margin: 4px 0 0; max-width: 780px">{e(m['brief'])}</p>
</header>
<div style="display: flex; gap: 40px; align-items: flex-start">
<div style="flex: 2; min-width: 0; display: flex; flex-direction: column; gap: 28px">
<section><h2 class="titre-2" style="margin: 0 0 8px">Missions</h2><p style="margin: 0; max-width: 720px">{e(m['missions'])}</p></section>
<section><h2 class="titre-2" style="margin: 0 0 12px">Compétences</h2>
<div style="display: flex; flex-wrap: wrap; gap: 8px"><sc-for list="{{{{competences}}}}" as="c" hint-placeholder-count="5"><x-import component-from-global-scope="Constellation.Badge">{{{{c.t}}}}</x-import></sc-for></div></section>
<section><h2 class="titre-2" style="margin: 0 0 8px">À éviter si</h2>
<x-import component-from-global-scope="Constellation.Alert" variant="neutre" icone="info" title="{e(m['a_eviter_si'])}"></x-import>
<p style="margin: 8px 0 0; font-size: 15px; color: var(--encre-douce)">Un repère pour réfléchir, pas une règle.</p></section>
<section><h2 class="titre-2" style="margin: 0 0 8px">Parcours</h2><p style="margin: 0; max-width: 720px">{e(m['parcours'])}</p></section>
</div>
<aside aria-label="Repères" style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 20px; background: var(--surface); border-radius: var(--rayon-md); box-shadow: var(--ombre-carte); padding: 24px">
<sc-if value="{{{{aDepuis}}}}" hint-placeholder-val="{{{{true}}}}">
<div><h2 class="etiquette" style="margin: 0 0 6px; color: var(--encre-douce)">On y arrive depuis</h2>
<ul style="list-style: none; margin: 0; padding: 0"><sc-for list="{{{{depuisLiens}}}}" as="d" hint-placeholder-count="2"><li style="min-height: 32px"><a href="{{{{d.href}}}}" style="color: var(--encre); font-weight: 700">{{{{d.t}}}}</a></li></sc-for></ul></div>
</sc-if>
<div><h2 class="etiquette" style="margin: 0 0 6px; color: var(--encre-douce)">Métiers voisins, même catégorie</h2>
<ul style="list-style: none; margin: 0; padding: 0"><sc-for list="{{{{voisinsMeme}}}}" as="v" hint-placeholder-count="3">{voisin_item}</sc-for></ul></div>
<div><h2 class="etiquette" style="margin: 0 0 6px; color: var(--encre-douce)">Voisins dans d’autres lignes</h2>
<ul style="list-style: none; margin: 0; padding: 0"><sc-for list="{{{{voisinsAutres}}}}" as="v" hint-placeholder-count="3">{voisin_item}</sc-for></ul></div>
<sc-if value="{{{{aRoadmap}}}}" hint-placeholder-val="{{{{true}}}}">
<a href="{{{{roadmap}}}}" class="cs-btn cs-btn-outline" style="align-self: flex-start">Voir la roadmap sur roadmap.sh ↗</a>
</sc-if>
<a href="roadmap.dc.html" class="cs-btn cs-btn-default" style="align-self: flex-start">Viser ce métier dans ma roadmap</a>
<p style="margin: 0; font-size: 14px; line-height: 20px; color: var(--encre-douce); border-top: 1px solid var(--trait); padding-top: 12px">Texte : {e(src)}.{(' Fiabilité : ' + e(note) + '.') if note else ''}</p>
</aside>
</div>
<section aria-labelledby="titre-salaires" style="display: flex; flex-direction: column; gap: 16px">
<h2 id="titre-salaires" class="titre-2" style="margin: 0">Salaires cibles</h2>
<p style="margin: 0; max-width: 820px; color: var(--encre-douce)">Ce que tu peux viser après quelques années, pas un salaire de sortie d’études. Les deux sources ci-dessous ne mesurent pas la même chose : ne les compare pas entre elles.</p>
<x-import component-from-global-scope="Constellation.CartoucheSilkhom" silkhom="{{{{silkhom}}}}" type="{{{{type}}}}" depuis="{{{{depuis}}}}" ligne="{lid}"></x-import>
<x-import component-from-global-scope="Constellation.CartoucheApec" apec="{{{{apec}}}}" raison-absence="{{{{raisonApec}}}}"></x-import>
</section>
</main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1280,"height":{hauteur}}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {json.dumps(vals, ensure_ascii=False)};
}}
}}
</script>
</body>
</html>
'''
import sys
for mid, h in [('dev-backend', 2360), ('dsi', 2160), ('integrateur-web', 2000), ('mlops', 2280)]:
    t = fiche(mid, h)
    assert "'" not in t[t.index("data-props='") + 12: t.index("'>", t.index("data-props='"))]
    open('root/project/' + FICHES[mid], 'w').write(t); print(FICHES[mid], len(t))
