import { PORTFOLIO_PROJECT_SLUGS } from './multiProjectDemoFixtures';
import { INITIAL_AUDIT_BLOCKS } from './initialAuditBlocks';
import {
  AUDIT_BLOCK_META,
  AUDIT_FIXTURE_VERSION,
  type AuditBlockId,
  type AuditCriterion,
  type ComplianceStatus,
  type StoredAuditBlock,
} from './auditHelpers';

export { AUDIT_FIXTURE_VERSION };

const PROJECT_NAMES: Record<string, string> = {
  popy: 'POPY — Robot éducatif',
  'ia-emotions': 'IA Emotionnelle Temps Réel',
  'app-parent': 'Application Parent & Portail Enseignant',
  'cyber-rgpd': 'Programme Cybersécurité & RGPD',
  'firmware-v2': 'Firmware Robot V2',
  certification: 'Certification & Qualité Produit',
};

const BLOCK_IDS: AuditBlockId[] = [
  'context',
  'leadership',
  'planning',
  'execution',
  'documentation',
  'satisfaction',
  'improvement',
  'continuous',
];

const MODULES_BY_BLOCK: Record<AuditBlockId, string[]> = {
  context: ['marketing', 'documentation', 'pipeline'],
  leadership: ['team', 'meetings', 'tasks'],
  planning: ['risks', 'pipeline', 'budget'],
  execution: ['budget', 'team', 'tasks'],
  documentation: ['documentation', 'meetings'],
  satisfaction: ['satisfaction', 'marketing'],
  improvement: ['risks', 'veille', 'satisfaction'],
  continuous: ['all', 'documentation', 'meetings'],
};

function statusFromScore(score: number): ComplianceStatus {
  if (score >= 85) return 'compliant';
  if (score >= 65) return 'partial';
  return 'non-compliant';
}

function crit(
  id: string,
  title: string,
  description: string,
  score: number,
  opts?: Partial<Pick<AuditCriterion, 'evidence' | 'gaps' | 'actions' | 'linkedModules' | 'isoRef' | 'lastReview'>>
): AuditCriterion {
  const status = statusFromScore(score);
  return {
    id,
    title,
    description,
    status,
    score,
    evidence: opts?.evidence ?? (status === 'compliant' ? ['Preuve documentée en base Popilot'] : []),
    gaps:
      opts?.gaps ??
      (status !== 'compliant' ? ['Point de vigilance identifié lors de la dernière revue'] : []),
    actions:
      opts?.actions ??
      (status !== 'compliant' ? [`action-${id}`] : []),
    linkedModules: opts?.linkedModules ?? ['tasks', 'documentation'],
    lastReview: opts?.lastReview ?? '2026-02-10',
    isoRef: opts?.isoRef ?? '§X',
  };
}

const CRITERIA_TEMPLATES: Record<
  AuditBlockId,
  (slug: string, name: string) => Omit<AuditCriterion, 'id' | 'status' | 'score'>[]
> = {
  context: (slug, name) => [
    {
      title: 'Vision et positionnement documentés',
      description: `La vision du projet ${name} est formalisée et partagée.`,
      evidence: ['Note de cadrage validée', 'Stratégie produit / marketing à jour'],
      gaps: slug === 'cyber-rgpd' ? ['Cartographie réglementaire à compléter'] : [],
      actions: slug === 'cyber-rgpd' ? ['task-regulatory-map'] : [],
      linkedModules: ['marketing', 'documentation'],
      lastReview: '2026-02-08',
      isoRef: '§4.1',
    },
    {
      title: 'Objectifs SMART suivis',
      description: 'Les objectifs projet sont mesurables et revus mensuellement.',
      evidence: ['Pipeline avec jalons', 'KPIs de phase renseignés'],
      gaps: ['Tableau de bord objectifs transverse à finaliser'],
      actions: ['task-unified-objectives'],
      linkedModules: ['pipeline', 'popy-project'],
      lastReview: '2026-02-05',
      isoRef: '§4.2',
    },
    {
      title: 'Parties intéressées identifiées',
      description: 'Parties prenantes et attentes documentées.',
      evidence: ['Liste financeurs / fournisseurs', 'Retours utilisateurs pilotes'],
      gaps: ['Matrice parties prenantes incomplète'],
      actions: ['task-stakeholder-matrix'],
      linkedModules: ['team', 'satisfaction'],
      lastReview: '2026-01-28',
      isoRef: '§4.2',
    },
  ],
  leadership: (slug, name) => [
    {
      title: 'Rôles et responsabilités',
      description: `Chaque membre de ${name} a un rôle et des responsabilités clairs.`,
      evidence: ['Fiches rôles dans Équipe', 'Assignation sur les tâches'],
      gaps: [],
      actions: [],
      linkedModules: ['team', 'tasks'],
      lastReview: '2026-02-09',
      isoRef: '§5.3',
    },
    {
      title: 'Décisions tracées',
      description: 'Les décisions structurantes sont consignées.',
      evidence: ['Comptes rendus de réunion', 'Historique documentation'],
      gaps: slug === 'firmware-v2' ? ['Décisions techniques informelles non tracées'] : [],
      actions: slug === 'firmware-v2' ? ['task-decision-log'] : [],
      linkedModules: ['meetings', 'documentation'],
      lastReview: '2026-02-01',
      isoRef: '§5.1',
    },
  ],
  planning: (slug, name) => [
    {
      title: 'Registre des risques',
      description: `Risques identifiés et suivis pour ${name}.`,
      evidence: ['Module Risques alimenté', 'Plans de mitigation'],
      gaps: slug === 'certification' ? ['2 risques sans plan d\'action'] : [],
      actions: slug === 'certification' ? ['task-risk-mitigation'] : [],
      linkedModules: ['risks'],
      lastReview: '2026-02-10',
      isoRef: '§6.1',
    },
    {
      title: 'Opportunités d\'amélioration',
      description: 'Veille et retours clients exploités.',
      evidence: ['Veille technologique', 'Feedback satisfaction'],
      gaps: [],
      actions: [],
      linkedModules: ['veille', 'satisfaction'],
      lastReview: '2026-02-03',
      isoRef: '§6.1',
    },
    {
      title: 'Suivi des objectifs',
      description: 'Avancement vs objectifs mesuré.',
      evidence: ['Pipeline', 'Budget avec écarts'],
      gaps: ['Dashboard unifié manquant'],
      actions: ['task-dashboard-objectives'],
      linkedModules: ['pipeline', 'budget'],
      lastReview: '2026-01-25',
      isoRef: '§6.2',
    },
  ],
  execution: (slug, name) => [
    {
      title: 'Compétences de l\'équipe',
      description: 'Compétences alignées sur les livrables.',
      evidence: ['Matrice compétences', 'Tâches assignées par profil'],
      gaps: [],
      actions: [],
      linkedModules: ['team', 'tasks'],
      lastReview: '2026-02-07',
      isoRef: '§7.2',
    },
    {
      title: 'Maîtrise budgétaire',
      description: `Budget ${name} planifié et suivi.`,
      evidence: ['BOM / postes budgétaires', 'Sources de financement'],
      gaps: slug === 'ia-emotions' ? ['Écarts sur sous-traitance IA'] : [],
      actions: slug === 'ia-emotions' ? ['task-budget-variance'] : [],
      linkedModules: ['budget'],
      lastReview: '2026-02-04',
      isoRef: '§7.1.3',
    },
    {
      title: 'Évaluation fournisseurs',
      description: 'Fournisseurs identifiés et suivis.',
      evidence: ['Fiches fournisseurs'],
      gaps: ['Grille d\'évaluation formelle absente'],
      actions: ['task-supplier-eval'],
      linkedModules: ['budget'],
      lastReview: '2026-01-20',
      isoRef: '§8.4',
    },
  ],
  documentation: (slug, name) => [
    {
      title: 'Documents obligatoires ISO',
      description: 'Catégories documentaires présentes.',
      evidence: ['7 catégories ISO', 'Procédures et MO'],
      gaps: [],
      actions: [],
      linkedModules: ['documentation'],
      lastReview: '2026-02-11',
      isoRef: '§7.5.3',
    },
    {
      title: 'Versioning et historique',
      description: 'Versions des documents tracées.',
      evidence: ['Historique des révisions'],
      gaps: [],
      actions: [],
      linkedModules: ['documentation'],
      lastReview: '2026-02-06',
      isoRef: '§7.5.3',
    },
    {
      title: 'Contrôle d\'accès',
      description: 'Accès aux documents maîtrisé.',
      evidence: ['Catégories et tags'],
      gaps: ['Politique de droits à formaliser'],
      actions: ['task-access-policy'],
      linkedModules: ['documentation'],
      lastReview: '2026-01-30',
      isoRef: '§7.5.3',
    },
  ],
  satisfaction: (slug, name) => [
    {
      title: 'Mesure satisfaction client',
      description: 'Sondages par phase projet.',
      evidence: ['Module Satisfaction', 'CSAT / NPS / CES'],
      gaps: [],
      actions: [],
      linkedModules: ['satisfaction'],
      lastReview: '2026-02-10',
      isoRef: '§9.1.2',
    },
    {
      title: 'Analyse des retours',
      description: 'Thèmes récurrents et sentiment analysés.',
      evidence: ['Insights automatiques', 'Verbatims classés'],
      gaps: [],
      actions: [],
      linkedModules: ['satisfaction'],
      lastReview: '2026-02-08',
      isoRef: '§9.1.2',
    },
    {
      title: 'Actions issues des feedbacks',
      description: 'Retours clients → plan d\'actions.',
      evidence: ['Liens satisfaction → tâches'],
      gaps: ['3 feedbacks sans action assignée'],
      actions: ['task-feedback-backlog'],
      linkedModules: ['satisfaction', 'tasks'],
      lastReview: '2026-02-02',
      isoRef: '§10.2',
    },
  ],
  improvement: (slug, name) => [
    {
      title: 'Suivi des indicateurs',
      description: 'KPIs définis et suivis.',
      evidence: ['KPIs budget', 'KPIs satisfaction', 'KPIs marketing'],
      gaps: [],
      actions: [],
      linkedModules: ['budget', 'satisfaction', 'marketing'],
      lastReview: '2026-02-09',
      isoRef: '§9.1',
    },
    {
      title: 'Non-conformités traitées',
      description: 'Écarts documentés et traités.',
      evidence: ['Registre risques'],
      gaps: ['Registre NC ISO dédié manquant'],
      actions: ['task-nc-register'],
      linkedModules: ['risks'],
      lastReview: '2026-01-22',
      isoRef: '§10.2',
    },
    {
      title: 'Capitalisation',
      description: 'Retours d\'expérience documentés.',
      evidence: ['Veille', 'Post-mortems réunions'],
      gaps: ['Base de connaissances à structurer'],
      actions: ['task-knowledge-base'],
      linkedModules: ['veille', 'documentation'],
      lastReview: '2026-02-01',
      isoRef: '§7.1.6',
    },
  ],
  continuous: (slug, name) => [
    {
      title: 'Audit alimenté en continu',
      description: 'Mise à jour automatique des scores.',
      evidence: ['Connexions inter-modules Popilot'],
      gaps: [],
      actions: [],
      linkedModules: ['all'],
      lastReview: '2026-02-11',
      isoRef: '§9.2',
    },
    {
      title: 'Traçabilité bout en bout',
      description: 'Chaîne réunion → tâche → preuve.',
      evidence: ['CR réunions', 'Tâches liées', 'Documentation'],
      gaps: [],
      actions: [],
      linkedModules: ['meetings', 'tasks', 'documentation'],
      lastReview: '2026-02-07',
      isoRef: '§9.2',
    },
    {
      title: 'Export des preuves',
      description: 'Rapport d\'audit exportable.',
      evidence: ['Écran export audit'],
      gaps: ['Génération PDF automatique à finaliser'],
      actions: ['task-audit-pdf-export'],
      linkedModules: ['all'],
      lastReview: '2026-02-04',
      isoRef: '§9.2',
    },
  ],
};

function blockScore(criteria: AuditCriterion[]): number {
  if (!criteria.length) return 0;
  return Math.round(criteria.reduce((s, c) => s + c.score, 0) / criteria.length);
}

function demoScoreForBlock(slug: string, blockIndex: number, critIndex: number): number {
  const seed = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 62 + (seed % 12) + blockIndex * 2;
  const variance = critIndex % 3 === 0 ? -8 : critIndex % 3 === 1 ? 5 : 0;
  return Math.min(98, Math.max(52, base + variance));
}

export function createDemoAuditBlocksForProject(projectSlug: string): StoredAuditBlock[] {
  const projectName = PROJECT_NAMES[projectSlug] ?? projectSlug;
  return BLOCK_IDS.map((blockId, blockIndex) => {
    const meta = AUDIT_BLOCK_META[blockId];
    const templates = CRITERIA_TEMPLATES[blockId](projectSlug, projectName);
    const criteria = templates.map((t, critIndex) => {
      const score = demoScoreForBlock(projectSlug, blockIndex, critIndex);
      return crit(`crit-${projectSlug}-${blockId}-${critIndex}`, t.title, t.description, score, {
        evidence: t.evidence,
        gaps: t.gaps,
        actions: t.actions,
        linkedModules: t.linkedModules ?? MODULES_BY_BLOCK[blockId],
        lastReview: t.lastReview,
        isoRef: t.isoRef,
      });
    });
    return {
      id: blockId,
      projectId: projectSlug,
      title: meta.title,
      subtitle: meta.subtitle,
      color: meta.color,
      isoRef: meta.isoRef,
      score: blockScore(criteria),
      keyQuestion: meta.keyQuestion,
      criteria,
    };
  });
}

export const DEMO_AUDIT_BLOCKS_BY_PROJECT: StoredAuditBlock[] = PORTFOLIO_PROJECT_SLUGS.flatMap((slug) =>
  createDemoAuditBlocksForProject(slug)
);

/** Jeu complet pour initialisation / reset des fixtures (POPY riche + portfolio). */
export const FULL_AUDIT_FIXTURES: StoredAuditBlock[] = [
  ...INITIAL_AUDIT_BLOCKS,
  ...DEMO_AUDIT_BLOCKS_BY_PROJECT,
];
