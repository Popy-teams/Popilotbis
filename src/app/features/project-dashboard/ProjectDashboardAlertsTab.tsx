import { AlertTriangle, Plus, SquarePen, Trash2 } from 'lucide-react';
import type { ProjectDashboardAlert } from '../../types/projectDashboard';
import { ActionButton } from '../../components/shared';
import { severityBadgeClass, severityLabel } from './projectDashboardPresentation';

interface ProjectDashboardAlertsTabProps {
  alerts: ProjectDashboardAlert[];
  onCreate: () => void;
  onEdit: (alert: ProjectDashboardAlert) => void;
  onDelete: (id: string) => void;
}

export function ProjectDashboardAlertsTab({
  alerts,
  onCreate,
  onEdit,
  onDelete,
}: ProjectDashboardAlertsTabProps) {
  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Alertes projet</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {alerts.length} alerte{alerts.length > 1 ? 's' : ''} pour le projet actif
          </p>
        </div>
        <ActionButton icon={Plus} onClick={onCreate} className="!rounded-xl w-full sm:w-auto justify-center">
          Nouvelle alerte
        </ActionButton>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-600">Aucune alerte pour ce projet.</p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-3 text-sm font-medium text-indigo-700 hover:text-indigo-900"
          >
            Créer une alerte
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm min-w-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800 break-words leading-relaxed">{alert.message}</p>
                    <span
                      className={`inline-flex mt-2 saas-badge border text-[11px] ${severityBadgeClass(alert.severity)}`}
                    >
                      {severityLabel(alert.severity)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => onEdit(alert)}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <SquarePen className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(alert.id)}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-red-200 bg-white text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
