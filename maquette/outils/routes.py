"""Passe d'interactivité sur les autres artboards : routes de navigation partout, liste filtrable,
bascule Graphe / Liste en liens, menu mobile, accordéons mobiles, changement de métier visé dans la roadmap."""
import json, re, sys, subprocess
A = sys.argv[1]
D = json.load(open('/srv/AdrienGras/constellation/metiers.json', encoding='utf-8'))
ROUTES = {'nuage': 'Main.dc.html', 'quiz': 'quiz-question.dc.html', 'roadmap': 'roadmap.dc.html', 'sources': 'sources.dc.html'}
R = json.dumps(ROUTES)
def lire(n): return open(f'{A}/{n}').read()
def ecrire(n, t): open(f'{A}/{n}', 'w').write(t)
def nav(t):
    return re.sub(r'(<x-import component-from-global-scope="Constellation\.BarreNavigation" actif="\w+")', r'\1 routes="{{routes}}"', t)
def ajoute_routes(t):
    i = t.index('renderVals()'); j = t.index('return {', i) + len('return {')
    return t[:j] + ' routes: ' + R + ', ' + t[j:]
# 1) pages desktop simples : routes seulement
for n in ['fiche-dev-backend.dc.html', 'fiche-dsi.dc.html', 'fiche-integrateur-web.dc.html', 'fiche-mlops.dc.html', 'quiz-question.dc.html', 'quiz-resultat.dc.html', 'roadmap-vide.dc.html', 'sources.dc.html']:
    t = lire(n); assert 'routes="{{routes}}"' not in t
    t = ajoute_routes(nav(t)); ecrire(n, t); print('routes', n)
# 2) liste filtrable
t = nav(lire('nuage-liste.dc.html'))
t = t.replace('items="{{vues}}" default-value="liste"></x-import>', 'items="{{vues}}" value="liste"></x-import>')
t = t.replace('<x-import component-from-global-scope="Constellation.Select" label="Catégorie" options="{{categories}}" style="width: 280px"></x-import>',
              '<x-import component-from-global-scope="Constellation.Select" label="Catégorie" options="{{categories}}" on-change="{{choisirCat}}" style="width: 280px"></x-import>')
t = t.replace('items="{{types}}" default-value="tous"></x-import>', 'items="{{types}}" default-value="tous" on-value-change="{{choisirType}}"></x-import>')
t = t.replace('<span style="font-size: 14px; font-weight: 400; color: var(--encre-douce)">{{g.n}} métiers</span>', '<span style="font-size: 14px; font-weight: 400; color: var(--encre-douce)">{{g.compte}}</span>')
t = t.replace('<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; padding: 8px 48px 48px; align-items: start">',
              '<p role="status" style="margin: 0; padding: 0 48px 8px; color: var(--encre-douce)">{{resume}}</p>\n<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; padding: 8px 48px 48px; align-items: start">')
m = re.search(r'groupes: (\[.*?\]),\nvues:', t, re.S); G = m.group(1)
cats = json.dumps([{'value': 'toutes', 'label': 'Toutes les catégories (17)'}] + [{'value': c['id'], 'label': f"{c['libelle']} ({c['nb']})"} for c in D['categories']], ensure_ascii=False)
a = t.index('class Component extends DCLogic'); b = t.index('</script>', a)
t = t[:a] + f'''class Component extends DCLogic {{
constructor(props) {{ super(props); this.state = {{ cat: 'toutes', type: 'tous' }}; }}
renderVals() {{
const G = {G};
const st = this.state;
const ok = (m) => (st.cat === 'toutes' || m.cat === st.cat) && (st.type === 'tous' || m.type === st.type);
const groupes = G.map((g) => {{ const cats = g.cats.map((c) => Object.assign({{}}, c, {{ metiers: c.metiers.filter(ok) }})).filter((c) => c.metiers.length); const n = cats.reduce((s, c) => s + c.metiers.length, 0); return Object.assign({{}}, g, {{ cats: cats, n: n, compte: n + (n > 1 ? ' métiers' : ' métier') }}); }}).filter((g) => g.n);
const total = groupes.reduce((s, g) => s + g.n, 0);
return {{
  routes: {R}, groupes: groupes, resume: total === 68 ? 'Les 68 métiers.' : total + ' métier' + (total > 1 ? 's' : '') + ' sur 68 avec ces filtres.',
  categories: {cats},
  types: [{{ value: 'tous', label: 'Tous' }}, {{ value: 'entree', label: 'Entrée' }}, {{ value: 'evolution', label: 'Évolution' }}],
  vues: [{{ value: 'graphe', label: 'Graphe', href: 'Main.dc.html' }}, {{ value: 'liste', label: 'Liste', href: 'nuage-liste.dc.html' }}],
  choisirCat: (e) => this.setState({{ cat: e.target.value }}), choisirType: (v) => this.setState({{ type: v }}),
  lignes: [{{ id: 'developpement' }}, {{ id: 'infra-cloud' }}, {{ id: 'cybersecurite' }}, {{ id: 'data-ia' }}, {{ id: 'qualite-archi' }}, {{ id: 'produit-design' }}, {{ id: 'relation-transmission' }}, {{ id: 'management' }}]
}};
}}
}}
''' + t[b:]
t = t.replace('"lien": "#"}, {"titre": "Intégrateur·rice web / accessibilité", "type": "entree", "cat": "frontend", "ligne": "developpement", "lien": "#"}', '"lien": "#"}, {"titre": "Intégrateur·rice web / accessibilité", "type": "entree", "cat": "frontend", "ligne": "developpement", "lien": "fiche-integrateur-web.dc.html"}')
t = t.replace('{"titre": "Ingénieur·e MLOps", "type": "evolution", "cat": "ia", "ligne": "data-ia", "lien": "#"}', '{"titre": "Ingénieur·e MLOps", "type": "evolution", "cat": "ia", "ligne": "data-ia", "lien": "fiche-mlops.dc.html"}')
t = t.replace('"lien": "#"}', '"lien": "#"}').replace('{"titre": "DSI (directeur·rice des systèmes d\'information)", "type": "evolution", "cat": "management", "ligne": "management", "lien": "#"}', '{"titre": "DSI (directeur·rice des systèmes d\'information)", "type": "evolution", "cat": "management", "ligne": "management", "lien": "fiche-dsi.dc.html"}')
t = t.replace('height: 2720px; overflow: hidden', 'min-height: 2720px')
ecrire('nuage-liste.dc.html', t); print('liste', t.count('fiche-'))
js = t[t.index('class Component'):t.index('</script>', t.index('class Component'))]
open('liste-test.js', 'w').write('class DCLogic { constructor(p){this.props=p;} setState(s){Object.assign(this.state, s);} }\n' + js + '''
const c = new Component({}); let v = c.renderVals(); console.log(v.resume, v.groupes.length);
v.choisirCat({ target: { value: 'devops-cloud' } }); v = c.renderVals(); console.log(v.resume, v.groupes.map(g => g.compte));
v.choisirType('evolution'); v = c.renderVals(); console.log(v.resume);''')
print(subprocess.run(['node', 'liste-test.js'], capture_output=True, text=True).stdout)
