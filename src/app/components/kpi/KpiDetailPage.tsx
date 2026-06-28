import { Pencil, Trash2 } from 'lucide-react';
import type { KpiMetric } from '../../types/kpi';
import { getCategoryName, progressPercent } from '../../data/kpiHelpers';
import { PageBackHeader } from '../shared/PageBackHeader';
import { ViewShell } from '../shared';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { formatKpiValue, statusBadgeClass, statusLabel } from './kpiPresentation';

interface KpiDetailPageProps {
  kpi: KpiMetric;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function KpiDetailPage({ kpi, onBack, onEdit, onDelete }: KpiDetailPageProps) {
  const status = statusBadgeClass(kpi.status);

  return (
    <ViewShell narrow>
      <PageBackHeader
        title={kpi.name}
        subtitle={getCategoryName(kpi.categoryId)}
        onBack={onBack}
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-stone-300 bg-white text-stone-900 rounded-lg hover:bg-stone-50"
            >
              <Pencil className="w-4 h-4" /> Modifier
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-300 bg-red-50 text-red-900 rounded-lg hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        }
      />

      <Card className="border-stone-200 bg-white">
        <CardContent className="p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${status.badge}`}>
              {statusLabel(kpi.status)}
            </span>
            <span className="text-sm text-stone-700">
              Seuil : <strong className="text-stone-900">{kpi.targetThreshold}</strong>
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-1 font-medium">Objectif</p>
            <p className="text-stone-900 text-sm sm:text-base leading-relaxed">{kpi.objective}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-1 font-medium">
              Méthode de mesure
            </p>
            <p className="text-stone-900 text-sm sm:text-base leading-relaxed">{kpi.measurementMethod}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs text-stone-600 mb-1 font-medium">Valeur actuelle</p>
              <p className="text-2xl sm:text-3xl font-bold text-stone-900">
                {formatKpiValue(kpi.currentValue, kpi.unit)}
              </p>
              <p className="text-xs text-stone-600 mt-1">
                Précédent : {formatKpiValue(kpi.previousValue, kpi.unit)}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-900/80 mb-1 font-medium">Responsable</p>
              <p className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">
                {kpi.responsible}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-700">Progression vers la cible</span>
              <span className="font-bold text-stone-900">{progressPercent(kpi)}%</span>
            </div>
            <Progress value={progressPercent(kpi)} className="h-2.5 bg-stone-200" />
          </div>
        </CardContent>
      </Card>
    </ViewShell>
  );
}
