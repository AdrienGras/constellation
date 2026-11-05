import json, re, sys, subprocess
A = sys.argv[1]
D = json.load(open('/srv/AdrienGras/constellation/metiers.json', encoding='utf-8'))
LIGNE = {c: mb['id'] for mb in D['macro_branches'] for c in mb['categories']}
FICHES = {'dev-backend': 'fiche-dev-backend.dc.html', 'dsi': 'fiche-dsi.dc.html', 'integrateur-web': 'fiche-integrateur-web.dc.html', 'mlops': 'fiche-mlops.dc.html'}
ROUTES = json.dumps({'nuage': 'Main.dc.html', 'quiz': 'quiz-question.dc.html', 'roadmap': 'roadmap.dc.html', 'sources': 'sources.dc.html'})
METIERS = [{'id': m['id'], 'titre': m['titre'], 'ligne': LIGNE[m['categorie']], 'cat': m['categorie'], 'type': m['type'], 'c': m['competences'], 'href': FICHES.get(m['id'], '')} for m in D['metiers']]
def rep(t, a, b, n=1):
    assert t.count(a) == n, (a[:70], t.count(a)); return t.replace(a, b)
# ---------- E11
p = f'{A}/roadmap.dc.html'; t = open(p).read()
t = rep(t, 'actif="roadmap" fin="Enregistré dans ce navigateur"', 'actif="roadmap" fin="Enregistré dans ce navigateur" routes="{{routes}}"')
t = rep(t, '<h1 class="titre-1" style="margin: 4px 0 0">Cap sur Développeur·se back-end</h1>', '<h1 class="titre-1" style="margin: 4px 0 0">Cap sur {{cible.titre}}</h1>')
t = rep(t, '<p style="margin: 6px 0 0; color: var(--encre-douce)">Le métier visé peut changer : <a href="roadmap-vide.dc.html">choisir un autre métier</a>.</p>',
 '<div style="display: flex; gap: 8px; align-items: center; margin-top: 6px; color: var(--encre-douce)"><span>Le métier visé peut changer.</span><x-import component-from-global-scope="Constellation.Button" variant="link" on-click="{{basculerChoix}}">{{libelleChoix}}</x-import></div>')
PANNEAU = '''<sc-if value="{{choix}}" hint-placeholder-val="{{false}}">
<section aria-label="Choisir le métier visé" style="background: var(--surface); border-radius: var(--rayon-md); box-shadow: var(--ombre-flottante); padding: 20px; display: flex; flex-direction: column; gap: 12px; max-width: 640px">
<x-import component-from-global-scope="Constellation.Input" label="Métier visé" icone="recherche" value="{{q}}" on-change="{{saisirRecherche}}" placeholder="Ex. : DevOps, data, sécurité…"></x-import>
<ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column">
<sc-for list="{{resultats}}" as="r" hint-placeholder-count="6">
<li style="border-top: 1px solid var(--trait)"><button type="button" onClick="{{r.choisir}}" style="display: flex; width: 100%; gap: 10px; align-items: center; min-height: 44px; padding: 4px 8px; background: transparent; border: 0; color: var(--encre); font: inherit; font-weight: 700; text-align: left; cursor: pointer">
<x-import component-from-global-scope="Constellation.Station" ligne="{{r.ligne}}" categorie="{{r.cat}}" type="{{r.type}}"></x-import>{{r.titre}}</button></li>
</sc-for>
</ul>
<p style="margin: 0; font-size: 14px; color: var(--encre-douce)">{{resumeRecherche}}</p>
</section>
</sc-if>
<sc-if value="{{aMessage}}"'''
t = rep(t, '<sc-if value="{{aMessage}}"', PANNEAU)
t = rep(t, '<x-import component-from-global-scope="Constellation.PastilleLigne" ligne="developpement"></x-import>\n<p style="margin: 0; font-weight: 700">Développeur·se back-end</p>',
 '<x-import component-from-global-scope="Constellation.PastilleLigne" ligne="{{cible.ligne}}"></x-import>\n<p style="margin: 0; font-weight: 700">{{cible.titre}}</p>')
t = rep(t, '<a href="fiche-dev-backend.dc.html" style="font-weight: 700">Voir la fiche</a>', '<sc-if value="{{cible.aFiche}}" hint-placeholder-val="{{true}}"><a href="{{cible.href}}" style="font-weight: 700">Voir la fiche</a></sc-if>')
t = t.replace('background: var(--ligne-developpement)"></div>', 'background: {{couleurLigne}}"></div>')
t = t.replace('stroke="var(--ligne-developpement)"', 'stroke="{{couleurLigne}}"').replace('fill="var(--ligne-developpement)"', 'fill="{{couleurLigne}}"')
t = rep(t, "this.state = { annees:", "this.state = { cible: 'dev-backend', choix: false, q: '', annees:")
t = rep(t, 'return {\n  annees: annees, oui: true, competences: ', 'const M = ' + json.dumps(METIERS, ensure_ascii=False) + ''';
const c0 = M.filter((m) => m.id === st.cible)[0];
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
const trouves = st.q.trim() ? M.filter((m) => norm(m.titre).indexOf(norm(st.q.trim())) >= 0) : M;
return {
routes: ''' + ROUTES + ''', cible: { titre: c0.titre, ligne: c0.ligne, href: c0.href, aFiche: !!c0.href }, couleurLigne: 'var(--ligne-' + c0.ligne + ')',
choix: st.choix, q: st.q, libelleChoix: st.choix ? 'fermer le choix' : 'choisir un autre métier',
basculerChoix: () => this.setState({ choix: !this.state.choix, q: '' }), saisirRecherche: (e) => this.setState({ q: e.target.value }),
resultats: trouves.slice(0, 8).map((m) => ({ titre: m.titre, ligne: m.ligne, cat: m.cat, type: m.type, choisir: () => this.setState({ cible: m.id, choix: false, q: '' }) })),
resumeRecherche: trouves.length > 8 ? (trouves.length + ' métiers correspondent ; affine ta recherche.') : (trouves.length ? '' : 'Aucun métier ne correspond.'),
annees: annees, oui: true, competences: c0.c.map((x) => ({ t: x })), competencesInit: ''')
open(p, 'w').write(t)
js = t[t.index('class Component'):t.index('</script>', t.index('class Component'))]
open('rm2.js', 'w').write('class DCLogic { constructor(p){this.props=p;} setState(s){Object.assign(this.state, s);} }\n' + js + '''
const c = new Component({}); let v = c.renderVals(); console.log(v.cible.titre, v.competences.length);
v.basculerChoix(); v = c.renderVals(); v.saisirRecherche({ target: { value: 'securite' } }); v = c.renderVals(); console.log(v.resultats.map(r => r.titre));
v.resultats[0].choisir(); v = c.renderVals(); console.log(v.cible.titre, v.couleurLigne, v.cible.aFiche, v.competences.map(x => x.t).join(' | '));''')
print(subprocess.run(['node', 'rm2.js'], capture_output=True, text=True))
