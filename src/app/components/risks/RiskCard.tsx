import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Pencil,
  TrendingUp,
  User,
} from 'lucide-react';
import type { Risk } from '../../types/risks';
import { ActionButton } from '../shared';
import {
  CATEGORY_CONFIG,
  categoryChipClass,
  categoryLabel,
  criticalityLabel,
  criticalityTone,
  maxImpact,
  statusLabel,
  statusTone,
  strategyLabel,
} from './riskPresentation';

interface RiskCardProps {
  risk: Risk;
  stageName?: string;
  onView: () => void;
  onEdit: () => void;
}

export function RiskCard({ risk, stageName, onView, onEdit }: RiskCardProps) {
  const CategoryIcon = CATEGORY_CONFIG.find((c) => c.id === risk.category)?.icon;
  const isOpportunity = risk.type === 'opportunity';
  const doneActions = risk.actions.filter((a) => a.status === 'done').length;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
        isOpportunity ? 'border-emerald-200/90' : 'border-stone-200/90'
      }`}
    >
      <div
        className={`h-1 w-full ${
          isOpportunity
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
            : risk.criticality === 'critical'
              ? 'bg-gradient-to-r from-red-500 to-rose-600'
              : risk.criticality === 'high'
                ? 'bg-gradient-to-r from-orange-400 to-amber-500'
                : 'bg-gradient-to-r from-stone-300 to-stone-400'
        }`}
      />

      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isOpportunity ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}
            >
              {isOpportunity ? <TrendingUp className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-stone-900 text-lg leading-snug line-clamp-2">{risk.title}</h3>
              <p className="text-sm text-stone-500 mt-1 line-clamp-2">{risk.description}</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${criticalityTone(risk.criticality)}`}>
            {criticalityLabel(risk.criticality)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${categoryChipClass(risk.category)}`}>
            {CategoryIcon ? <CategoryIcon className="w-3 h-3" /> : null}
            {categoryLabel(risk.category)}
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(risk.status)}`}>
            {statusLabel(risk.status)}
          </span>
          {risk.autoDetected ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
              <Bot className="w-3 h-3" /> Auto
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Metric label="Probabilité" value={`${risk.probability}/5`} percent={(risk.probability / 5) * 100} tone="red" />
          <Metric label="Impact max" value={`${maxImpact(risk.impacts)}/5`} percent={(maxImpact(risk.impacts) / 5) * 100} tone="orange" />
          <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-3">
            <p className="text-[11px] uppercase tracking-wide text-stone-500 font-medium">Stratégie</p>
            <p className="text-sm font-semibold text-stone-800 mt-1">{strategyLabel(risk.strategy)}</p>
          </div>
        </div>

        {risk.actions.length > 0 ? (
          <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-3">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-semibold text-stone-700">Actions ({risk.actions.length})</span>
              <span>
                {doneActions}/{risk.actions.length} terminées
              </span>
            </div>
            <div className="space-y-1.5">
              {risk.actions.slice(0, 2).map((action) => (
                <div key={action.id} className="flex items-center gap-2 text-sm text-stone-700">
                  {action.status === 'done' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : action.status === 'in-progress' ? (
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-stone-300 shrink-0" />
                  )}
                  <span className="truncate flex-1">{action.title}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {risk.ownerName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(risk.detectedAt).toLocaleDateString('fr-FR')}
          </span>
          {stageName ? <span className="text-stone-400">· {stageName}</span> : null}
        </div>

        <div className="flex gap-2 pt-1 border-t border-stone-100">
          <ActionButton variant="secondary" icon={Eye} onClick={onView} className="flex-1 justify-center">
            Consulter
          </ActionButton>
          <ActionButton variant="secondary" icon={Pencil} onClick={onEdit} className="flex-1 justify-center">
            Modifier
          </ActionButton>
        </div>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: string;
  percent: number;
  tone: 'red' | 'orange';
}) {
  const bar = tone === 'red' ? 'bg-red-500' : 'bg-orange-500';
  return (
    <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-3">
      <p className="text-[11px] uppercase tracking-wide text-stone-500 font-medium">{label}</p>
      <div className="flex items-center gap-2 mt-1.5">
        <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${percent}%` }} />
        </div>
        <span className="text-sm font-bold text-stone-800">{value}</span>
      </div>
    </div>
  );
}
