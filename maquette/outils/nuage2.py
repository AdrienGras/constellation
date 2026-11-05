"""Réécrit les artboards du nuage (E1, E2) en version interactive :
fond SVG statique (quartiers, tracés, étiquettes, terminus, pôle) + stations HTML pilotées par l'état
(survol, focus, infobulle, liens voisins, filtres catégorie et type)."""
import json, math, sys, re
A = sys.argv[1]  # dossier project/ du canevas
P = json.load(open('/srv/AdrienGras/constellation/maquette/plan.json'))
D = json.load(open('/srv/AdrienGras/constellation/metiers.json', encoding='utf-8'))
CAT = {c['id']: c['libelle'] for c in D['categories']}
FOND = '#0c1117'
FICHES = {'dev-backend': 'fiche-dev-backend.dc.html', 'dsi': 'fiche-dsi.dc.html', 'integrateur-web': 'fiche-integrateur-web.dc.html', 'mlops': 'fiche-mlops.dc.html'}
ROUTES = {'nuage': 'Main.dc.html', 'quiz': 'quiz-question.dc.html', 'roadmap': 'roadmap.dc.html', 'sources': 'sources.dc.html'}

def fond_svg(top):
    o = ['<svg viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true" style="position: absolute; left: 0; top: 0; display: block">']
    for l in P['lignes']:
        explo = top and l['id'] not in top
        for q in l['quartiers']:
            if explo:
                o.append(f'<path d="{q["d"]}" fill="none" stroke="{l["couleur"]}" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 7" stroke-opacity="0.9"></path>')
            o.append(f'<path d="{q["d"]}" fill="none" stroke="{l["fond"]}" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"></path>')
    for l in P['lignes']:
        fort = l['id'] in top
        if fort:
            o.append(f'<path d="{l["d"]}" fill="none" stroke="{l["couleur"]}" stroke-width="20" stroke-opacity="0.22" stroke-linecap="round" stroke-linejoin="round"></path>')
        o.append(f'<path d="{l["d"]}" fill="none" stroke="{l["couleur"]}" stroke-width="{12 if fort else 8}" stroke-linecap="round" stroke-linejoin="round"></path>')
    for l in P['lignes']:
        for q in l['quartiers']:
            o.append(f'<text x="{q["lx"]:g}" y="{q["ly"]:g}" text-anchor="{q["la"]}" fill="{l["couleur"]}" font-family="Atkinson Hyperlegible, sans-serif" font-size="12" font-weight="700" letter-spacing="0.06em">{q["libelle"].upper()}</text>')
    for l in P['lignes']:
        x, y = l['terminus']
        o.append(f'<circle cx="{x}" cy="{y}" r="14" fill="{l["couleur"]}" stroke="{FOND}" stroke-width="3"></circle><text x="{x}" y="{y+5}" text-anchor="middle" fill="{FOND}" font-family="Bricolage Grotesque, sans-serif" font-size="15" font-weight="800">{l["num"]}</text>')
    o.append(f'<circle cx="640" cy="360" r="30" fill="#eef2f7"></circle><text x="640" y="356" text-anchor="middle" fill="{FOND}" font-family="Bricolage Grotesque, sans-serif" font-size="12" font-weight="800">TA</text><text x="640" y="370" text-anchor="middle" fill="{FOND}" font-family="Bricolage Grotesque, sans-serif" font-size="10" font-weight="800">FORMATION</text>')
    o.append('</svg>')
    return '\n'.join(o)

stations = []
for sid, s in P['stations'].items():
    stations.append({'id': sid, 'x': s['x'], 'y': s['y'], 'c': s['couleur'], 'evo': s['type'] == 'evolution', 'titre': s['titre'],
                     'cat': s['cat'], 'catLib': CAT[s['cat']], 'ligne': s['ligne'], 'v': [v for v in s['voisins'] if v in P['stations']], 'href': FICHES.get(sid)})

COUCHE = '''<sc-for list="{{voisins}}" as="v" hint-placeholder-count="0">
<div aria-hidden="true" style="{{v.style}}"></div>
</sc-for>
<sc-for list="{{stations}}" as="s" hint-placeholder-count="68">
<sc-if value="{{s.lien}}" hint-placeholder-val="{{false}}">
<a href="{{s.href}}" aria-label="{{s.aria}}" onMouseEnter="{{s.entrer}}" onMouseLeave="{{sortir}}" onFocus="{{s.entrer}}" onBlur="{{sortir}}" style="{{s.style}}"><span style="{{s.coeur}}"></span></a>
</sc-if>
<sc-if value="{{s.pasLien}}" hint-placeholder-val="{{true}}">
<button type="button" aria-label="{{s.aria}}" onMouseEnter="{{s.entrer}}" onMouseLeave="{{sortir}}" onFocus="{{s.entrer}}" onBlur="{{sortir}}" onClick="{{s.entrer}}" style="{{s.style}}"><span style="{{s.coeur}}"></span></button>
</sc-if>
</sc-for>
<sc-if value="{{bulle.visible}}" hint-placeholder-val="{{false}}">
<div role="tooltip" style="{{bulle.style}}">
<strong style="display: block; font-size: 16px; line-height: 22px">{{bulle.titre}}</strong>
<span>{{bulle.sous}}</span><br>
<span style="font-weight: 700">{{bulle.action}}</span>
</div>
</sc-if>'''

LOGIQUE = '''class Component extends DCLogic {
constructor(props) { super(props); this.state = { survol: null, cat: 'toutes', type: 'tous' }; }
renderVals() {
const S = @@ST@@;
const st = this.state;
const parId = {}; S.forEach((s) => { parId[s.id] = s; });
const h = st.survol ? parId[st.survol] : null;
const garde = (s) => (st.cat === 'toutes' || s.cat === st.cat) && (st.type === 'tous' || (st.type === 'evolution') === s.evo);
const stations = S.map((s) => {
  const actif = h && h.id === s.id, voisin = h && h.v.indexOf(s.id) >= 0, filtre = garde(s);
  const r = actif ? 12 : 9;
  return { id: s.id, href: s.href || '#', lien: !!s.href, pasLien: !s.href,
    aria: s.titre + ', ' + s.catLib + ', ' + (s.evo ? 'métier d’évolution' : 'métier d’entrée'),
    entrer: () => this.setState({ survol: s.id }),
    style: { position: 'absolute', left: (s.x - 17) + 'px', top: (s.y - 17) + 'px', width: '34px', height: '34px', padding: 0, margin: 0, border: 0, background: 'transparent', borderRadius: '50%', cursor: 'pointer', display: 'grid', placeItems: 'center', opacity: filtre ? 1 : 0.18, outlineOffset: '0px', zIndex: actif ? 3 : 2 },
    coeur: { display: 'block', boxSizing: 'border-box', width: (2 * r) + 'px', height: (2 * r) + 'px', borderRadius: '50%', background: s.evo ? '@@FOND@@' : s.c, border: s.evo ? ('4px solid ' + s.c) : ('3px solid @@FOND@@'), boxShadow: actif ? ('0 0 0 4px @@FOND@@, 0 0 0 6px ' + s.c + ', 0 0 18px ' + s.c) : (voisin ? ('0 0 0 3px ' + s.c) : 'none'), backgroundImage: s.evo ? ('radial-gradient(circle, ' + s.c + ' 0 3.5px, transparent 4px)') : 'none' } };
});
const voisins = h ? h.v.map((id) => parId[id]).filter(Boolean).map((t) => {
  const dx = t.x - h.x, dy = t.y - h.y, L = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx) * 180 / Math.PI;
  return { style: { position: 'absolute', left: h.x + 'px', top: (h.y - 1) + 'px', width: L + 'px', height: 0, borderTop: '2px dashed ' + h.c, transformOrigin: '0 0', transform: 'rotate(' + a + 'deg)', zIndex: 1, pointerEvents: 'none' } };
}) : [];
const droite = h && h.x > 900;
const bulle = h ? { visible: true, titre: h.titre, sous: h.catLib + ' · ' + (h.evo ? 'métier d’évolution' : 'métier d’entrée'),
  action: h.href ? 'Clique pour ouvrir la fiche' : 'Fiche non modélisée dans la maquette',
  style: Object.assign({ position: 'absolute', top: (h.y - 96) + 'px', background: 'var(--encre)', color: 'var(--fond)', borderRadius: 'var(--rayon-sm)', boxShadow: 'var(--ombre-flottante)', padding: '10px 14px', fontSize: '14px', lineHeight: '20px', zIndex: 5, maxWidth: '300px', pointerEvents: 'none' }, droite ? { right: (1280 - h.x + 14) + 'px' } : { left: (h.x + 14) + 'px' }) } : { visible: false };
return {
  stations: stations, voisins: voisins, bulle: bulle, sortir: () => this.setState({ survol: null }),
  routes: @@ROUTES@@, @@EXTRA@@
  categories: [{ value: 'toutes', label: 'Toutes les catégories (17)' }].concat(@@CATS@@),
  types: [{ value: 'tous', label: 'Tous' }, { value: 'entree', label: 'Entrée' }, { value: 'evolution', label: 'Évolution' }],
  vues: [{ value: 'graphe', label: 'Graphe', href: 'Main.dc.html' }, { value: 'liste', label: 'Liste', href: 'nuage-liste.dc.html' }],
  choisirCat: (e) => this.setState({ cat: e.target.value }), choisirType: (v) => this.setState({ type: v }),
  lignes: [{ id: 'developpement' }, { id: 'infra-cloud' }, { id: 'cybersecurite' }, { id: 'data-ia' }, { id: 'qualite-archi' }, { id: 'produit-design' }, { id: 'relation-transmission' }, { id: 'management' }]
};
}
}'''
cats = [{'value': c['id'], 'label': f"{c['libelle']} ({c['nb']})"} for c in D['categories']]
def refaire(nom, top, extra):
    t = open(f'{A}/{nom}').read()
    # carte : remplacer le SVG par fond + couche interactive
    a = t.index('<svg viewBox="0 0 1280 720"'); b = t.index('</svg>', a) + 6
    t = t[:a] + fond_svg(top) + '\n' + COUCHE + t[b:]
    # supprimer l'ancienne infobulle figée (E1)
    t = re.sub(r'<div role="tooltip" style="position: absolute; left: 812px;.*?</div>\n', '', t, flags=re.S)
    # filtres actifs
    t = t.replace('<x-import component-from-global-scope="Constellation.Select" label="Catégorie" options="{{categories}}" style="width: 280px"></x-import>',
                  '<x-import component-from-global-scope="Constellation.Select" label="Catégorie" options="{{categories}}" on-change="{{choisirCat}}" style="width: 280px"></x-import>')
    t = t.replace('items="{{types}}" default-value="tous"></x-import>', 'items="{{types}}" default-value="tous" on-value-change="{{choisirType}}"></x-import>')
    t = t.replace('<x-import component-from-global-scope="Constellation.BarreNavigation" actif="nuage"></x-import>', '<x-import component-from-global-scope="Constellation.BarreNavigation" actif="nuage" routes="{{routes}}"></x-import>')
    t = t.replace('items="{{vues}}" default-value="graphe"></x-import>', 'items="{{vues}}" value="graphe"></x-import>')
    # logique
    a = t.index('class Component extends DCLogic'); b = t.index('</script>', a)
    t = t[:a] + (LOGIQUE.replace('@@ST@@', json.dumps(stations, ensure_ascii=False)).replace('@@FOND@@', FOND).replace('@@ROUTES@@', json.dumps(ROUTES))
                 .replace('@@CATS@@', json.dumps(cats, ensure_ascii=False)).replace('@@EXTRA@@', extra)) + '\n' + t[b:]
    open(f'{A}/{nom}', 'w').write(t)
    for k in ('{{stations}}', 'on-change="{{choisirCat}}"', 'on-value-change="{{choisirType}}"', 'routes="{{routes}}"', 'value="graphe"'):
        assert k in t, (nom, k)
    print(nom, len(t), 'liens fiches anciens restants :', t.count('<a href="fiche-'))
refaire('Main.dc.html', [], '')
refaire('nuage-apres-quiz.dc.html', ['developpement', 'infra-cloud', 'data-ia'], 'un: 1, deux: 2, trois: 3,')
# test de la logique hors navigateur
t = open(f'{A}/Main.dc.html').read(); js = t[t.index('class Component'):t.index('</script>', t.index('class Component'))]
open('nuage-test.js', 'w').write('class DCLogic { constructor(p){this.props=p;} setState(s){Object.assign(this.state, s);} }\n' + js + '''
const c = new Component({}); let v = c.renderVals(); console.log(v.stations.length, v.bulle.visible, v.voisins.length);
v.stations.find(s => s.id === 'dev-backend').entrer(); v = c.renderVals(); console.log(v.bulle.titre, '|', v.bulle.action, '| voisins', v.voisins.length);
v.stations.find(s => s.id === 'sre').entrer(); v = c.renderVals(); console.log(v.bulle.titre, '|', v.bulle.action);
v.choisirCat({ target: { value: 'secu' } }); v = c.renderVals(); console.log('visibles', v.stations.filter(s => s.style.opacity === 1).length);
v.choisirType('evolution'); v = c.renderVals(); console.log('secu+évolution', v.stations.filter(s => s.style.opacity === 1).length);''')
import subprocess; print(subprocess.run(['node', 'nuage-test.js'], capture_output=True, text=True))
