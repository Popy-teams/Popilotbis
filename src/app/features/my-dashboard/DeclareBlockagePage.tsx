import { useState } from 'react';
import { CheckCircle, Send, AlertTriangle } from 'lucide-react';
import type { BlockageFormValues, DashboardTask } from '../../types/dashboard';
import { PageBackHeader, ViewShell, AppIcon, IconLabel } from '../../components/shared';
import { BLOCKAGE_IMPACTS } from './dashboardPresentation';
import { personalInputClass, personalLabelClass } from '../personal/personalFormStyles';
import { FormSelect } from '../../components/shared';

const EMPTY_FORM: BlockageFormValues = {
  taskId: '',
  description: '',
  impact: 'medium',
  proposedSolution: '',
};

interface DeclareBlockagePageProps {
  tasks: DashboardTask[];
  onBack: () => void;
  onSubmit: (values: BlockageFormValues) => void;
}

export function DeclareBlockagePage({ tasks, onBack, onSubmit }: DeclareBlockagePageProps) {
  const [form, setForm] = useState<BlockageFormValues>(EMPTY_FORM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm(EMPTY_FORM);
  };

  return (
    <ViewShell narrow>
      <PageBackHeader
        title="Déclarer un blocage"
        subtitle={
          <IconLabel icon={AlertTriangle} className="text-red-700" iconSize="sm">
            Signalez un obstacle pour obtenir de l&apos;aide rapidement
          </IconLabel>
        }
        onBack={onBack}
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-5 shadow-sm"
      >
        <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-sky-900">
          <strong>Pas d&apos;inquiétude !</strong> Signaler un blocage est une bonne pratique. L&apos;équipe
          peut réagir rapidement pour vous débloquer.
        </div>

        <div>
          <label className={personalLabelClass}>Quelle tâche est bloquée ? *</label>
          <FormSelect
            required
            value={form.taskId}
            onChange={(e) => setForm({ ...form, taskId: e.target.value })}
          >
            <option value="">Sélectionnez une tâche</option>
            {tasks.map((task) => (
              <option key={task.id} value={String(task.id)}>
                {task.title}
              </option>
            ))}
          </FormSelect>
        </div>

        <div>
          <label className={personalLabelClass}>Décrivez le blocage *</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Qu'est-ce qui vous bloque ? Depuis quand ? Qu'avez-vous tenté ?"
            rows={4}
            className={personalInputClass}
          />
        </div>

        <div>
          <label className={personalLabelClass}>Impact estimé *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {BLOCKAGE_IMPACTS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setForm({ ...form, impact: option.value })}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                  form.impact === option.value
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Faible : quelques heures · Moyen : 1-2 jours · Élevé : une semaine · Critique : sprint bloqué
          </p>
        </div>

        <div>
          <label className={personalLabelClass}>Solution proposée (optionnel)</label>
          <textarea
            value={form.proposedSolution}
            onChange={(e) => setForm({ ...form, proposedSolution: e.target.value })}
            rows={3}
            className={personalInputClass}
            placeholder="Ex : réunion express demain pour trancher"
          />
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <h4 className="font-semibold text-emerald-900 mb-2 text-sm">Ensuite</h4>
          <ul className="text-sm text-emerald-800 space-y-2">
            {[
              'Notification immédiate au chef de projet',
              'Ajout au registre des risques',
              'Création d\'une action corrective',
              'Réponse sous 24 h maximum',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <AppIcon icon={CheckCircle} size="sm" className="text-emerald-600 mt-0.5 shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm"
          >
            <Send className="w-4 h-4" />
            Déclarer le blocage
          </button>
        </div>
      </form>
    </ViewShell>
  );
}
