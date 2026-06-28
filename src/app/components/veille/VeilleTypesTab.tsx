import { Clock, Eye, Plus } from 'lucide-react';
import type { VeilleEntry, VeilleType } from '../../types/veille';
import { ActionButton, ViewSectionTitle } from '../shared';
import { VEILLE_TYPES, frequencyLabel } from './veillePresentation';

interface VeilleTypesTabProps {
  entries: VeilleEntry[];
  onSelectType: (type: VeilleType) => void;
  onCreateForType: (type: VeilleType) => void;
}

export function VeilleTypesTab({ entries, onSelectType, onCreateForType }: VeilleTypesTabProps) {
  return (
    <div className="space-y-5">
      <ViewSectionTitle icon={Eye} title="7 types de veille ISO 9001" count={VEILLE_TYPES.length} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {VEILLE_TYPES.map((type) => {
          const Icon = type.icon;
          const count = entries.filter((e) => e.type === type.id).length;
          const actionRequired = entries.filter((e) => e.type === type.id && e.status === 'action-required').length;

          return (
            <article
              key={type.id}
              className={`rounded-2xl border-2 p-5 transition hover:shadow-md ${type.activeBorder}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${type.iconWrapClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-stone-900">{count}</span>
              </div>
              <h3 className="font-semibold text-stone-900">{type.label}</h3>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2">{type.description}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {frequencyLabel(type.frequency)}
                </span>
                <span className="font-semibold text-cyan-700">{type.isoRef}</span>
              </div>
              {actionRequired > 0 ? (
                <p className="text-xs font-semibold text-red-700 mt-2">{actionRequired} action(s) requise(s)</p>
              ) : null}
              <div className="flex gap-2 mt-4 pt-3 border-t border-stone-200/60">
                <ActionButton variant="secondary" icon={Eye} onClick={() => onSelectType(type.id)} className="flex-1 justify-center text-xs">
                  Consulter
                </ActionButton>
                <ActionButton icon={Plus} onClick={() => onCreateForType(type.id)} className="flex-1 justify-center text-xs">
                  Nouveau
                </ActionButton>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
