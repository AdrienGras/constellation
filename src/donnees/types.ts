export type LigneId =
  | 'developpement'
  | 'infra-cloud'
  | 'cybersecurite'
  | 'data-ia'
  | 'qualite-archi'
  | 'produit-design'
  | 'relation-transmission'
  | 'management'
export type Zone = 'paris' | 'grandes_villes' | 'regions'
export type TypeMetier = 'entree' | 'evolution'
export type Fiabilite = 'bonne' | 'moyenne' | 'faible'
export type Fourchette = [number, number]

export interface NiveauSilkhom {
  annees_min: number
  annees_max: number | null
  paris: Fourchette | null
  grandes_villes: Fourchette | null
  regions: Fourchette | null
}
export interface GrilleSilkhom {
  /** Profil Silkhom (Java, Python…) ; null quand la source n’en distingue pas. */
  ligne: string | null
  niveaux: NiveauSilkhom[]
}
export interface Rapprochement {
  de: string
  raison: string
}
export interface Silkhom {
  grilles: GrilleSilkhom[]
  moyenne_keur: number | null
  rapprochement: Rapprochement | null
}
export interface ValeursApec {
  mediane: number | null
  d1?: number | null
  d9?: number | null
}
export interface Apec {
  famille: string
  mediane: number
  d1: number
  d9: number
  idf: ValeursApec | null
  autres_regions: ValeursApec | null
  moins_35_ans: ValeursApec | null
  rapprochement: Rapprochement | null
}

export interface Metier {
  id: string
  categorie: string
  titre: string
  type: TypeMetier
  depuis: string[]
  rome: string | null
  brief: string
  missions: string
  competences: string[]
  a_eviter_si: string
  parcours: string
  salaires: { silkhom: Silkhom | null; apec: Apec | null }
  fiabilite: Fiabilite
  fiabilite_note: string | null
  source_texte: 'cigref' | 'redaction'
  source_texte_detail: string
  voisins_meme_categorie: string[]
  voisins_autres_categories: string[]
  roadmap_url: string | null
}

export interface Categorie {
  id: string
  libelle: string
  nb: number
}
export interface Ligne {
  id: LigneId
  num: number
  libelle: string
  categories: string[]
}
export interface Question {
  id: string
  intitule: string
  reponses: { id: string; texte: string; poids: Partial<Record<LigneId, number>> }[]
}
export interface Source {
  id: string
  titre: string
  editeur: string
  date: string
  url: string
  usage: string
  licence: string
}

export interface PlanQuartier {
  cat: string
  libelle: string
  d: string
  x: number
  y: number
  xf: number
  yf: number
  lx: number
  ly: number
  la: 'start' | 'middle' | 'end'
}
export interface PlanLigne {
  id: LigneId
  num: number
  nom: string
  couleur: string
  fond: string
  d: string
  terminus: [number, number]
  quartiers: PlanQuartier[]
}
export interface PlanStation {
  x: number
  y: number
  titre: string
  type: TypeMetier
  cat: string
  ligne: LigneId
  couleur: string
  voisins: string[]
}
export interface Plan {
  lignes: PlanLigne[]
  stations: Record<string, PlanStation>
}

export interface Donnees {
  meta: { version: string; genere_le: string; mentions: string }
  categories: Categorie[]
  macro_branches: Omit<Ligne, 'num'>[]
  quiz: { questions: Question[] }
  metiers: Metier[]
  sources: Source[]
}
