import { ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { PdcaItem, PdcaPhase } from '../../types/pdca';
import { getRoutePath } from '../../routes/viewRoutes';
import { PDCA_PHASE_META, uniqueModulesByPhase } from '../../utils/pdcaCatalog';

interface PdcaPhasePanelProps {
  phase: PdcaPhase;
  items: PdcaItem[];
}

function statusLabel(status: PdcaItem['status']) {
  const map: Record<string, string> = {
    todo: 'À faire',
    open: 'Ouvert',
    'in-progress': 'En cours',
    blocked: 'Bloqué',
    done: 'Terminé',
    closed: 'Fermé',
    accepted: 'Accepté',
    monitoring: 'Suivi',
  };
  return map[status] ?? status;
}

function statusClass(status: PdcaItem['status']) {
  if (status === 'done' || status === 'closed' || status === 'accepted') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (status === 'in-progress' || status === 'blocked') return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-stone-100 text-stone-700 border-stone-200';
}

export function PdcaPhasePanel({ phase, items }: PdcaPhasePanelProps) {
  const meta = PDCA_PHASE_META[phase];
  const modules = uniqueModulesByPhase(phase);
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-5 sm:p-6 bg-gradient-to-br ${meta.gradient} text-white shadow-sm`}>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black backdrop-blur-sm">
            {meta.letter}
          </div>
          <div>
            <h2 className="text-xl font-bold">{meta.label}</h2>
            <p className="text-sm text-white/85 mt-1">{meta.subtitle}</p>
            <p className="text-xs text-white/70 mt-2">{meta.isoRef} · {items.length} élément(s) identifié(s)</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="font-semibold text-stone-900 mb-3">Modules POPILOT rattachés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => navigate(`/${getRoutePath(mod.id)}`)}
              className="text-left rounded-xl border border-stone-100 bg-stone-50/60 p-3 hover:bg-stone-100/80 hover:border-stone-200 transition group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-stone-900 text-sm">{mod.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600" />
              </div>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">{mod.description}</p>
              <span className="text-[10px] font-semibold text-stone-400 mt-1 inline-block">{mod.isoRef}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200/90 bg-white shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-stone-100 bg-stone-50/80">
          <h3 className="font-semibold text-stone-900">Éléments classés en {meta.label}</h3>
        </div>
        {items.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">Aucun élément identifié pour cette phase sur le projet actif.</p>
        ) : (
          <ul className="divide-y divide-stone-100 max-h-[420px] overflow-y-auto">
            {items.slice(0, 50).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => item.routePath && navigate(`/${item.routePath}`)}
                  className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-stone-50/80 text-left transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900 text-sm truncate">{item.title}</p>
                    <p className="text-xs text-stone-500 truncate">
                      {item.sourceLabel}
                      {item.description ? ` · ${item.description}` : ''}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(item.status)}`}>
                    {statusLabel(item.status)}
                  </span>
                  {item.routePath ? <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" /> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
        {items.length > 50 ? (
          <p className="px-5 py-2 text-xs text-stone-500 border-t border-stone-100">+ {items.length - 50} autres éléments</p>
        ) : null}
      </section>
    </div>
  );
}
