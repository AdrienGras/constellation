import type * as React from 'react';

export type LigneId = 'developpement' | 'infra-cloud' | 'cybersecurite' | 'data-ia' | 'qualite-archi' | 'produit-design' | 'relation-transmission' | 'management';
export type Zone = 'paris' | 'grandes_villes' | 'regions';
export type Fourchette = [number, number];
export interface NiveauSilkhom { annees_min: number; annees_max: number | null; paris: Fourchette | null; grandes_villes: Fourchette | null; regions: Fourchette | null }
export interface GrilleSilkhom { ligne: string; niveaux: NiveauSilkhom[] }
export interface Rapprochement { de: string; raison: string }
export interface Silkhom { grilles: GrilleSilkhom[]; moyenne_keur: number | null; rapprochement: Rapprochement | null }
export interface ValeursApec { mediane: number | null; d1?: number | null; d9?: number | null }
export interface Apec { famille: string; mediane: number; d1: number; d9: number; idf: ValeursApec | null; autres_regions: ValeursApec | null; moins_35_ans: ValeursApec | null; rapprochement: Rapprochement | null }
export interface Option { value: string; label: React.ReactNode; description?: React.ReactNode }

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link'; size?: 'default' | 'sm' | 'lg' | 'icon'; icone?: string; as?: 'button' | 'a'; href?: string }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface BadgeProps { variant?: 'secondary' | 'outline' | 'default' | 'succes' | 'attention' | 'danger' | 'neutre'; icone?: string; children?: React.ReactNode }
export declare function Badge(props: BadgeProps): React.ReactElement;
export interface CardProps { as?: string; className?: string; children?: React.ReactNode }
export declare function Card(props: CardProps): React.ReactElement;
export interface TabsProps { label: string; items: { value: string; label: React.ReactNode; content?: React.ReactNode }[]; defaultValue?: string; value?: string; onValueChange?: (v: string) => void }
export declare function Tabs(props: TabsProps): React.ReactElement;
export interface ToggleGroupProps { label: string; items: (Option & { href?: string })[]; defaultValue?: string; value?: string; onValueChange?: (v: string) => void }
export declare function ToggleGroup(props: ToggleGroupProps): React.ReactElement;
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; optional?: boolean; icone?: 'recherche' }
export declare function Input(props: InputProps): React.ReactElement;
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label: React.ReactNode; hint?: React.ReactNode; optional?: boolean }
export declare function Textarea(props: TextareaProps): React.ReactElement;
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label: React.ReactNode; options: Option[]; hint?: React.ReactNode }
export declare function Select(props: SelectProps): React.ReactElement;
export interface RadioGroupProps { legend: React.ReactNode; legendeMasquee?: boolean; options: Option[]; variant?: 'liste' | 'carte'; defaultValue?: string; onValueChange?: (v: string) => void; name?: string }
export declare function RadioGroup(props: RadioGroupProps): React.ReactElement;
export interface AlertProps { variant?: 'info' | 'attention' | 'neutre'; title?: React.ReactNode; children?: React.ReactNode; icone?: string; role?: 'status' | 'alert' }
export declare function Alert(props: AlertProps): React.ReactElement;
export interface TooltipProps { content: React.ReactNode; children: React.ReactElement; open?: boolean }
export declare function Tooltip(props: TooltipProps): React.ReactElement;
export interface DialogProps { open: boolean; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; onClose?: () => void; inline?: boolean }
export declare function Dialog(props: DialogProps): React.ReactElement | null;
export interface TableProps { columns: { key: string; label: React.ReactNode; align?: 'left' | 'right'; num?: boolean }[]; rows: Record<string, React.ReactNode | null>[]; caption?: React.ReactNode; rowHeaders?: boolean }
export declare function Table(props: TableProps): React.ReactElement;
export interface ProgressProps { value: number; max?: number; label: string; detail?: React.ReactNode }
export declare function Progress(props: ProgressProps): React.ReactElement;

export interface BarreNavigationProps { actif: 'nuage' | 'quiz' | 'roadmap' | 'sources' | null; fin?: React.ReactNode; routes?: Partial<Record<'nuage' | 'quiz' | 'roadmap' | 'sources', string>> }
export declare function BarreNavigation(props: BarreNavigationProps): React.ReactElement;
export interface PastilleLigneProps { ligne: LigneId; taille?: 'sm' | 'lg'; rang?: 1 | 2 | 3; sansNom?: boolean }
export declare function PastilleLigne(props: PastilleLigneProps): React.ReactElement;
export interface StationProps { ligne: LigneId; categorie?: string; type: 'entree' | 'evolution'; etat?: 'repos' | 'survol' | 'focus' | 'attenue'; titre?: React.ReactNode }
export declare function Station(props: StationProps): React.ReactElement;
export interface BadgeFiabiliteProps { niveau: 'bonne' | 'moyenne' | 'faible' | 'nd'; note?: string | null }
export declare function BadgeFiabilite(props: BadgeFiabiliteProps): React.ReactElement;
export interface BadgeTypeProps { type: 'entree' | 'evolution' }
export declare function BadgeType(props: BadgeTypeProps): React.ReactElement;
export interface PlageSalaireProps { min: number; max: number; echelle: [number, number]; couleur?: string }
export declare function PlageSalaire(props: PlageSalaireProps): React.ReactElement;
export interface CartoucheSilkhomProps { silkhom: Silkhom | null; type: 'entree' | 'evolution'; depuis?: string[]; ligne?: LigneId; zoneParDefaut?: Zone; raisonAbsence?: string }
export declare function CartoucheSilkhom(props: CartoucheSilkhomProps): React.ReactElement;
export interface CartoucheApecProps { apec: Apec | null; raisonAbsence?: string | null }
export declare function CartoucheApec(props: CartoucheApecProps): React.ReactElement;
export interface ItemRoadmapProps { type: 'projet' | 'notion'; titre: string; url?: string; note?: string; premier?: boolean; dernier?: boolean; onMonter?: () => void; onDescendre?: () => void; onModifier?: () => void; onSupprimer?: () => void }
export declare function ItemRoadmap(props: ItemRoadmapProps): React.ReactElement;

declare global { interface Window { Constellation: { Button: typeof Button; Badge: typeof Badge; Card: typeof Card; Tabs: typeof Tabs; ToggleGroup: typeof ToggleGroup; Input: typeof Input; Textarea: typeof Textarea; Select: typeof Select; RadioGroup: typeof RadioGroup; Alert: typeof Alert; Tooltip: typeof Tooltip; Dialog: typeof Dialog; Table: typeof Table; Progress: typeof Progress; BarreNavigation: typeof BarreNavigation; PastilleLigne: typeof PastilleLigne; Station: typeof Station; BadgeFiabilite: typeof BadgeFiabilite; BadgeType: typeof BadgeType; PlageSalaire: typeof PlageSalaire; CartoucheSilkhom: typeof CartoucheSilkhom; CartoucheApec: typeof CartoucheApec; ItemRoadmap: typeof ItemRoadmap } } }
