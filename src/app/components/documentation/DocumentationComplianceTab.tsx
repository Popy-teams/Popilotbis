import { AlertTriangle, Check, CheckCircle, Shield, X, XCircle } from 'lucide-react';
import { ISO_REQUIREMENTS } from '../../types/documents';
import { ViewHighlightBanner, ViewStatsGrid } from '../shared';
import { DocStatCard } from './DocStatCard';

interface DocumentationComplianceTabProps {
  complianceRate: number;
  onGoLibrary: () => void;
}

export function DocumentationComplianceTab({ complianceRate, onGoLibrary }: DocumentationComplianceTabProps) {
  const complianceStats = {
    compliant: ISO_REQUIREMENTS.filter((r) => r.status === 'compliant').length,
    incomplete: ISO_REQUIREMENTS.filter((r) => r.status === 'incomplete').length,
    missing: ISO_REQUIREMENTS.filter((r) => r.status === 'missing').length,
  };

  return (
    <div className="space-y-5 min-w-0">
      <ViewHighlightBanner
        title="Conformité ISO 9001"
        subtitle={`${complianceStats.compliant} exigences conformes sur ${ISO_REQUIREMENTS.length}`}
        value={`${complianceRate}%`}
        progress={complianceRate}
        theme="blue"
      />

      <ViewStatsGrid cols={3}>
        <DocStatCard label="Conforme" value={String(complianceStats.compliant)} tone="good" icon={CheckCircle} />
        <DocStatCard label="Incomplet" value={String(complianceStats.incomplete)} tone="warning" icon={AlertTriangle} />
        <DocStatCard label="Manquant" value={String(complianceStats.missing)} tone="critical" icon={XCircle} />
      </ViewStatsGrid>

      <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
          <p className="text-sm text-stone-800">
            Associez les documents de la bibliothèque aux preuves ISO. Les documents critiques bloquent
            les jalons pipeline tant qu&apos;ils ne sont pas validés.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoLibrary}
          className="shrink-0 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
        >
          Voir la bibliothèque
        </button>
      </div>

      <div className="space-y-3">
        {ISO_REQUIREMENTS.map((req, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-4 sm:p-5 transition-shadow hover:shadow-sm ${
              req.status === 'compliant'
                ? 'border-emerald-200 bg-emerald-50/50'
                : req.status === 'incomplete'
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-red-200 bg-red-50/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="shrink-0">{getComplianceIcon(req.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-stone-900 flex flex-wrap items-center gap-2 text-sm sm:text-base">
                      {req.category}
                      {req.isCritical ? (
                        <span className="px-2 py-0.5 bg-red-200 text-red-900 rounded text-[10px] font-bold">
                          CRITIQUE
                        </span>
                      ) : null}
                    </h4>
                    <p className="text-sm text-stone-700 mt-1 leading-relaxed">{req.requirement}</p>
                  </div>
                  <StatusPill status={req.status} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getComplianceIcon(status: string) {
  if (status === 'compliant') return <CheckCircle className="w-5 h-5 text-emerald-700" />;
  if (status === 'incomplete') return <AlertTriangle className="w-5 h-5 text-amber-700" />;
  return <XCircle className="w-5 h-5 text-red-700" />;
}

function StatusPill({ status }: { status: string }) {
  const map = {
    compliant: 'bg-emerald-200 text-emerald-950',
    incomplete: 'bg-amber-200 text-amber-950',
    missing: 'bg-red-200 text-red-950',
  };
  const label = status === 'compliant' ? 'Conforme' : status === 'incomplete' ? 'Incomplet' : 'Manquant';
  return (
    <span className={`self-start shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${map[status as keyof typeof map]}`}>
      {label}
    </span>
  );
}

export { Check, X };
