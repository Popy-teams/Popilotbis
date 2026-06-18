import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Project } from '../../../types';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from '../../../components/shared';

interface MemberOption {
  id: string;
  name: string;
  initials: string;
}

interface ProjectFormValues {
  name: string;
  description: string;
  status: Project['status'];
  priority: Project['priority'];
  startDate: string;
  deadline: string;
  budgetTotal: string;
  selectedMembers: string[];
  isRestricted: boolean;
}

interface ProjectFormPageProps {
  title: string;
  values: ProjectFormValues;
  members: MemberOption[];
  submitLabel: string;
  onBack: () => void;
  onChange: (values: ProjectFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProjectFormPage({
  title,
  values,
  members,
  submitLabel,
  onBack,
  onChange,
  onSubmit,
}: ProjectFormPageProps) {
  const toggleMember = (memberId: string) => {
    const selectedMembers = values.selectedMembers.includes(memberId)
      ? values.selectedMembers.filter((id) => id !== memberId)
      : [...values.selectedMembers, memberId];
    onChange({ ...values, selectedMembers });
  };

  return (
    <ViewShell>
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-600 mt-1">Page CRUD Portfolio Projet</p>
        </div>
        <button onClick={onBack} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 shrink-0" aria-label="Retour">
          <AppIcon icon={ArrowLeft} size="sm" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-5 shadow-sm">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
          <p className="text-sm text-blue-800">
            Renseigne les informations clefs du projet. Tu pourras ensuite modifier ces donnees a tout moment.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du projet *</label>
            <input type="text" required value={values.name} onChange={(e) => onChange({ ...values, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea required rows={3} value={values.description} onChange={(e) => onChange({ ...values, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Statut *</label>
            <select value={values.status} onChange={(e) => onChange({ ...values, status: e.target.value as Project['status'] })} className="w-full px-3 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="on-track">Dans les temps</option>
              <option value="at-risk">A risque</option>
              <option value="delayed">En retard</option>
              <option value="archived">Archive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priorite *</label>
            <select value={values.priority} onChange={(e) => onChange({ ...values, priority: e.target.value as Project['priority'] })} className="w-full px-3 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de debut</label>
            <input type="date" value={values.startDate} onChange={(e) => onChange({ ...values, startDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date d'echeance *</label>
            <input type="date" required value={values.deadline} onChange={(e) => onChange({ ...values, deadline: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Budget total (EUR) *</label>
            <input type="number" required min="0" value={values.budgetTotal} onChange={(e) => onChange({ ...values, budgetTotal: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>

        <div className="rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-violet-900 flex items-center gap-2">
                <AppIcon icon={values.isRestricted ? EyeOff : Eye} size="sm" />
                Visibilité du projet
              </p>
              <p className="text-xs text-violet-700 mt-1">
                {values.isRestricted
                  ? 'Seuls les participants sélectionnés (et les administrateurs) peuvent voir ce projet.'
                  : 'Tous les utilisateurs connectés peuvent voir ce projet.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...values, isRestricted: !values.isRestricted })}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                values.isRestricted ? 'bg-violet-600' : 'bg-slate-300'
              }`}
              aria-label="Restreindre la visibilité"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  values.isRestricted ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Participants {values.isRestricted ? '(visibilité + équipe)' : "(équipe)"}
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Sélectionnez les membres concernés par ce projet.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleMember(member.id)}
                className={`px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                  values.selectedMembers.includes(member.id) ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                {member.name} ({member.initials})
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button type="button" onClick={onBack} className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50">
            Annuler
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm">
            {submitLabel}
          </button>
        </div>
      </form>
    </ViewShell>
  );
}
