import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Link2,
  Pencil,
  Trash2,
  User,
} from 'lucide-react';
import type { VeilleEntry } from '../../types/veille';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import {
  decisionLabel,
  decisionTone,
  frequencyLabel,
  priorityLabel,
  priorityTone,
  statusLabel,
  statusTone,
  typeConfig,
  typeLabel,
} from './veillePresentation';

interface VeilleDetailPageProps {
  entry: VeilleEntry;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function VeilleDetailPage({ entry, onBack, onEdit, onDelete }: VeilleDetailPageProps) {
  const config = typeConfig(entry.type);
  const TypeIcon = config.icon;

  return (
    <ViewShell>
      <PageBackHeader
        title={entry.subject}
        subtitle={`${typeLabel(entry.type)} · ${entry.source}`}
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
        <section className="rounded-2xl border border-cyan-200/80 bg-gradient-to-br from-cyan-50/70 to-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-start gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconWrapClass}`}>
              <TypeIcon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${config.chipClass}`}>
                  {typeLabel(entry.type)} · {config.isoRef}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone(entry.status)}`}>
                  {statusLabel(entry.status)}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${priorityTone(entry.priority)}`}>
                  {priorityLabel(entry.priority)}
                </span>
              </div>
              <p className="text-stone-700 leading-relaxed">{entry.description}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <section className="xl:col-span-2 rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-stone-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Analyse d&apos;impact
            </h3>
            {entry.impactAnalysis ? (
              <p className="text-sm text-stone-700 leading-relaxed rounded-xl bg-amber-50/60 border border-amber-200/70 p-4">
                {entry.impactAnalysis}
              </p>
            ) : (
              <p className="text-sm text-stone-500">Aucune analyse renseignée.</p>
            )}

            <h3 className="font-semibold text-stone-900 flex items-center gap-2 pt-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Décision
            </h3>
            <div className={`rounded-xl border p-4 ${decisionTone(entry.decision)}`}>
              <p className="font-medium">{decisionLabel(entry.decision)}</p>
              {entry.decisionNotes ? <p className="text-sm mt-2 opacity-90">{entry.decisionNotes}</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-stone-900">Suivi</h3>
            <Meta icon={User} label="Responsable" value={entry.responsible} />
            <Meta icon={Calendar} label="Date du signal" value={new Date(entry.date).toLocaleDateString('fr-FR')} />
            <Meta icon={Calendar} label="Fréquence type" value={frequencyLabel(config.frequency)} />
            {entry.nextReviewDate ? (
              <Meta icon={Bell} label="Prochaine revue" value={new Date(entry.nextReviewDate).toLocaleDateString('fr-FR')} />
            ) : null}
          </section>
        </div>

        {(entry.linkedRisks?.length || entry.linkedTasks?.length || entry.linkedDocs?.length) ? (
          <section className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Liens transversaux
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.linkedRisks?.map((id) => (
                <LinkChip key={id} label={`Risque ${id}`} tone="red" />
              ))}
              {entry.linkedTasks?.map((id) => (
                <LinkChip key={id} label={`Tâche ${id}`} tone="blue" />
              ))}
              {entry.linkedDocs?.map((id) => (
                <LinkChip key={id} label={`Doc ${id}`} tone="violet" />
              ))}
            </div>
          </section>
        ) : null}

        {entry.status === 'action-required' ? (
          <section className="rounded-2xl border border-cyan-200/80 bg-cyan-50/40 p-5 sm:p-6">
            <h3 className="font-semibold text-cyan-900 flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4" /> Actions suggérées
            </h3>
            <ul className="text-sm text-cyan-900 space-y-2">
              <li>· Créer une tâche de mise en conformité</li>
              <li>· Lier à un risque existant ou en créer un nouveau</li>
              <li>· Mettre à jour la documentation technique</li>
            </ul>
          </section>
        ) : null}
      </div>
    </ViewShell>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
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

function LinkChip({ label, tone }: { label: string; tone: 'red' | 'blue' | 'violet' }) {
  const tones = {
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
    violet: 'bg-violet-50 text-violet-700',
  };
  return <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{label}</span>;
}
