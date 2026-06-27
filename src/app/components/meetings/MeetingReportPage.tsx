import {
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  CalendarDays,
  ClipboardList,
  ListChecks,
} from 'lucide-react';
import type { PipelineStage } from '../../types/planning';
import type { MeetingActionItem, MeetingDecisionItem, ScrumMeetingRecord } from '../../types/scrumMeetings';
import { TEST_TEAM_MEMBERS, type TestTeamMember } from '../../data/testData';
import {
  countLateActions,
  isActionLate,
  emptyAction,
  emptyDecision,
  type ReportFormState,
} from '../../utils/meetingFollowUp';
import { formatMeetingNumber, formatCrLabel } from './scrumPresentation';
import { PageBackHeader } from '../shared/PageBackHeader';
import { ViewShell, ActionButton } from '../shared';
import { FormSelect } from '../shared/FormSelect';
import { ExportMeetingReportPdfButton } from './ExportMeetingReportPdfButton';

export type { ReportFormState } from '../../utils/meetingFollowUp';
export { emptyAction, emptyDecision } from '../../utils/meetingFollowUp';

const STATUS_LABELS: Record<MeetingActionItem['status'], string> = {
  pending: 'À faire',
  'in-progress': 'En cours',
  completed: 'Terminé',
};

interface MeetingReportPageProps {
  meeting: ScrumMeetingRecord;
  form: ReportFormState;
  stages: PipelineStage[];
  members?: TestTeamMember[];
  onBack: () => void;
  onChange: (form: ReportFormState) => void;
  onPublish: () => void;
}

interface ActionRowProps {
  action: MeetingActionItem;
  meeting: ScrumMeetingRecord;
  stages: PipelineStage[];
  members: TestTeamMember[];
  variant: 'follow-up' | 'new';
  onUpdate: (patch: Partial<MeetingActionItem>) => void;
  onRemove: () => void;
}

function ActionRow({
  action,
  meeting,
  stages,
  members,
  variant,
  onUpdate,
  onRemove,
}: ActionRowProps) {
  const late = variant === 'follow-up' && isActionLate(action, meeting.date);
  const done = action.status === 'completed';

  return (
    <div
      className={`p-4 rounded-xl border space-y-3 transition-colors ${
        done
          ? 'border-emerald-200 bg-emerald-50/60'
          : late
            ? 'border-amber-300 bg-amber-50/50'
            : variant === 'follow-up'
              ? 'border-amber-200/80 bg-amber-50/30'
              : 'border-indigo-100 bg-indigo-50/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {variant === 'follow-up' && action.originMeetingNumber != null && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {action.originMeetingNumber != null
                  ? formatCrLabel(action.originMeetingNumber)
                  : action.source}
              </span>
              {late && !done && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  <AlertTriangle className="w-3 h-3" />
                  En retard
                </span>
              )}
              {done && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" />
                  Fait
                </span>
              )}
            </div>
          )}
          <input
            value={action.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Description de la tâche / action"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
          title="Retirer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <User className="w-3 h-3" />
            Assigné à
          </label>
          <FormSelect
            value={action.assignedTo}
            onChange={(e) => {
              const member = members.find((m) => m.id === e.target.value);
              onUpdate({
                assignedTo: e.target.value,
                assignedToName: member?.name ?? e.target.value,
              });
            }}
            size="sm"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </FormSelect>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            Début (réunion)
          </label>
          <input
            type="date"
            value={action.startDate ?? meeting.date}
            readOnly
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600"
            title="Date de la réunion source — barre Gantt"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Échéance
          </label>
          <input
            type="date"
            value={action.dueDate}
            min={action.startDate ?? meeting.date}
            onChange={(e) => onUpdate({ dueDate: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1">Statut</label>
          <FormSelect
            value={action.status}
            onChange={(e) =>
              onUpdate({ status: e.target.value as MeetingActionItem['status'] })
            }
            size="sm"
          >
            <option value="pending">{STATUS_LABELS.pending}</option>
            <option value="in-progress">{STATUS_LABELS['in-progress']}</option>
            <option value="completed">{STATUS_LABELS.completed}</option>
          </FormSelect>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <FormSelect
          value={action.stageId ?? ''}
          onChange={(e) => onUpdate({ stageId: e.target.value || undefined })}
          size="sm"
        >
          <option value="">Étape pipeline (optionnel)</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </FormSelect>
        <p className="text-xs text-slate-500">
          Synchronisée automatiquement → Tâches & Gantt
        </p>
      </div>
    </div>
  );
}

export function MeetingReportPage({
  meeting,
  form,
  stages,
  members = TEST_TEAM_MEMBERS,
  onBack,
  onChange,
  onPublish,
}: MeetingReportPageProps) {
  const lateCount = countLateActions(form, meeting.date);
  const followUpDone = form.followUpActions.filter((a) => a.status === 'completed').length;
  const totalActions = form.followUpActions.length + form.newActions.length;

  const updateDecision = (id: string, patch: Partial<MeetingDecisionItem>) => {
    onChange({
      ...form,
      decisions: form.decisions.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    });
  };

  const updateFollowUp = (id: string, patch: Partial<MeetingActionItem>) => {
    onChange({
      ...form,
      followUpActions: form.followUpActions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  };

  const updateNewAction = (id: string, patch: Partial<MeetingActionItem>) => {
    onChange({
      ...form,
      newActions: form.newActions.map((a) => {
        if (a.id !== id) return a;
        const next = { ...a, ...patch };
        if (patch.assignedTo) {
          const member = members.find((m) => m.id === patch.assignedTo);
          if (member) next.assignedToName = member.name;
        }
        return next;
      }),
    });
  };

  return (
    <ViewShell narrow>
      <PageBackHeader
        title={`Compte rendu — ${meeting.title}`}
        subtitle={`${formatMeetingNumber(meeting.number)} · ${meeting.date} · Rédacteur : ${meeting.writerName}`}
        onBack={onBack}
        actions={
          <ExportMeetingReportPdfButton meeting={meeting} form={form} />
        }
      />

      {/* Bandeau synthèse */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-slate-500">Suivi CR précédent</p>
          <p className="text-lg font-bold text-slate-900">{form.followUpActions.length}</p>
          {form.followUpActions.length > 0 && (
            <p className="text-xs text-emerald-600">
              {followUpDone}/{form.followUpActions.length} terminées
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-slate-500">En retard</p>
          <p className={`text-lg font-bold ${lateCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {lateCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-slate-500">Nouvelles tâches</p>
          <p className="text-lg font-bold text-indigo-600">{form.newActions.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-slate-500">Total à synchroniser</p>
          <p className="text-lg font-bold text-slate-900">{totalActions}</p>
        </div>
      </div>

      <div className="space-y-6 pb-24">
        {/* Suivi actions précédentes */}
        <section className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-amber-600" />
                Suivi des actions précédentes
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Tâches issues des CR antérieurs ({meeting.meetingType}). Cochez le statut pour
                valider ce qui est fait et repérer les retards.
              </p>
            </div>
          </div>

          {form.followUpActions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-amber-200 bg-white/60 p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                Aucune action en cours depuis la réunion précédente — tout est à jour.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {form.followUpActions.map((act) => (
                <ActionRow
                  key={act.id}
                  action={act}
                  meeting={meeting}
                  stages={stages}
                  members={members}
                  variant="follow-up"
                  onUpdate={(patch) => updateFollowUp(act.id, patch)}
                  onRemove={() =>
                    onChange({
                      ...form,
                      followUpActions: form.followUpActions.filter((a) => a.id !== act.id),
                    })
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Nouvelles tâches */}
        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                Nouvelles tâches
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ajoutez autant de tâches que nécessaire. Date de début = {meeting.date} ·
                échéance modifiable. Chaque tâche apparaît dans l&apos;onglet Tâches et le Gantt.
              </p>
            </div>
            <ActionButton
              variant="secondary"
              icon={Plus}
              onClick={() =>
                onChange({
                  ...form,
                  newActions: [...form.newActions, emptyAction(meeting)],
                })
              }
              className="shrink-0"
            >
              Ajouter une tâche
            </ActionButton>
          </div>

          {form.newActions.length === 0 ? (
            <button
              type="button"
              onClick={() =>
                onChange({ ...form, newActions: [emptyAction(meeting)] })
              }
              className="w-full py-8 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 text-sm font-medium transition-colors"
            >
              + Cliquer pour ajouter la première tâche
            </button>
          ) : (
            <div className="space-y-3">
              {form.newActions.map((act, idx) => (
                <div key={act.id}>
                  <p className="text-xs font-medium text-indigo-600 mb-1.5 ml-1">
                    Tâche {idx + 1}
                  </p>
                  <ActionRow
                    action={act}
                    meeting={meeting}
                    stages={stages}
                    members={members}
                    variant="new"
                    onUpdate={(patch) => updateNewAction(act.id, patch)}
                    onRemove={() =>
                      onChange({
                        ...form,
                        newActions: form.newActions.filter((a) => a.id !== act.id),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Décisions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Décisions</h3>
            <button
              type="button"
              onClick={() =>
                onChange({ ...form, decisions: [...form.decisions, emptyDecision(meeting)] })
              }
              className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
          {form.decisions.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune décision enregistrée.</p>
          ) : (
            form.decisions.map((dec) => (
              <div
                key={dec.id}
                className="grid gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <input
                  value={dec.description}
                  onChange={(e) => updateDecision(dec.id, { description: e.target.value })}
                  placeholder="Description de la décision"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <FormSelect
                    value={dec.impact}
                    onChange={(e) =>
                      updateDecision(dec.id, {
                        impact: e.target.value as MeetingDecisionItem['impact'],
                      })
                    }
                    size="sm"
                  >
                    <option value="planning">Planning</option>
                    <option value="budget">Budget</option>
                    <option value="quality">Qualité</option>
                    <option value="scope">Périmètre</option>
                  </FormSelect>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...form,
                        decisions: form.decisions.filter((d) => d.id !== dec.id),
                      })
                    }
                    className="inline-flex items-center justify-center gap-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Retirer
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Notes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <label className="block text-sm font-semibold text-slate-900">
            Notes & tour de table
          </label>
          <textarea
            rows={5}
            value={form.notes}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            placeholder="Points discutés, blocages, prochaines étapes..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20"
          />
        </section>
      </div>

      {/* Barre fixe publication */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onPublish}
            className="flex-[2] px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-md shadow-indigo-200"
          >
            Publier le CR & synchroniser ({totalActions} tâche{totalActions !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </ViewShell>
  );
}
