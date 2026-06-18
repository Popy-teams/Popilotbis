import { PORTFOLIO_PROJECT_SLUGS } from './multiProjectDemoFixtures';
import {
  AUDIT_BLOCK_META,
  type AuditBlockId,
  type StoredAuditBlock,
} from './auditHelpers';

const PROJECT_NAMES: Record<string, string> = {
  'ia-emotions': 'IA Emotionnelle Temps Reel',
  'app-parent': 'Application Parent & Portail Enseignant',
  'cyber-rgpd': 'Programme Cybersecurite & RGPD',
  'firmware-v2': 'Firmware Robot V2',
  certification: 'Certification & Qualite Produit',
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

function demoScore(slug: string, index: number): number {
  const base = 58 + (slug.length % 5) * 3;
  return Math.min(95, base + index * 4);
}

export function createDemoAuditBlocksForProject(projectSlug: string): StoredAuditBlock[] {
  const projectName = PROJECT_NAMES[projectSlug] ?? projectSlug;
  return BLOCK_IDS.map((blockId, index) => {
    const meta = AUDIT_BLOCK_META[blockId];
    const score = demoScore(projectSlug, index);
    return {
      id: blockId,
      projectId: projectSlug,
      title: meta.title,
      subtitle: meta.subtitle,
      color: meta.color,
      isoRef: meta.isoRef,
      score,
      keyQuestion: meta.keyQuestion,
      criteria: [
        {
          id: `crit-${projectSlug}-${blockId}`,
          title: `Critère démo — ${meta.title}`,
          description: `Évaluation ISO 9001 pour ${projectName} (${meta.isoRef}).`,
          status: score >= 80 ? 'compliant' : score >= 65 ? 'partial' : 'non-compliant',
          score,
          evidence: [`Pilotage actif du projet ${projectName}`],
          gaps: score >= 80 ? [] : ['Documentation complémentaire à finaliser'],
          actions: score >= 80 ? [] : [`action-${projectSlug}-${blockId}`],
          linkedModules: ['tasks', 'documentation'],
          lastReview: '2026-01-18',
          isoRef: meta.isoRef,
        },
      ],
    };
  });
}

export const DEMO_AUDIT_BLOCKS_BY_PROJECT: StoredAuditBlock[] = PORTFOLIO_PROJECT_SLUGS.flatMap(
  (slug) => createDemoAuditBlocksForProject(slug)
);
