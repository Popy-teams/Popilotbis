import type { LucideIcon } from 'lucide-react';
import { Calendar, FileText, Target } from 'lucide-react';
import type { QuickActionKind } from '../../types/projectDashboard';
import { ViewShell, PageBackHeader, ActionButton, AppIcon } from '../../components/shared';

const CONFIG: Record<
  QuickActionKind,
  { title: string; description: string; icon: LucideIcon; placeholder: string }
> = {
  project: {
    title: 'Créer un nouveau projet',
    description: 'Démarrer un projet avec objectifs, planning et équipe.',
    icon: Target,
    placeholder: 'Titre du projet',
  },
  report: {
    title: 'Rapport hebdomadaire',
    description: 'Générer le rapport de synthèse de la semaine.',
    icon: FileText,
    placeholder: 'Titre du rapport',
  },
  meeting: {
    title: 'Planifier une réunion',
    description: 'Organiser un point projet ou une décision.',
    icon: Calendar,
    placeholder: 'Objet de la réunion',
  },
};

interface QuickActionFormPageProps {
  kind: QuickActionKind;
  onBack: () => void;
}

export function QuickActionFormPage({ kind, onBack }: QuickActionFormPageProps) {
  const config = CONFIG[kind];
  const Icon = config.icon;

  return (
    <ViewShell narrow>
      <PageBackHeader title={config.title} subtitle={config.description} onBack={onBack} />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-indigo-600">
          <AppIcon icon={Icon} size="xl" />
          <p className="text-sm text-slate-600">{config.description}</p>
        </div>
        <input
          placeholder={config.placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm"
        />
        <textarea
          placeholder="Description (optionnel)"
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm"
        />
        <ActionButton type="button" variant="primary" onClick={onBack} className="!rounded-xl !py-3 w-full">
          Enregistrer (démo)
        </ActionButton>
      </div>
    </ViewShell>
  );
}
