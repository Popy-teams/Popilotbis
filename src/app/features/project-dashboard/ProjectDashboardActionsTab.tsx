import { Calendar, FileText, Target } from 'lucide-react';
import type { QuickActionKind } from '../../types/projectDashboard';

interface ProjectDashboardActionsTabProps {
  onQuickAction: (kind: QuickActionKind) => void;
}

export function ProjectDashboardActionsTab({ onQuickAction }: ProjectDashboardActionsTabProps) {
  return (
    <div className="space-y-4 min-w-0">
      <div>
        <h3 className="font-semibold text-slate-900">Actions rapides</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Lancez un projet, un rapport ou une réunion en quelques clics.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionTile
          icon={Target}
          title="Créer un nouveau projet"
          description="Démarrer un projet avec objectifs, planning et équipe."
          tone="indigo"
          onClick={() => onQuickAction('project')}
        />
        <ActionTile
          icon={FileText}
          title="Rapport hebdomadaire"
          description="Générer le rapport de synthèse de la semaine."
          tone="violet"
          onClick={() => onQuickAction('report')}
        />
        <ActionTile
          icon={Calendar}
          title="Planifier une réunion"
          description="Organiser un point projet ou une décision."
          tone="sky"
          onClick={() => onQuickAction('meeting')}
        />
      </div>
    </div>
  );
}

function ActionTile({
  icon: Icon,
  title,
  description,
  tone,
  onClick,
}: {
  icon: typeof Target;
  title: string;
  description: string;
  tone: 'indigo' | 'violet' | 'sky';
  onClick: () => void;
}) {
  const accents = {
    indigo: { bar: 'from-indigo-500 to-violet-600', icon: 'from-indigo-500 to-violet-600' },
    violet: { bar: 'from-violet-500 to-purple-600', icon: 'from-violet-500 to-purple-600' },
    sky: { bar: 'from-sky-500 to-blue-600', icon: 'from-sky-500 to-blue-600' },
  };
  const a = accents[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all min-w-0 w-full"
    >
      <div className={`h-1 bg-gradient-to-r ${a.bar}`} />
      <div className="p-5 sm:p-6">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.icon} text-white flex items-center justify-center mb-4`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}
