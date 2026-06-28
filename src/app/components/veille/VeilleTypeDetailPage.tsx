import { Plus } from 'lucide-react';
import type { VeilleEntry, VeilleType } from '../../types/veille';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import { VeilleCard } from './VeilleCard';
import { VEILLE_TYPES, frequencyLabel } from './veillePresentation';

interface VeilleTypeDetailPageProps {
  type: VeilleType;
  entries: VeilleEntry[];
  onBack: () => void;
  onCreate: () => void;
  onView: (entry: VeilleEntry) => void;
  onEdit: (entry: VeilleEntry) => void;
}

export function VeilleTypeDetailPage({
  type,
  entries,
  onBack,
  onCreate,
  onView,
  onEdit,
}: VeilleTypeDetailPageProps) {
  const config = VEILLE_TYPES.find((t) => t.id === type)!;
  const TypeIcon = config.icon;
  const typeEntries = entries.filter((e) => e.type === type);

  return (
    <ViewShell>
      <PageBackHeader
        title={config.label}
        subtitle={`${config.isoRef} · Fréquence ${frequencyLabel(config.frequency)}`}
        onBack={onBack}
        actions={
          <ActionButton icon={Plus} onClick={onCreate}>
            Nouvelle veille
          </ActionButton>
        }
      />

      <section className={`rounded-2xl border-2 p-5 sm:p-6 mb-5 ${config.activeBorder}`}>
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconWrapClass}`}>
            <TypeIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-stone-700">{config.description}</p>
            <p className="text-sm font-semibold text-stone-900 mt-2">{typeEntries.length} entrée(s) dans ce registre</p>
          </div>
        </div>
      </section>

      {typeEntries.length === 0 ? (
        <p className="text-sm text-stone-500 text-center py-12 rounded-2xl border border-dashed border-stone-200">
          Aucune veille enregistrée pour ce type. Créez la première entrée.
        </p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {typeEntries.map((entry) => (
            <VeilleCard key={entry.id} entry={entry} onView={() => onView(entry)} onEdit={() => onEdit(entry)} />
          ))}
        </div>
      )}
    </ViewShell>
  );
}
