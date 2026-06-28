import { Fragment } from 'react';
import { Eye, Pencil, Plus, Target } from 'lucide-react';
import type { Risk } from '../../types/risks';
import { ActionButton, ViewSectionTitle } from '../shared';
import { maxImpact } from './riskPresentation';

interface RisksMatrixTabProps {
  risks: Risk[];
  onView: (risk: Risk) => void;
  onEdit: (risk: Risk) => void;
  onCreate: () => void;
}

export function RisksMatrixTab({ risks, onView, onEdit, onCreate }: RisksMatrixTabProps) {
  const riskItems = risks.filter((r) => r.type === 'risk');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <ViewSectionTitle icon={Target} title="Matrice probabilité × impact" />
        <ActionButton icon={Plus} onClick={onCreate}>
          Nouveau risque
        </ActionButton>
      </div>

      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[640px] grid grid-cols-6 gap-1.5">
          <div />
          {[1, 2, 3, 4, 5].map((impact) => (
            <div key={`h-${impact}`} className="text-center text-xs font-semibold text-stone-600 py-2">
              Impact {impact}
            </div>
          ))}

          {[5, 4, 3, 2, 1].map((prob) => (
            <Fragment key={`row-${prob}`}>
              <div className="text-xs font-semibold text-stone-600 flex items-center pr-2">Prob. {prob}</div>
              {[1, 2, 3, 4, 5].map((impact) => {
                const score = prob * impact;
                const bg =
                  score > 15
                    ? 'bg-red-100 hover:bg-red-150 border-red-200'
                    : score > 10
                      ? 'bg-orange-100 hover:bg-orange-50 border-orange-200'
                      : score > 5
                        ? 'bg-amber-50 hover:bg-amber-100 border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200';

                const cellRisks = riskItems.filter((r) => r.probability === prob && maxImpact(r.impacts) === impact);

                return (
                  <div
                    key={`${prob}-${impact}`}
                    className={`${bg} border rounded-xl p-2 min-h-[88px] transition-colors`}
                  >
                    <div className="text-[10px] font-bold text-stone-600 mb-1.5">Score {score}</div>
                    <div className="space-y-1">
                      {cellRisks.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => onView(r)}
                          className="w-full text-left text-[11px] leading-tight text-stone-800 hover:text-red-700 truncate rounded px-1 py-0.5 hover:bg-white/60"
                          title={r.title}
                        >
                          {r.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Legend tone="red" title="Critique (16-25)" hint="Action immédiate" />
        <Legend tone="orange" title="Élevé (11-15)" hint="Plan prioritaire" />
        <Legend tone="amber" title="Modéré (6-10)" hint="Surveillance active" />
        <Legend tone="emerald" title="Faible (1-5)" hint="Surveillance standard" />
      </div>

      {riskItems.length > 0 ? (
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-800 mb-3">Risques positionnés ({riskItems.length})</p>
          <div className="divide-y divide-stone-100">
            {riskItems.map((risk) => (
              <div key={risk.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900 truncate">{risk.title}</p>
                  <p className="text-xs text-stone-500">
                    P{risk.probability} × I{maxImpact(risk.impacts)} = {risk.criticalityScore}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <ActionButton variant="secondary" icon={Eye} onClick={() => onView(risk)}>
                    Consulter
                  </ActionButton>
                  <ActionButton variant="secondary" icon={Pencil} onClick={() => onEdit(risk)}>
                    Modifier
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Legend({ tone, title, hint }: { tone: 'red' | 'orange' | 'amber' | 'emerald'; title: string; hint: string }) {
  const bg = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    amber: 'bg-amber-50 border-amber-200',
    emerald: 'bg-emerald-50 border-emerald-200',
  }[tone];
  return (
    <div className={`rounded-xl border p-3 ${bg}`}>
      <p className="text-sm font-bold text-stone-900">{title}</p>
      <p className="text-xs text-stone-600 mt-0.5">{hint}</p>
    </div>
  );
}
