import type { LucideIcon } from 'lucide-react';
import {
  Target,
  Users,
  Shield,
  Zap,
  FileText,
  Heart,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export type AuditBlockId =
  | 'context'
  | 'leadership'
  | 'planning'
  | 'execution'
  | 'documentation'
  | 'satisfaction'
  | 'improvement'
  | 'continuous';

export type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';

export interface AuditCriterion {
  id: string;
  title: string;
  description: string;
  status: ComplianceStatus;
  score: number;
  evidence: string[];
  gaps: string[];
  actions: string[];
  linkedModules: string[];
  lastReview: string;
  isoRef: string;
}

export interface AuditBlockData {
  id: AuditBlockId;
  projectId?: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  isoRef: string;
  score: number;
  criteria: AuditCriterion[];
  keyQuestion: string;
}

export type StoredAuditBlock = Omit<AuditBlockData, 'icon'>;

export const AUDIT_BLOCK_ICONS: Record<AuditBlockId, LucideIcon> = {
  context: Target,
  leadership: Users,
  planning: Shield,
  execution: Zap,
  documentation: FileText,
  satisfaction: Heart,
  improvement: TrendingUp,
  continuous: RefreshCw,
};

export const AUDIT_BLOCK_META: Record<
  AuditBlockId,
  { title: string; subtitle: string; color: string; isoRef: string; keyQuestion: string }
> = {
  context: {
    title: 'Contexte & Stratégie',
    subtitle: 'Vision, objectifs et parties intéressées',
    color: 'purple',
    isoRef: 'ISO §4',
    keyQuestion: 'Pourquoi ce projet existe-t-il et à quels besoins répond-il ?',
  },
  leadership: {
    title: 'Leadership & Organisation',
    subtitle: 'Rôles, responsabilités et décisions',
    color: 'blue',
    isoRef: 'ISO §5',
    keyQuestion: 'Qui décide, sur quoi, et comment est-ce tracé ?',
  },
  planning: {
    title: 'Planification & Risques',
    subtitle: 'Objectifs, risques et ressources',
    color: 'indigo',
    isoRef: 'ISO §6',
    keyQuestion: 'Les risques et ressources sont-ils anticipés ?',
  },
  execution: {
    title: 'Exécution & Production',
    subtitle: 'Réalisation, fournisseurs et suivi',
    color: 'orange',
    isoRef: 'ISO §8',
    keyQuestion: 'Le projet est-il exécuté selon le plan ?',
  },
  documentation: {
    title: 'Documentation & Traçabilité',
    subtitle: 'Preuves, versions et accès',
    color: 'green',
    isoRef: 'ISO §7.5',
    keyQuestion: 'Les preuves sont-elles accessibles et à jour ?',
  },
  satisfaction: {
    title: 'Satisfaction & Feedback',
    subtitle: 'Clients, utilisateurs et parties prenantes',
    color: 'pink',
    isoRef: 'ISO §9.1',
    keyQuestion: 'Les retours sont-ils collectés et traités ?',
  },
  improvement: {
    title: 'Amélioration & Non-conformités',
    subtitle: 'Actions correctives et capitalisation',
    color: 'red',
    isoRef: 'ISO §10',
    keyQuestion: 'Les écarts déclenchent-ils des actions ?',
  },
  continuous: {
    title: 'Audit Continu',
    subtitle: 'Mise à jour automatique et export',
    color: 'cyan',
    isoRef: 'ISO §9.2',
    keyQuestion: "L'audit est-il intégré au quotidien ?",
  },
};

export function rehydrateAuditBlocks(raw: StoredAuditBlock[]): AuditBlockData[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((block) => block?.id && AUDIT_BLOCK_ICONS[block.id as AuditBlockId])
    .map((block) => ({
      ...block,
      id: block.id as AuditBlockId,
      projectId: block.projectId ?? 'popy',
      icon: AUDIT_BLOCK_ICONS[block.id as AuditBlockId],
      criteria: Array.isArray(block.criteria) ? block.criteria : [],
    }));
}

export function serializeAuditBlocks(blocks: AuditBlockData[]): StoredAuditBlock[] {
  return blocks.map(({ icon: _icon, ...rest }) => rest);
}

export const AUDIT_STORAGE_KEY = 'popilot:audit-local-v2';
export const AUDIT_FIXTURE_VERSION_KEY = 'popilot:audit-fixture-version';
export const AUDIT_FIXTURE_VERSION = 'audit-v3';

/** Fusion par couple projet + bloc (évite d'écraser popy quand un autre projet a le même id de bloc). */
export function mergeAuditBlocks(
  saved: StoredAuditBlock[],
  ...pools: StoredAuditBlock[][]
): StoredAuditBlock[] {
  const key = (b: StoredAuditBlock) => `${b.projectId ?? 'popy'}:${b.id}`;
  const map = new Map<string, StoredAuditBlock>();
  for (const b of saved) map.set(key(b), b);
  for (const pool of pools) {
    for (const b of pool) {
      const k = key(b);
      if (!map.has(k)) map.set(k, b);
    }
  }
  return [...map.values()];
}

export function buildAuditFixtureSeed(...pools: StoredAuditBlock[][]): StoredAuditBlock[] {
  return mergeAuditBlocks([], ...pools);
}
