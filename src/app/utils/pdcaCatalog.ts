import type { ViewType } from '../routes/viewRoutes';
import type { PdcaModuleLink, PdcaPhase } from '../types/pdca';

/** Référentiel : modules POPILOT classés par phase PDCA (ISO 9001) */
export const PDCA_MODULE_CATALOG: PdcaModuleLink[] = [
  {
    id: 'process',
    phase: 'plan',
    label: 'Approche processus',
    isoRef: '§4 · §8.1',
    description: 'Définition des processus, objectifs et modes opératoires',
  },
  {
    id: 'pipeline',
    phase: 'plan',
    label: 'Pipeline & étapes',
    isoRef: '§6.2',
    description: 'Découpage du projet en jalons et séquencement',
  },
  {
    id: 'calendar',
    phase: 'plan',
    label: 'Planning',
    isoRef: '§6.2',
    description: 'Planification temporelle, cérémonies et échéances',
  },
  {
    id: 'budget',
    phase: 'plan',
    label: 'Budget',
    isoRef: '§6.1',
    description: 'Prévisionnel, BOM et scénarios financiers',
  },
  {
    id: 'risks',
    phase: 'plan',
    label: 'Risques (identification)',
    isoRef: '§6.1',
    description: 'Registre des risques et opportunités — phase Plan',
  },
  {
    id: 'marketing',
    phase: 'plan',
    label: 'Stratégie marketing',
    isoRef: '§4.2',
    description: 'Positionnement, marché et feuille de route commerciale',
  },
  {
    id: 'meetings',
    phase: 'plan',
    label: 'Réunions de cadrage',
    isoRef: '§5.1',
    description: 'Comités, revues de lancement et décisions de planification',
  },
  {
    id: 'tasks',
    phase: 'do',
    label: 'Tâches',
    isoRef: '§8.5',
    description: 'Exécution opérationnelle et livrables',
  },
  {
    id: 'team',
    phase: 'do',
    label: 'Équipe',
    isoRef: '§7.1.2',
    description: 'Mise en œuvre des compétences et charge de travail',
  },
  {
    id: 'budget',
    phase: 'do',
    label: 'Budget (exécution)',
    isoRef: '§8.4',
    description: 'Engagements, achats et consommation du budget',
  },
  {
    id: 'documentation',
    phase: 'do',
    label: 'Documentation (production)',
    isoRef: '§7.5',
    description: 'Rédaction et mise à jour des livrables documentaires',
  },
  {
    id: 'kpi',
    phase: 'check',
    label: 'KPI & performance',
    isoRef: '§9.1',
    description: 'Mesure des indicateurs et écarts vs cibles',
  },
  {
    id: 'audit',
    phase: 'check',
    label: 'Audit ISO 9001',
    isoRef: '§9.2',
    description: 'Vérification de la conformité et des preuves',
  },
  {
    id: 'veille',
    phase: 'check',
    label: 'Veille ISO',
    isoRef: '§4.1',
    description: 'Surveillance réglementaire et environnement',
  },
  {
    id: 'satisfaction',
    phase: 'check',
    label: 'Satisfaction client',
    isoRef: '§9.1.2',
    description: 'Collecte et analyse des retours parties prenantes',
  },
  {
    id: 'risks',
    phase: 'check',
    label: 'Risques (matrice)',
    isoRef: '§9.1',
    description: 'Revue périodique probabilité × impact',
  },
  {
    id: 'meetings',
    phase: 'check',
    label: 'Réunions de revue',
    isoRef: '§9.3',
    description: 'Revue de direction, démos et comptes-rendus',
  },
  {
    id: 'risks',
    phase: 'act',
    label: 'Risques (actions)',
    isoRef: '§10.2',
    description: 'Plans d\'action corrective et clôture des risques',
  },
  {
    id: 'process',
    phase: 'act',
    label: 'Amélioration continue',
    isoRef: '§10.3',
    description: 'Processus d\'amélioration PDCA et rétrospectives',
  },
  {
    id: 'audit',
    phase: 'act',
    label: 'Actions correctives audit',
    isoRef: '§10.2',
    description: 'Levée des écarts et capitalisation',
  },
  {
    id: 'tasks',
    phase: 'act',
    label: 'Tâches d\'amélioration',
    isoRef: '§10.3',
    description: 'Actions issues des rétrospectives et CR',
  },
];

export const PDCA_PHASE_META: Record<
  PdcaPhase,
  { label: string; letter: string; subtitle: string; color: string; gradient: string; isoRef: string }
> = {
  plan: {
    letter: 'P',
    label: 'Planifier',
    subtitle: 'Plan — objectifs, ressources, risques anticipés',
    color: '#2563eb',
    gradient: 'from-blue-500 to-indigo-600',
    isoRef: 'ISO §6',
  },
  do: {
    letter: 'D',
    label: 'Réaliser',
    subtitle: 'Do — exécution et production des livrables',
    color: '#059669',
    gradient: 'from-emerald-500 to-teal-600',
    isoRef: 'ISO §8',
  },
  check: {
    letter: 'C',
    label: 'Vérifier',
    subtitle: 'Check — mesure, audit et analyse des écarts',
    color: '#d97706',
    gradient: 'from-amber-500 to-orange-600',
    isoRef: 'ISO §9',
  },
  act: {
    letter: 'A',
    label: 'Agir',
    subtitle: 'Act — corrections et amélioration continue',
    color: '#7c3aed',
    gradient: 'from-violet-500 to-purple-600',
    isoRef: 'ISO §10',
  },
};

export const PDCA_CHART_COLORS: Record<PdcaPhase, string> = {
  plan: '#2563eb',
  do: '#059669',
  check: '#d97706',
  act: '#7c3aed',
};

export function modulesForPhase(phase: PdcaPhase): PdcaModuleLink[] {
  return PDCA_MODULE_CATALOG.filter((m) => m.phase === phase);
}

export function uniqueModulesByPhase(phase: PdcaPhase): { id: ViewType; label: string; isoRef: string; description: string }[] {
  const seen = new Set<ViewType>();
  const result: { id: ViewType; label: string; isoRef: string; description: string }[] = [];
  for (const m of PDCA_MODULE_CATALOG.filter((x) => x.phase === phase)) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    result.push({ id: m.id, label: m.label.split(' (')[0], isoRef: m.isoRef, description: m.description });
  }
  return result;
}
