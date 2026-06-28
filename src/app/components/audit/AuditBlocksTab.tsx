import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle,
  Eye,
  Link2,
  Pencil,
  Plus,
  Target,
} from 'lucide-react';
import type { AuditBlockData, AuditBlockId, AuditCriterion } from '../../data/auditHelpers';
import { ActionButton } from '../shared';
import {
  BLOCK_THEMES,
  moduleLabel,
  scoreBarColor,
  scoreTone,
  statusLabel,
  statusTone,
} from './auditPresentation';

interface AuditBlocksTabProps {
  blocks: AuditBlockData[];
  expandedBlockId: AuditBlockId | null;
  onExpandBlock: (id: AuditBlockId) => void;
  onViewCriterion: (blockId: AuditBlockId, criterion: AuditCriterion) => void;
  onEditCriterion: (blockId: AuditBlockId, criterion: AuditCriterion) => void;
  onCreateCriterion: (blockId: AuditBlockId) => void;
}

export function AuditBlocksTab({
  blocks,
  expandedBlockId,
  onExpandBlock,
  onViewCriterion,
  onEditCriterion,
  onCreateCriterion,
}: AuditBlocksTabProps) {
  const expanded = blocks.find((b) => b.id === expandedBlockId) ?? blocks[0];

  return (
    <div className="space-y-5 min-w-0">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {blocks.map((block) => {
          const theme = BLOCK_THEMES[block.id];
          const Icon = block.icon;
          const selected = expanded?.id === block.id;
          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onExpandBlock(block.id)}
              className={`text-left rounded-xl border p-3 transition-all ${
                selected ? `${theme.border} ${theme.bg} ring-2 ${theme.ring}` : 'border-stone-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${theme.icon}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className={`text-base font-bold ${scoreTone(block.score)}`}>{block.score}%</span>
              </div>
              <p className="text-xs font-semibold text-stone-900 line-clamp-2">{block.title}</p>
              <p className="text-[10px] text-stone-500">{block.criteria.length} critères</p>
            </button>
          );
        })}
      </div>

      {expanded ? (() => {
        const BlockIcon = expanded.icon;
        return (
        <section className="rounded-2xl border border-stone-200/90 bg-white shadow-sm overflow-hidden min-w-0">
          <div className={`h-1 bg-gradient-to-r ${BLOCK_THEMES[expanded.id].gradient}`} />
          <div className="p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${BLOCK_THEMES[expanded.id].icon}`}>
                  <BlockIcon className="w-6 h-6" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-stone-900">{expanded.title}</h2>
                  <p className="text-sm text-stone-600">{expanded.subtitle}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs font-semibold rounded-full border px-2.5 py-0.5 ${BLOCK_THEMES[expanded.id].chip}`}>
                      {expanded.isoRef}
                    </span>
                    <span className={`text-xs font-bold ${scoreTone(expanded.score)}`}>Score {expanded.score}%</span>
                  </div>
                </div>
              </div>
              <ActionButton icon={Plus} onClick={() => onCreateCriterion(expanded.id)} className="w-full sm:w-auto justify-center shrink-0">
                Nouveau critère
              </ActionButton>
            </div>

            <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-4">
              <p className="text-sm text-indigo-900 font-medium flex items-start gap-2">
                <Target className="w-4 h-4 shrink-0 mt-0.5" />
                Question clé : « {expanded.keyQuestion} »
              </p>
            </div>

            <div className="space-y-4">
              {expanded.criteria.map((criterion) => (
                <CriterionCard
                  key={criterion.id}
                  criterion={criterion}
                  onView={() => onViewCriterion(expanded.id, criterion)}
                  onEdit={() => onEditCriterion(expanded.id, criterion)}
                />
              ))}
            </div>
          </div>
        </section>
        );
      })() : null}
    </div>
  );
}

function CriterionCard({
  criterion,
  onView,
  onEdit,
}: {
  criterion: AuditCriterion;
  onView: () => void;
  onEdit: () => void;
}) {
  return (
    <article className="rounded-xl border border-stone-200/90 bg-stone-50/30 p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <StatusIcon status={criterion.status} />
            <h3 className="font-semibold text-stone-900">{criterion.title}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone(criterion.status)}`}>
              {statusLabel(criterion.status)}
            </span>
            <span className="text-[10px] font-mono text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded">
              {criterion.isoRef}
            </span>
          </div>
          <p className="text-sm text-stone-600">{criterion.description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <ActionButton variant="secondary" icon={Eye} onClick={onView} className="!text-xs !px-2.5">
            Voir
          </ActionButton>
          <ActionButton variant="secondary" icon={Pencil} onClick={onEdit} className="!text-xs !px-2.5">
            Modifier
          </ActionButton>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-stone-500 mb-1">
          <span>Score conformité</span>
          <span className={`font-bold ${scoreTone(criterion.score)}`}>{criterion.score}%</span>
        </div>
        <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
          <div className={`h-full ${scoreBarColor(criterion.score)}`} style={{ width: `${criterion.score}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {criterion.evidence.length > 0 ? (
          <Panel title="Preuves" tone="emerald" icon={CheckCircle}>
            {criterion.evidence.map((ev) => (
              <li key={ev} className="flex gap-2 text-sm text-emerald-800">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                {ev}
              </li>
            ))}
          </Panel>
        ) : null}
        {criterion.gaps.length > 0 ? (
          <Panel title="Écarts" tone="amber" icon={AlertCircle}>
            {criterion.gaps.map((gap) => (
              <li key={gap} className="flex gap-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {gap}
              </li>
            ))}
          </Panel>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-stone-500">
        <Link2 className="w-3.5 h-3.5" />
        {criterion.linkedModules.map((m) => (
          <span key={m} className="bg-white border border-stone-200 px-2 py-0.5 rounded-full">
            {moduleLabel(m)}
          </span>
        ))}
        <span className="ml-auto">Revue {new Date(criterion.lastReview).toLocaleDateString('fr-FR')}</span>
      </div>
    </article>
  );
}

function Panel({
  title,
  tone,
  icon: Icon,
  children,
}: {
  title: string;
  tone: 'emerald' | 'amber';
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const tones = {
    emerald: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50/50 text-amber-900',
  };
  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <p className="text-xs font-semibold flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </p>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function StatusIcon({ status }: { status: AuditCriterion['status'] }) {
  if (status === 'compliant') return <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
  if (status === 'non-compliant') return <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
  return <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
}
