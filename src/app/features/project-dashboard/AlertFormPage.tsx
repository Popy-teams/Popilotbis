import { AlertTriangle, FileText } from 'lucide-react';
import type { AlertFormValues } from '../../types/projectDashboard';
import { ViewShell, PageBackHeader, ActionButton, AppIcon, FormSelect } from '../../components/shared';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

interface AlertFormPageProps {
  mode: 'create' | 'edit';
  values: AlertFormValues;
  onChange: (values: AlertFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function AlertFormPage({ mode, values, onChange, onSubmit, onBack }: AlertFormPageProps) {
  const patch = (partial: Partial<AlertFormValues>) => onChange({ ...values, ...partial });

  return (
    <ViewShell narrow>
      <PageBackHeader
        title={mode === 'create' ? 'Nouvelle alerte' : "Modifier l'alerte"}
        subtitle="Signalez un risque ou un point de vigilance sur le projet actif"
        onBack={onBack}
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AppIcon icon={AlertTriangle} size="sm" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Détail de l&apos;alerte</h2>
              <p className="text-xs text-slate-500">Visible dans le tableau de bord projet</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="alert-message">
              Message *
            </label>
            <textarea
              id="alert-message"
              required
              rows={4}
              value={values.message}
              onChange={(e) => patch({ message: e.target.value })}
              className={inputClass}
              placeholder="Décrivez le risque ou le point d'attention…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="alert-severity">
              Niveau *
            </label>
            <FormSelect
              id="alert-severity"
              value={values.severity}
              onChange={(e) => patch({ severity: e.target.value as AlertFormValues['severity'] })}
            >
              <option value="critical">Critique</option>
              <option value="warning">Avertissement</option>
            </FormSelect>
          </div>
        </section>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <ActionButton type="button" variant="secondary" onClick={onBack} className="!rounded-xl !py-3">
            Annuler
          </ActionButton>
          <ActionButton type="submit" variant="primary" icon={FileText} className="!rounded-xl !py-3">
            {mode === 'create' ? 'Créer l\'alerte' : 'Enregistrer'}
          </ActionButton>
        </div>
      </form>
    </ViewShell>
  );
}
