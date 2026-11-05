"""Assemble la page Sources et les trois écrans mobiles."""
import json, html, re
D = json.load(open('/srv/AdrienGras/constellation/metiers.json', encoding='utf-8'))
M = {m['id']: m for m in D['metiers']}
CAT = {c['id']: c['libelle'] for c in D['categories']}
B = '/tmp/claude-1000/-srv-AdrienGras-constellation/820987da-176b-4916-b2a1-c70a10db0665/scratchpad/canevas/root/project/'
e = lambda s: html.escape(s or '', quote=True)
TETE = open(B + 'roadmap.dc.html').read(); TETE = TETE[:TETE.index('</helmet>') + 10]
def pied(w, h, vals):
    return f'''</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
renderVals() {{ return {json.dumps(vals, ensure_ascii=False)}; }}
}}
</script>
</body>
</html>
'''
# ---- E13 Sources
src = [{'titre': s['titre'], 'editeur': s['editeur'], 'date': s.get('date'), 'usage': s.get('usage'), 'licence': s.get('licence')} for s in D['sources']]
lignes = ''.join(f'''<tr><th scope="row" style="text-align: left; padding: 14px 12px; border-top: 1px solid var(--trait); vertical-align: top"><a href="{e(s['url'])}">{e(s['titre'])}</a></th><td style="padding: 14px 12px; border-top: 1px solid var(--trait); vertical-align: top">{e(s['editeur'])}</td><td style="padding: 14px 12px; border-top: 1px solid var(--trait); vertical-align: top; font-family: var(--font-mono)">{e(str(s.get('date') or 'n.d.'))}</td><td style="padding: 14px 12px; border-top: 1px solid var(--trait); vertical-align: top">{e(s.get('usage'))}</td><td style="padding: 14px 12px; border-top: 1px solid var(--trait); vertical-align: top; color: var(--encre-douce)">{e(s.get('licence'))}</td></tr>''' for s in D['sources'])
sources = TETE.replace('<title>Roadmap remplie</title>', '<title>Sources et mentions</title>') + f'''<div style="width: 1280px; min-height: 1400px; background: var(--fond); color: var(--encre); font-family: var(--font-sans); font-size: 17px; line-height: 26px">
<x-import component-from-global-scope="Constellation.BarreNavigation" actif="sources"></x-import>
<main id="contenu" style="max-width: 1100px; padding: 40px 48px 64px; display: flex; flex-direction: column; gap: 28px">
<div><p class="etiquette" style="margin: 0; color: var(--encre-douce)">Sources et mentions</p><h1 class="titre-1" style="margin: 4px 0 0">D’où viennent ces informations</h1></div>
<section style="background: var(--surface); border-radius: var(--rayon-md); box-shadow: var(--ombre-carte); padding: 24px 28px; display: flex; flex-direction: column; gap: 12px">
<h2 class="titre-3" style="margin: 0">Mentions</h2>
<p style="margin: 0; max-width: 900px">{e(D['meta']['mentions'])}</p>
<p style="margin: 0; font-size: 15px; color: var(--encre-douce)">Licence des textes propres à constellation : à décider (CC BY 4.0 proposée). Données relevées le {e(D['meta']['genere_le'])}, version {e(D['meta']['version'])}.</p>
</section>
<section style="display: flex; flex-direction: column; gap: 12px">
<h2 class="titre-2" style="margin: 0">Les {len(D['sources'])} sources</h2>
<div style="overflow-x: auto; background: var(--surface); border-radius: var(--rayon-md); box-shadow: var(--ombre-carte)">
<table style="width: 100%; border-collapse: collapse; font-size: 15px; line-height: 22px">
<thead><tr><th scope="col" class="etiquette" style="text-align: left; padding: 12px; background: var(--surface-muted); color: var(--encre-douce)">Source</th><th scope="col" class="etiquette" style="text-align: left; padding: 12px; background: var(--surface-muted); color: var(--encre-douce)">Éditeur</th><th scope="col" class="etiquette" style="text-align: left; padding: 12px; background: var(--surface-muted); color: var(--encre-douce)">Date</th><th scope="col" class="etiquette" style="text-align: left; padding: 12px; background: var(--surface-muted); color: var(--encre-douce)">Ce qu’on en tire</th><th scope="col" class="etiquette" style="text-align: left; padding: 12px; background: var(--surface-muted); color: var(--encre-douce)">Licence</th></tr></thead>
<tbody>{lignes}</tbody>
</table>
</div>
</section>
<x-import component-from-global-scope="Constellation.Alert" variant="info" title="Aucun compte, aucun suivi.">Ton résultat de quiz et ta roadmap restent dans ton navigateur ; rien n’est envoyé nulle part.</x-import>
</main>
</div>
''' + pied(1280, 1400, {})
open(B + 'sources.dc.html', 'w').write(sources); print('sources', len(sources))
# ---- mobile
ENTETE_MOB = '''<header style="display: flex; justify-content: space-between; align-items: center; height: 60px; padding: 0 16px; background: var(--surface); box-shadow: 0 1px 0 var(--trait)">
<a href="m-nuage.dc.html" class="cs-logo" style="font-size: 20px">constellation</a>
<x-import component-from-global-scope="Constellation.Button" variant="ghost" size="sm" aria-label="Ouvrir le menu">Menu</x-import>
</header>'''
def mob(nom, titre, h, corps, vals):
    t = TETE.replace('<title>Roadmap remplie</title>', f'<title>{titre}</title>') + f'''<div style="width: 390px; min-height: {h}px; background: var(--fond); color: var(--encre); font-family: var(--font-sans); font-size: 17px; line-height: 26px">
{ENTETE_MOB}
<main id="contenu" style="padding: 20px 16px 40px; display: flex; flex-direction: column; gap: 20px">
{corps}
</main>
</div>
''' + pied(390, h, vals)
    open(B + nom, 'w').write(t); print(nom, len(t))
dev = [m for c in ['backend', 'frontend', 'mobile-jeu', 'embarque'] for m in D['metiers'] if m['categorie'] == c]
mob('m-nuage.dc.html', 'Mobile, nuage en liste', 1500, '''<div><p class="etiquette" style="margin: 0; color: var(--encre-douce)">Accueil</p><h1 class="titre-2" style="margin: 2px 0 0">Les 68 métiers</h1>
<p style="margin: 6px 0 0; font-size: 15px; line-height: 22px; color: var(--encre-douce)">Sur téléphone, le plan s’ouvre en liste. Le graphe reste à un toucher.</p></div>
<x-import component-from-global-scope="Constellation.ToggleGroup" label="Affichage" items="{{vues}}" default-value="liste"></x-import>
<x-import component-from-global-scope="Constellation.Input" label="Chercher un métier" icone="recherche" placeholder="Ex. : DevOps, data…"></x-import>
<section style="background: var(--surface); border-radius: var(--rayon-md); box-shadow: var(--ombre-carte); padding: 16px; display: flex; flex-direction: column; gap: 8px">
<x-import component-from-global-scope="Constellation.PastilleLigne" ligne="developpement" taille="lg"></x-import>
<ul style="list-style: none; margin: 0; padding: 0"><sc-for list="{{dev}}" as="m" hint-placeholder-count="6"><li style="display: flex; align-items: center; gap: 10px; min-height: 44px; border-top: 1px solid var(--trait)"><x-import component-from-global-scope="Constellation.Station" ligne="developpement" categorie="{{m.cat}}" type="{{m.type}}"></x-import><a href="{{m.href}}" style="color: var(--encre); font-weight: 700; text-decoration: none; font-size: 16px; line-height: 22px">{{m.t}}</a></li></sc-for></ul>
</section>
<sc-for list="{{autres}}" as="l" hint-placeholder-count="7"><button type="button" aria-expanded="false" style="display: flex; justify-content: space-between; align-items: center; min-height: 56px; padding: 0 16px; background: var(--surface); border: 0; border-radius: var(--rayon-md); color: var(--encre); font: inherit; box-shadow: var(--ombre-carte)"><x-import component-from-global-scope="Constellation.PastilleLigne" ligne="{{l.id}}"></x-import><span style="font-size: 14px; color: var(--encre-douce)">{{l.n}} ›</span></button></sc-for>''',
    {'vues': [{'value': 'graphe', 'label': 'Graphe'}, {'value': 'liste', 'label': 'Liste'}],
     'dev': [{'t': m['titre'], 'cat': m['categorie'], 'type': m['type'], 'href': 'm-fiche.dc.html' if m['id'] == 'dev-backend' else '#'} for m in dev],
     'autres': [{'id': mb['id'], 'n': f"{sum(1 for m in D['metiers'] if m['categorie'] in mb['categories'])} métiers"} for mb in D['macro_branches'][1:]]})
f = M['dev-backend']; s = f['salaires']
sk = {'grilles': [{'ligne': g['ligne'], 'niveaux': [{k: n[k] for k in ('annees_min', 'annees_max', 'paris', 'grandes_villes', 'regions')} for n in g['niveaux']]} for g in s['silkhom']['grilles']], 'moyenne_keur': s['silkhom']['moyenne_keur'], 'rapprochement': None}
mob('m-fiche.dc.html', 'Mobile, fiche Développeur·se back-end', 3000, f'''<a href="m-nuage.dc.html" style="font-size: 15px; font-weight: 700; color: var(--encre-douce); text-decoration: none">← Retour aux métiers</a>
<header style="display: flex; flex-direction: column; gap: 10px">
<x-import component-from-global-scope="Constellation.PastilleLigne" ligne="developpement" taille="sm"></x-import>
<h1 class="titre-1" style="margin: 0; font-size: 32px; line-height: 36px">{e(f['titre'])}</h1>
<div style="display: flex; flex-wrap: wrap; gap: 8px"><x-import component-from-global-scope="Constellation.BadgeType" type="entree"></x-import><x-import component-from-global-scope="Constellation.BadgeFiabilite" niveau="moyenne"></x-import></div>
<p style="margin: 0; font-size: 18px; line-height: 27px">{e(f['brief'])}</p>
</header>
<section><h2 class="titre-3" style="margin: 0 0 6px">Missions</h2><p style="margin: 0">{e(f['missions'])}</p></section>
<section><h2 class="titre-3" style="margin: 0 0 8px">Compétences</h2><div style="display: flex; flex-wrap: wrap; gap: 8px"><sc-for list="{{{{competences}}}}" as="c" hint-placeholder-count="5"><x-import component-from-global-scope="Constellation.Badge">{{{{c.t}}}}</x-import></sc-for></div></section>
<section><h2 class="titre-3" style="margin: 0 0 6px">À éviter si</h2><x-import component-from-global-scope="Constellation.Alert" variant="neutre" icone="info" title="{e(f['a_eviter_si'])}"></x-import></section>
<section><h2 class="titre-3" style="margin: 0 0 6px">Parcours</h2><p style="margin: 0">{e(f['parcours'])}</p></section>
<section style="display: flex; flex-direction: column; gap: 12px"><h2 class="titre-2" style="margin: 0">Salaires cibles</h2>
<p style="margin: 0; font-size: 15px; line-height: 22px; color: var(--encre-douce)">Ce que tu peux viser après quelques années, pas un salaire de sortie d’études. Les deux sources ne se comparent pas.</p>
<x-import component-from-global-scope="Constellation.CartoucheSilkhom" silkhom="{{{{silkhom}}}}" type="entree" ligne="developpement"></x-import>
<x-import component-from-global-scope="Constellation.CartoucheApec" apec="{{{{apec}}}}"></x-import></section>
<a href="m-roadmap.dc.html" class="cs-btn cs-btn-default">Viser ce métier dans ma roadmap</a>''',
    {'competences': [{'t': c} for c in f['competences']], 'silkhom': sk, 'apec': s['apec']})
items = json.load(open('/dev/stdin')) if False else None
mob('m-roadmap.dc.html', 'Mobile, roadmap', 1700, '''<div><p class="etiquette" style="margin: 0; color: var(--encre-douce)">Ma roadmap · 2027 → 2031</p><h1 class="titre-2" style="margin: 2px 0 0">Cap sur Développeur·se back-end</h1></div>
<details style="background: var(--surface); border-radius: var(--rayon-md); box-shadow: var(--ombre-carte); padding: 12px 16px"><summary style="font-weight: 700; min-height: 32px; cursor: pointer">Compétences de la fiche (5)</summary><div style="display: flex; flex-wrap: wrap; gap: 8px; padding-top: 8px"><sc-for list="{{competences}}" as="c" hint-placeholder-count="5"><x-import component-from-global-scope="Constellation.Badge">{{c.t}}</x-import></sc-for></div></details>
<sc-for list="{{annees}}" as="a" hint-placeholder-count="3"><section style="display: flex; flex-direction: column; gap: 10px; padding-left: 16px; border-left: 6px solid var(--ligne-developpement)"><h2 style="margin: 0; font-family: var(--font-mono); font-size: 24px">{{a.an}}</h2>
<sc-for list="{{a.items}}" as="it" hint-placeholder-count="2"><x-import component-from-global-scope="Constellation.ItemRoadmap" type="{{it.type}}" titre="{{it.titre}}" url="{{it.url}}" premier="{{it.premier}}" dernier="{{it.dernier}}"></x-import></sc-for>
<x-import component-from-global-scope="Constellation.Button" variant="ghost" icone="plus" style="align-self: flex-start">Ajouter à {{a.an}}</x-import></section></sc-for>
<div style="display: flex; flex-wrap: wrap; gap: 8px"><x-import component-from-global-scope="Constellation.Button" variant="outline" size="sm">Exporter en JSON</x-import><x-import component-from-global-scope="Constellation.Button" variant="ghost" size="sm">Importer</x-import></div>''',
    {'competences': [{'t': c} for c in M['dev-backend']['competences']],
     'annees': [{'an': 2027, 'items': [{'type': 'projet', 'titre': 'API REST de gestion de bibliothèque avec Symfony', 'url': 'https://symfony.com/doc/current/index.html', 'premier': True, 'dernier': False}, {'type': 'notion', 'titre': 'Index et plans d’exécution en SQL', 'url': 'https://use-the-index-luke.com/fr', 'premier': False, 'dernier': True}]},
                {'an': 2028, 'items': [{'type': 'notion', 'titre': 'Docker et Docker Compose', 'url': 'https://docs.docker.com/get-started/', 'premier': True, 'dernier': True}]},
                {'an': 2029, 'items': []}]})
for f in ['sources.dc.html', 'm-nuage.dc.html', 'm-fiche.dc.html', 'm-roadmap.dc.html']:
    t = open(B + f).read(); seg = t[t.index("data-props='") + 12:]; seg = seg[:seg.index("'>")]; assert "'" not in seg, f
