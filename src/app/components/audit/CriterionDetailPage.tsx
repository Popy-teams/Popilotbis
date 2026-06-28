import { AlertCircle, AlertTriangle, ArrowRight, Check, CheckCircle, Link2, Pencil, Trash2 } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import type { AuditCriterion } from '../../data/auditHelpers';
import { moduleLabel, scoreBarColor, scoreTone, statusLabel, statusTone } from './auditPresentation';

interface CriterionDetailPageProps {
  blockTitle: string;
  criterion: AuditCriterion;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CriterionDetailPage({ blockTitle, criterion, onBack, onEdit, onDelete }: CriterionDetailPageProps) {
  return (
    <ViewShell>
      <PageBackHeader
        title={criterion.title}
        subtitle={`${blockTitle} · ${criterion.isoRef}`}
        onBack={onBack}
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton variant="secondary" icon={Pencil} onClick={onEdit}>
              Modifier
            </ActionButton>
            <ActionButton variant="danger" icon={Trash2} onClick={onDelete}>
              Supprimer
            </ActionButton>
          </div>
        }
      />

      <div className="space-y-5 max-w-3xl">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(criterion.status)}`}>
              {statusLabel(criterion.status)}
            </span>
            <span className={`text-sm font-bold ${scoreTone(criterion.score)}`}>{criterion.score}%</span>
          </div>
          <p className="text-stone-700 leading-relaxed">{criterion.description}</p>
          <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
            <div className={`h-full ${scoreBarColor(criterion.score)}`} style={{ width: `${criterion.score}%` }} />
          </div>
          <p className="text-xs text-stone-500">
            Dernière revue : {new Date(criterion.lastReview).toLocaleDateString('fr-FR')}
          </p>
        </section>

        {criterion.evidence.length > 0 ? (
          <DetailSection title="Preuves de conformité" icon={CheckCircle} tone="emerald">
            <ul className="space-y-2">
              {criterion.evidence.map((ev) => (
                <li key={ev} className="flex gap-2 text-sm text-emerald-800">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  {ev}
                </li>
              ))}
            </ul>
          </DetailSection>
        ) : null}

        {criterion.gaps.length > 0 ? (
          <DetailSection title="Écarts identifiés" icon={AlertCircle} tone="amber">
            <ul className="space-y-2">
              {criterion.gaps.map((gap) => (
                <li key={gap} className="flex gap-2 text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {gap}
                </li>
              ))}
            </ul>
          </DetailSection>
        ) : null}

        {criterion.actions.length > 0 ? (
          <DetailSection title="Actions planifiées" icon={ArrowRight} tone="indigo">
            <div className="flex flex-wrap gap-2">
              {criterion.actions.map((action) => (
                <span key={action} className="text-sm bg-indigo-50 text-indigo-800 border border-indigo-100 px-3 py-1.5 rounded-lg font-medium">
                  {action}
                </span>
              ))}
            </div>
          </DetailSection>
        ) : null}

        {criterion.linkedModules.length > 0 ? (
          <DetailSection title="Modules liés" icon={Link2} tone="stone">
            <div className="flex flex-wrap gap-2">
              {criterion.linkedModules.map((m) => (
                <span key={m} className="text-xs font-medium bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full">
                  {moduleLabel(m)}
                </span>
              ))}
            </div>
          </DetailSection>
        ) : null}
      </div>
    </ViewShell>
  );
}

function DetailSection({
  title,
  icon: Icon,
  tone,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'emerald' | 'amber' | 'indigo' | 'stone';
  children: React.ReactNode;
}) {
  const tones = {
    emerald: 'border-emerald-200 bg-emerald-50/40',
    amber: 'border-amber-200 bg-amber-50/40',
    indigo: 'border-indigo-200 bg-indigo-50/40',
    stone: 'border-stone-200 bg-stone-50/40',
  };
  return (
    <section className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <h3 className="font-semibold text-stone-900 flex items-center gap-2 mb-3 text-sm">
        <Icon className="w-4 h-4" />
        {title}
      </h3>
      {children}
    </section>
  );
}
