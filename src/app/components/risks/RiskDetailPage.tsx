import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  History,
  Link2,
  Pencil,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react';
import type { Risk } from '../../types/risks';
import type { PipelineStage } from '../../types/planning';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import {
  CATEGORY_CONFIG,
  IMPACT_AXES,
  categoryChipClass,
  categoryLabel,
  criticalityLabel,
  criticalityTone,
  maxImpact,
  originLabel,
  statusLabel,
  statusTone,
  strategyLabel,
} from './riskPresentation';

interface RiskDetailPageProps {
  risk: Risk;
  stages: PipelineStage[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RiskDetailPage({ risk, stages, onBack, onEdit, onDelete }: RiskDetailPageProps) {
  const CategoryIcon = CATEGORY_CONFIG.find((c) => c.id === risk.category)?.icon;
  const stageName = stages.find((s) => s.id === risk.linkedTo?.stageId)?.name;
  const isOpportunity = risk.type === 'opportunity';

  return (
    <ViewShell>
      <PageBackHeader
        title={risk.title}
        subtitle={
          <span className="inline-flex items-center gap-2 flex-wrap">
            {CategoryIcon ? <CategoryIcon className="w-4 h-4" /> : null}
            {categoryLabel(risk.category)}
            <span className="text-stone-300">·</span>
            {statusLabel(risk.status)}
          </span>
        }
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

      <div className="space-y-5">
        <section
          className={`rounded-2xl border p-6 sm:p-8 shadow-sm ${
            isOpportunity
              ? 'border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white'
              : 'border-stone-200/90 bg-gradient-to-br from-red-50/40 to-white'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  isOpportunity ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isOpportunity ? <TrendingUp className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${criticalityTone(risk.criticality)}`}>
                    {criticalityLabel(risk.criticality)} · score {risk.criticalityScore}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${categoryChipClass(risk.category)}`}>
                    {CategoryIcon ? <CategoryIcon className="w-3 h-3" /> : null}
                    {categoryLabel(risk.category)}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone(risk.status)}`}>
                    {statusLabel(risk.status)}
                  </span>
                  {risk.autoDetected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                      <Bot className="w-3 h-3" /> Auto-détecté
                    </span>
                  ) : null}
                </div>
                <p className="text-stone-700 leading-relaxed max-w-3xl">{risk.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-stone-500">Stratégie</p>
              <p className="text-lg font-bold text-stone-900">{strategyLabel(risk.strategy)}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <section className="xl:col-span-2 rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-stone-900">Analyse des impacts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-4">
                <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Probabilité</p>
                <p className="text-2xl font-bold text-stone-900 mt-1">{risk.probability}/5</p>
                <div className="mt-2 h-2 rounded-full bg-stone-200 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(risk.probability / 5) * 100}%` }} />
                </div>
              </div>
              <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-4">
                <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Impact maximal</p>
                <p className="text-2xl font-bold text-stone-900 mt-1">{maxImpact(risk.impacts)}/5</p>
                <div className="mt-2 h-2 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${(maxImpact(risk.impacts) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {IMPACT_AXES.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-stone-600 shrink-0">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full bg-stone-700 rounded-full"
                      style={{ width: `${(risk.impacts[key] / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm font-semibold text-stone-800 text-right">{risk.impacts[key]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-stone-900">Responsabilité</h3>
            <MetaRow icon={User} label="Propriétaire" value={risk.ownerName ?? '—'} />
            <MetaRow icon={Calendar} label="Détecté le" value={new Date(risk.detectedAt).toLocaleDateString('fr-FR')} />
            <MetaRow icon={User} label="Détecté par" value={risk.detectedByName ?? '—'} />
            <MetaRow icon={History} label="Origine" value={originLabel(risk.origin)} />
            {stageName ? <MetaRow icon={Link2} label="Pipeline" value={stageName} /> : null}
            {risk.tags && risk.tags.length > 0 ? (
              <div>
                <p className="text-xs text-stone-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {risk.tags.map((tag) => (
                    <span key={tag} className="rounded-lg bg-stone-100 px-2 py-1 text-xs text-stone-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm">
          <h3 className="font-semibold text-stone-900 mb-4">Plan d&apos;actions ({risk.actions.length})</h3>
          {risk.actions.length === 0 ? (
            <p className="text-sm text-stone-500">Aucune action enregistrée. Ajoutez-en via la modification du risque.</p>
          ) : (
            <div className="space-y-3">
              {risk.actions.map((action) => (
                <div
                  key={action.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {action.status === 'done' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : action.status === 'in-progress' ? (
                      <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-stone-300 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-stone-900">{action.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {action.responsibleName} · échéance {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 capitalize">
                    {action.status === 'in-progress' ? 'En cours' : action.status === 'done' ? 'Terminé' : 'À faire'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {risk.linkedTo ? (
          <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Liens transversaux
            </h3>
            <div className="flex flex-wrap gap-2">
              {risk.linkedTo.taskIds?.length ? (
                <LinkChip label={`${risk.linkedTo.taskIds.length} tâche(s)`} tone="blue" />
              ) : null}
              {risk.linkedTo.documentIds?.length ? (
                <LinkChip label={`${risk.linkedTo.documentIds.length} document(s)`} tone="green" />
              ) : null}
              {risk.linkedTo.meetingIds?.length ? (
                <LinkChip label={`${risk.linkedTo.meetingIds.length} réunion(s)`} tone="amber" />
              ) : null}
              {risk.linkedTo.stageId ? <LinkChip label="Étape pipeline" tone="violet" /> : null}
            </div>
          </section>
        ) : null}

        {risk.history.length > 0 ? (
          <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <History className="w-4 h-4" /> Historique
            </h3>
            <div className="space-y-4">
              {risk.history.map((entry, idx) => (
                <div key={`${entry.date}-${idx}`} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-stone-300 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-stone-800">{entry.description}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {entry.authorName} · {new Date(entry.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </ViewShell>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-stone-500">{label}</p>
        <p className="text-sm font-medium text-stone-900">{value}</p>
      </div>
    </div>
  );
}

function LinkChip({ label, tone }: { label: string; tone: 'blue' | 'green' | 'amber' | 'violet' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-800',
    violet: 'bg-violet-50 text-violet-700',
  };
  return <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{label}</span>;
}
