"""Assemble l'artboard jouable du quiz (16 vraies questions, vrai calcul du top 3) et sa variante figée sur le résultat."""
import json, itertools
D = json.load(open('/srv/AdrienGras/constellation/metiers.json', encoding='utf-8'))
CAT = {c['id']: c['libelle'] for c in D['categories']}
branches = []
for mb in D['macro_branches']:
    ex = [m['titre'] for c in mb['categories'] for m in D['metiers'] if m['categorie'] == c and m['type'] == 'entree'][:3]
    branches.append({'id': mb['id'], 'cats': ', '.join(CAT[c] for c in mb['categories']), 'exemples': ', '.join(ex)})
qs = [{'id': q['id'], 'intitule': q['intitule'], 'options': [{'value': r['id'], 'label': r['texte']} for r in q['reponses']], 'poids': {r['id']: r['poids'] for r in q['reponses']}} for q in D['quiz']['questions']]
# réponses d'exemple pour la variante figée : favoriser développement, puis infra, puis data
pref = {'developpement': 100, 'infra-cloud': 10, 'data-ia': 6}
exemple = {}
for q in qs:
    exemple[q['id']] = max(q['poids'], key=lambda r: sum(pref.get(b, 0) * w for b, w in q['poids'][r].items()))
score = {b['id']: 0 for b in branches}
for q in qs:
    for b, w in q['poids'][exemple[q['id']]].items(): score[b] += w
print('top exemple', sorted(score.items(), key=lambda x: -x[1])[:4])
LOGIQUE = '''class Component extends DCLogic {
constructor(props) { super(props); this.state = { i: 0, reponses: @@INIT@@, fini: @@FINI@@ }; }
renderVals() {
const QS = @@QS@@;
const BR = @@BR@@;
const st = this.state, n = QS.length;
const q = QS[st.i];
const questions = QS.map((x, k) => ({ id: x.id, num: k + 1, intitule: x.intitule, options: x.options, visible: !st.fini && k === st.i, choix: st.reponses[x.id], pick: (v) => this.setState({ reponses: Object.assign({}, this.state.reponses, { [x.id]: v }) }) }));
const score = {}; BR.forEach((b) => { score[b.id] = 0; });
QS.forEach((x) => { const r = st.reponses[x.id]; if (r) { const p = x.poids[r]; Object.keys(p).forEach((b) => { score[b] += p[b]; }); } });
const top = BR.map((b, k) => ({ b: b, k: k, s: score[b.id] })).sort((a, c) => c.s - a.s || a.k - c.k).slice(0, 3).map((t, r) => ({ id: t.b.id, cats: t.b.cats, exemples: t.b.exemples, rang: r + 1 }));
const repondu = !!st.reponses[q.id];
return {
  enCours: !st.fini, fini: st.fini, questions: questions, top: top,
  num: st.i + 1, max: n, progression: 'Question ' + (st.i + 1) + ' sur ' + n, reste: (n - st.i - 1) + ' restantes',
  premiere: st.i === 0, pasRepondu: !repondu, libelleSuivant: st.i === n - 1 ? 'Voir mon résultat' : 'Question suivante',
  precedent: () => this.setState({ i: Math.max(0, st.i - 1) }),
  suivant: () => { if (!repondu) return; if (st.i === n - 1) this.setState({ fini: true }); else this.setState({ i: st.i + 1 }); },
  refaire: () => this.setState({ i: 0, reponses: {}, fini: false })
};
}
}'''
def artboard(titre, init, fini, hauteur):
    logique = LOGIQUE.replace('@@QS@@', json.dumps([{k: q[k] for k in ('id', 'intitule', 'options', 'poids')} for q in qs], ensure_ascii=False)).replace('@@BR@@', json.dumps(branches, ensure_ascii=False)).replace('@@INIT@@', json.dumps(init)).replace('@@FINI@@', 'true' if fini else 'false')
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>{titre}</title>
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
<x-import component-from-global-scope="Constellation.BarreNavigation" actif="quiz"></x-import>
<main id="contenu" style="max-width: 880px; margin: 0 auto; padding: 40px 48px 64px; display: flex; flex-direction: column; gap: 28px">
<sc-if value="{{{{enCours}}}}" hint-placeholder-val="{{{{true}}}}">
<div style="display: flex; flex-direction: column; gap: 8px">
<p class="etiquette" style="margin: 0; color: var(--encre-douce)">Quiz · environ 10 minutes</p>
<x-import component-from-global-scope="Constellation.Progress" value="{{{{num}}}}" max="{{{{max}}}}" label="{{{{progression}}}}" detail="{{{{reste}}}}"></x-import>
</div>
<sc-for list="{{{{questions}}}}" as="q" hint-placeholder-count="1">
<sc-if value="{{{{q.visible}}}}" hint-placeholder-val="{{{{true}}}}">
<div style="display: flex; flex-direction: column; gap: 20px">
<h1 class="titre-1" style="margin: 0; font-size: 34px; line-height: 40px">{{{{q.intitule}}}}</h1>
<x-import component-from-global-scope="Constellation.RadioGroup" variant="carte" legend="{{{{q.intitule}}}}" legende-masquee="{{{{max}}}}" options="{{{{q.options}}}}" name="{{{{q.id}}}}" default-value="{{{{q.choix}}}}" on-value-change="{{{{q.pick}}}}"></x-import>
</div>
</sc-if>
</sc-for>
<div style="display: flex; justify-content: space-between; gap: 12px">
<x-import component-from-global-scope="Constellation.Button" variant="ghost" on-click="{{{{precedent}}}}" disabled="{{{{premiere}}}}">← Question précédente</x-import>
<x-import component-from-global-scope="Constellation.Button" size="lg" on-click="{{{{suivant}}}}" disabled="{{{{pasRepondu}}}}">{{{{libelleSuivant}}}}</x-import>
</div>
<p style="margin: 0; font-size: 15px; color: var(--encre-douce)">Il n’y a pas de bonne réponse : choisis ce qui te ressemble le plus, même de peu.</p>
</sc-if>
<sc-if value="{{{{fini}}}}" hint-placeholder-val="{{{{false}}}}">
<div style="display: flex; flex-direction: column; gap: 8px">
<p class="etiquette" style="margin: 0; color: var(--encre-douce)">Résultat du quiz</p>
<h1 class="titre-affiche" style="margin: 0">Tes 3 lignes de départ</h1>
<p class="chapo" style="margin: 0">Un point de départ, pas un verdict. Ce matin, tu vas justement explorer ailleurs : 3 métiers hors de ces lignes.</p>
</div>
<div style="display: flex; flex-direction: column; gap: 16px">
<sc-for list="{{{{top}}}}" as="t" hint-placeholder-count="3">
<section style="background: var(--surface); border-radius: var(--rayon-lg); box-shadow: var(--ombre-carte); padding: 20px 24px; display: flex; flex-direction: column; gap: 8px; border-left: 0">
<x-import component-from-global-scope="Constellation.PastilleLigne" ligne="{{{{t.id}}}}" taille="lg" rang="{{{{t.rang}}}}"></x-import>
<p style="margin: 0; color: var(--encre-douce)">{{{{t.cats}}}}</p>
<p style="margin: 0; font-size: 15px">Par exemple : {{{{t.exemples}}}}</p>
</section>
</sc-for>
</div>
<div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center">
<a href="nuage-apres-quiz.dc.html" class="cs-btn cs-btn-default cs-btn-lg">Voir mes lignes sur le plan</a>
<x-import component-from-global-scope="Constellation.Button" variant="secondary" size="lg" on-click="{{{{refaire}}}}">Refaire le quiz</x-import>
</div>
<x-import component-from-global-scope="Constellation.Alert" variant="neutre" icone="disque" title="Résultat gardé dans ce navigateur." role="status">Tu peux refaire le quiz quand tu veux ; seul le dernier résultat compte.</x-import>
</sc-if>
</main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1280,"height":{hauteur}}}}}'>
{logique}
</script>
</body>
</html>
'''
B = '/tmp/claude-1000/-srv-AdrienGras-constellation/820987da-176b-4916-b2a1-c70a10db0665/scratchpad/canevas/root/project/'
for nom, titre, init, fini, h in [('quiz-question.dc.html', 'Quiz', {}, False, 960), ('quiz-resultat.dc.html', 'Résultat du quiz', exemple, True, 1060)]:
    t = artboard(titre, init, fini, h)
    seg = t[t.index("data-props='") + 12:]; seg = seg[:seg.index("'>")]
    assert "'" not in seg
    open(B + nom, 'w').write(t); print(nom, len(t))
# vérifier la logique JS
import subprocess, re
js = t[t.index('class Component'):t.index('</script>', t.index('class Component'))]
open('/tmp/claude-1000/-srv-AdrienGras-constellation/820987da-176b-4916-b2a1-c70a10db0665/scratchpad/canevas/quiz-logique.js', 'w').write('class DCLogic { constructor(p){this.props=p;} setState(s){Object.assign(this.state, s);} }\n' + js + '\nconst c = new Component({}); const v = c.renderVals(); console.log(v.fini, v.top.map(t => t.rang + " " + t.id).join(", "), v.questions.length);')
print(subprocess.run(['node', '/tmp/claude-1000/-srv-AdrienGras-constellation/820987da-176b-4916-b2a1-c70a10db0665/scratchpad/canevas/quiz-logique.js'], capture_output=True, text=True))
