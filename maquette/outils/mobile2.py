import json, sys, subprocess, re
A = sys.argv[1]
D = json.load(open('/srv/AdrienGras/constellation/metiers.json', encoding='utf-8'))
FICHE = {'dev-backend': 'm-fiche.dc.html'}
MENU_BTN = '<x-import component-from-global-scope="Constellation.Button" variant="ghost" size="sm" aria-label="Ouvrir le menu">Menu</x-import>\n</header>'
MENU = '''<x-import component-from-global-scope="Constellation.Button" variant="ghost" size="sm" aria-expanded="{{menuOuvert}}" on-click="{{basculerMenu}}">{{libelleMenu}}</x-import>
</header>
<sc-if value="{{menuOuvert}}" hint-placeholder-val="{{false}}">
<nav aria-label="Navigation principale" style="background: var(--surface); box-shadow: var(--ombre-flottante); padding: 8px 16px 16px">
<ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column">
<li><a href="m-nuage.dc.html" style="display: flex; align-items: center; min-height: 48px; font-weight: 700; color: var(--encre); text-decoration: none; border-bottom: 1px solid var(--trait)">Nuage</a></li>
<li><a href="quiz-question.dc.html" style="display: flex; align-items: center; min-height: 48px; font-weight: 700; color: var(--encre); text-decoration: none; border-bottom: 1px solid var(--trait)">Quiz</a></li>
<li><a href="m-roadmap.dc.html" style="display: flex; align-items: center; min-height: 48px; font-weight: 700; color: var(--encre); text-decoration: none; border-bottom: 1px solid var(--trait)">Roadmap</a></li>
<li><a href="sources.dc.html" style="display: flex; align-items: center; min-height: 48px; font-weight: 700; color: var(--encre); text-decoration: none">Sources</a></li>
</ul>
</nav>
</sc-if>'''
MENU_JS = "menuOuvert: !!this.state.menu, libelleMenu: this.state.menu ? 'Fermer' : 'Menu', basculerMenu: () => this.setState({ menu: !this.state.menu }), "
def avec_etat(t, init, avant=''):
    a = t.index('class Component extends DCLogic {') + len('class Component extends DCLogic {')
    t = t[:a] + "\nconstructor(props) { super(props); this.state = " + init + "; }" + t[a:]
    i = t.index('renderVals() {'); j = t.index('return {', i) + len('return {')
    return t[:i] + 'renderVals() {' + avant + t[i + len('renderVals() {'):j] + ' ' + MENU_JS + t[j:]
for n in ['m-fiche.dc.html', 'm-roadmap.dc.html']:
    t = open(f'{A}/{n}').read(); assert t.count(MENU_BTN) == 1
    t = avec_etat(t.replace(MENU_BTN, MENU), '{ menu: false }')
    open(f'{A}/{n}', 'w').write(t); print('menu', n)
# m-nuage : accordéons par ligne + recherche
t = open(f'{A}/m-nuage.dc.html').read(); assert t.count(MENU_BTN) == 1
t = t.replace(MENU_BTN, MENU)
a = t.index('<x-import component-from-global-scope="Constellation.ToggleGroup" label="Affichage"'); b = t.index('</main>')
t = t[:a] + '''<x-import component-from-global-scope="Constellation.ToggleGroup" label="Affichage" items="{{vues}}" value="liste"></x-import>
<x-import component-from-global-scope="Constellation.Input" label="Chercher un métier" icone="recherche" value="{{q}}" on-change="{{chercher}}" placeholder="Ex. : DevOps, data…"></x-import>
<sc-for list="{{lignes}}" as="l" hint-placeholder-count="8">
<section style="background: var(--surface); border-radius: var(--rayon-md); box-shadow: var(--ombre-carte)">
<h2 style="margin: 0"><button type="button" aria-expanded="{{l.ouvertTxt}}" onClick="{{l.basculer}}" style="display: flex; width: 100%; justify-content: space-between; align-items: center; min-height: 56px; padding: 0 16px; background: transparent; border: 0; color: var(--encre); font: inherit; cursor: pointer">
<x-import component-from-global-scope="Constellation.PastilleLigne" ligne="{{l.id}}"></x-import><span style="font-size: 14px; font-weight: 400; color: var(--encre-douce)">{{l.compte}} {{l.chevron}}</span></button></h2>
<sc-if value="{{l.ouvert}}" hint-placeholder-val="{{false}}">
<ul style="list-style: none; margin: 0; padding: 0 16px 8px"><sc-for list="{{l.metiers}}" as="m" hint-placeholder-count="4"><li style="display: flex; align-items: center; gap: 10px; min-height: 44px; border-top: 1px solid var(--trait)"><x-import component-from-global-scope="Constellation.Station" ligne="{{l.id}}" categorie="{{m.cat}}" type="{{m.type}}"></x-import><a href="{{m.href}}" style="color: var(--encre); font-weight: 700; text-decoration: none; font-size: 16px; line-height: 22px">{{m.t}}</a></li></sc-for></ul>
</sc-if>
</section>
</sc-for>
''' + t[b:]
L = []
for mb in D['macro_branches']:
    ms = []
    for c in mb['categories']:
        xs = [m for m in D['metiers'] if m['categorie'] == c]
        ms += [{'t': m['titre'], 'cat': c, 'type': m['type'], 'href': FICHE.get(m['id'], '#')} for m in [x for x in xs if x['type'] == 'entree'] + [x for x in xs if x['type'] == 'evolution']]
    L.append({'id': mb['id'], 'metiers': ms})
a = t.index('class Component extends DCLogic'); b = t.index('</script>', a)
t = t[:a] + '''class Component extends DCLogic {
constructor(props) { super(props); this.state = { menu: false, ouvertes: { developpement: true }, q: '' }; }
renderVals() {
const L = ''' + json.dumps(L, ensure_ascii=False) + ''';
const st = this.state;
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
const q = norm(st.q.trim());
const lignes = L.map((l) => {
  const ms = q ? l.metiers.filter((m) => norm(m.t).indexOf(q) >= 0) : l.metiers;
  const ouvert = q ? ms.length > 0 : !!st.ouvertes[l.id];
  return { id: l.id, metiers: ms, ouvert: ouvert, ouvertTxt: ouvert ? 'true' : 'false', chevron: ouvert ? '▴' : '▾', compte: ms.length + (ms.length > 1 ? ' métiers' : ' métier'),
    basculer: () => { const o = Object.assign({}, this.state.ouvertes); o[l.id] = !o[l.id]; this.setState({ ouvertes: o }); } };
}).filter((l) => !q || l.metiers.length);
return { ''' + MENU_JS + '''
  lignes: lignes, q: st.q, chercher: (e) => this.setState({ q: e.target.value }),
  vues: [{ value: 'graphe', label: 'Graphe', href: 'Main.dc.html' }, { value: 'liste', label: 'Liste', href: 'm-nuage.dc.html' }]
};
}
}
''' + t[b:]
open(f'{A}/m-nuage.dc.html', 'w').write(t)
js = t[t.index('class Component'):t.index('</script>', t.index('class Component'))]
open('mn.js', 'w').write('class DCLogic { constructor(p){this.props=p;} setState(s){Object.assign(this.state, s);} }\n' + js + '''
const c = new Component({}); let v = c.renderVals(); console.log(v.lignes.map(l => l.id + ':' + l.ouvert).join(' '));
v.lignes[2].basculer(); v = c.renderVals(); console.log('cyber ouvert', v.lignes[2].ouvert);
v.chercher({ target: { value: 'data' } }); v = c.renderVals(); console.log(v.lignes.map(l => l.id + ' ' + l.compte));
v.basculerMenu(); v = c.renderVals(); console.log('menu', v.menuOuvert, v.libelleMenu);''')
print(subprocess.run(['node', 'mn.js'], capture_output=True, text=True))
for n in ['m-fiche.dc.html', 'm-roadmap.dc.html']:
    t = open(f'{A}/{n}').read(); js = t[t.index('class Component'):t.index('</script>', t.index('class Component'))]
    open('mx.js', 'w').write('class DCLogic { constructor(p){this.props=p;} setState(s){Object.assign(this.state, s);} }\n' + js + '\nconst c = new Component({}); let v = c.renderVals(); v.basculerMenu(); v = c.renderVals(); console.log(v.menuOuvert);')
    print(n, subprocess.run(['node', 'mx.js'], capture_output=True, text=True).stdout.strip())
