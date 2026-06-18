/**
 * Données de démo par projet (hors POPY déjà couvert par les fixtures existantes).
 * Injectées une fois dans le localStorage pour prévisualiser le filtrage par projet actif.
 */

import type { TestTask } from './testData';
import type { PipelineStage } from '../types/planning';

export const PORTFOLIO_PROJECT_SLUGS = [
  'ia-emotions',
  'app-parent',
  'cyber-rgpd',
  'firmware-v2',
  'certification',
] as const;

export type DemoProjectSlug = (typeof PORTFOLIO_PROJECT_SLUGS)[number];

const PROJECT_NAMES: Record<DemoProjectSlug, string> = {
  'ia-emotions': 'IA Emotionnelle Temps Reel',
  'app-parent': 'Application Parent & Portail Enseignant',
  'cyber-rgpd': 'Programme Cybersecurite & RGPD',
  'firmware-v2': 'Firmware Robot V2',
  certification: 'Certification & Qualite Produit',
};

function task(
  id: string,
  projectId: DemoProjectSlug,
  title: string,
  status: TestTask['status'] = 'in-progress'
): TestTask {
  const projectName = PROJECT_NAMES[projectId];
  return {
    id,
    title,
    description: `Tâche de démonstration — ${projectName}`,
    status,
    priority: 'high',
    assignedTo: 'user-1',
    assignedToName: 'Alice Martin',
    projectId,
    projectName,
    dueDate: '2026-04-15',
    progress: status === 'done' ? 100 : 45,
    subtasks: [
      { id: `${id}-st1`, title: 'Analyse préliminaire', completed: true },
      { id: `${id}-st2`, title: 'Mise en œuvre', completed: false },
    ],
  };
}

export const DEMO_TASKS_BY_PROJECT: TestTask[] = [
  task('task-ia-1', 'ia-emotions', 'Entraîner le modèle émotionnel embarqué'),
  task('task-ia-2', 'ia-emotions', 'Benchmark latence inférence on-device', 'todo'),
  task('task-app-1', 'app-parent', 'Maquettes portail enseignant'),
  task('task-app-2', 'app-parent', 'API notifications parents', 'in-progress'),
  task('task-cyber-1', 'cyber-rgpd', 'Audit DPIA données enfants'),
  task('task-cyber-2', 'cyber-rgpd', 'Politique de rétention des logs', 'todo'),
  task('task-fw-1', 'firmware-v2', 'Stabilisation bus I2C capteurs'),
  task('task-fw-2', 'firmware-v2', 'Pipeline OTA signé', 'blocked'),
  task('task-cert-1', 'certification', 'Campagne tests EN71'),
  task('task-cert-2', 'certification', 'Dossier conformité CE', 'in-progress'),
];

export const DEMO_RISKS_BY_PROJECT = PORTFOLIO_PROJECT_SLUGS.map((slug) => ({
  id: `risk-demo-${slug}`,
  projectId: slug,
  title: `Risque planning — ${PROJECT_NAMES[slug]}`,
  description: `Retard potentiel sur une livraison clé du projet ${PROJECT_NAMES[slug]}.`,
  category: 'planning' as const,
  type: 'risk' as const,
  status: 'open' as const,
  probability: 3,
  impacts: { cost: 2, delay: 4, quality: 2, security: 1, image: 2 },
  criticality: 'high' as const,
  criticalityScore: 16,
  strategy: 'reduce' as const,
  actions: [],
  origin: 'review' as const,
  detectedBy: 'user-1',
  detectedByName: 'Jean Dupont',
  detectedAt: '2026-01-12',
  owner: 'user-1',
  ownerName: 'Jean Dupont',
  visibility: 'management' as const,
  history: [
    {
      date: '2026-01-12',
      author: 'user-1',
      authorName: 'Jean Dupont',
      action: 'created',
      description: 'Risque créé (démo)',
    },
  ],
  createdAt: '2026-01-12',
  updatedAt: '2026-01-12',
}));

export const DEMO_MEETINGS_BY_PROJECT = PORTFOLIO_PROJECT_SLUGS.map((slug, i) => ({
  id: 100 + i,
  projectId: slug,
  number: 1,
  title: `Point projet — ${PROJECT_NAMES[slug]}`,
  date: '2026-02-10',
  time: '10:00',
  duration: 60,
  participants: 5,
  writerId: 'user-1',
  writerName: 'Jean Dupont',
  status: 'planned' as const,
  hasReport: false,
  projectName: PROJECT_NAMES[slug],
  decisions: 0,
  actions: 0,
}));

function pipelineStage(
  id: string,
  projectId: DemoProjectSlug,
  name: string,
  order: number,
  progress: number,
  status: PipelineStage['status']
): PipelineStage {
  return {
    id,
    projectId,
    name,
    order,
    status,
    progress,
    objectives: [`Objectif principal — ${name}`],
    deliverables: [`Livrable — ${name}`],
    exitCriteria: ['Critères de sortie validés'],
    tasks: [],
  };
}

export const DEMO_PIPELINE_BY_PROJECT: PipelineStage[] = PORTFOLIO_PROJECT_SLUGS.flatMap((slug) => [
  pipelineStage(`stage-${slug}-1`, slug, 'Cadrage', 1, slug === 'firmware-v2' ? 100 : 80, 'completed'),
  pipelineStage(`stage-${slug}-2`, slug, 'Exécution', 2, slug === 'certification' ? 70 : 40, 'in-progress'),
]);

export const DEMO_CALENDAR_BY_PROJECT = PORTFOLIO_PROJECT_SLUGS.map((slug, i) => ({
  id: `cal-${slug}`,
  projectId: slug,
  title: `Jalon — ${PROJECT_NAMES[slug]}`,
  date: new Date(2026, 1, 5 + i * 3).toISOString(),
  type: 'deadline' as const,
  priority: 'high' as const,
}));

export const DEMO_VEILLE_BY_PROJECT = PORTFOLIO_PROJECT_SLUGS.map((slug) => ({
  id: `veille-${slug}`,
  projectId: slug,
  type: 'technology' as const,
  source: 'Veille interne',
  date: '2026-01-15',
  subject: `Tendances sectorielles — ${PROJECT_NAMES[slug]}`,
  description: 'Entrée de veille de démonstration pour ce projet.',
  impactAnalysis: 'Impact modéré sur la roadmap à moyen terme.',
  decision: 'pending' as const,
  status: 'analyzing' as const,
  responsible: 'Jean Dupont',
  priority: 'medium' as const,
}));

export const DEMO_MARKETING_BY_PROJECT = PORTFOLIO_PROJECT_SLUGS.map((slug) => ({
  id: `ma-${slug}`,
  projectId: slug,
  title: `Communication lancement — ${PROJECT_NAMES[slug]}`,
  phase: 'year1' as const,
  channel: 'LinkedIn',
  status: 'planned' as const,
  description: 'Action marketing de démonstration.',
}));

export const DEMO_SATISFACTION_BY_PROJECT = PORTFOLIO_PROJECT_SLUGS.map((slug) => ({
  id: `sat-${slug}`,
  projectId: slug,
  surveyId: `survey-${slug}`,
  surveyTitle: `Enquête pilote — ${PROJECT_NAMES[slug]}`,
  phase: 'prototype' as const,
  date: '2026-01-20',
  respondent: 'Utilisateur pilote',
  respondentType: 'parent' as const,
  csat: 4,
  verbatim: 'Retour positif sur le concept, attentes élevées sur la livraison.',
  keyTopics: ['UX', 'Délais'],
  sentiment: 'positive' as const,
  status: 'new' as const,
}));

export const DEMO_ALERTS_BY_PROJECT = PORTFOLIO_PROJECT_SLUGS.map((slug) => ({
  id: `alert-${slug}`,
  projectId: slug,
  message: `Point d'attention sur ${PROJECT_NAMES[slug]} : revue planning requise`,
  severity: 'critical' as const,
}));

export const DEMO_BOM_BY_PROJECT = PORTFOLIO_PROJECT_SLUGS.slice(0, 3).map((slug) => ({
  id: `bom-${slug}`,
  projectId: slug,
  category: 'electronics' as const,
  name: `Composant démo — ${PROJECT_NAMES[slug]}`,
  functionalName: 'Module principal',
  example: 'Réf. DEMO-001',
  quantity: 1,
  unitPriceEstimated: 120,
  totalEstimated: 120,
  status: 'to-quote' as const,
  priceSource: 'Estimation interne',
  criticality: 'medium' as const,
  createdAt: '2026-01-10',
  updatedAt: '2026-01-10',
  createdBy: 'user-1',
  lastModifiedBy: 'user-1',
}));
