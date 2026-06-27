import { Lightbulb, ArrowRight } from 'lucide-react';
import type { PlanningInsight } from '../../utils/planningInsights';

const TONE: Record<
  PlanningInsight['tone'],
  { border: string; bg: string; dot: string; cta: string }
> = {
  info: { border: 'border-blue-200', bg: 'bg-blue-50', dot: 'bg-blue-500', cta: 'text-blue-700 hover:bg-blue-100' },
  warning: { border: 'border-amber-200', bg: 'bg-amber-50', dot: 'bg-amber-500', cta: 'text-amber-800 hover:bg-amber-100' },
  success: { border: 'border-emerald-200', bg: 'bg-emerald-50', dot: 'bg-emerald-500', cta: 'text-emerald-700 hover:bg-emerald-100' },
  action: { border: 'border-violet-200', bg: 'bg-violet-50', dot: 'bg-violet-500', cta: 'text-violet-700 hover:bg-violet-100' },
};

export function PlanningIntelligencePanel({
  insights,
  onAction,
}: {
  insights: PlanningInsight[];
  onAction?: (insight: PlanningInsight) => void;
}) {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 text-center">
        Aucune alerte planning pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight) => {
        const t = TONE[insight.tone];
        return (
          <div
            key={insight.id}
            className={`rounded-xl border ${t.border} ${t.bg} p-4 transition-shadow hover:shadow-sm`}
          >
            <div className="flex gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${t.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 text-sm">{insight.title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insight.detail}</p>
                {insight.cta && onAction ? (
                  <button
                    type="button"
                    onClick={() => onAction(insight)}
                    className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${t.cta}`}
                  >
                    {insight.cta}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PlanningAssistantHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
        <Lightbulb className="w-4 h-4" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">Assistant planning</h3>
        <p className="text-xs text-gray-500">Suggestions basées sur votre calendrier et vos CR</p>
      </div>
    </div>
  );
}
