import { Info, Save, ListChecks } from 'lucide-react';
import { TEST_TEAM_MEMBERS } from '../../data/testData';
import type { MeetingActionItem } from '../../types/scrumMeetings';
import type { ScrumMeetingType } from '../../types/scrumMeetings';
import { SCRUM_MEETING_LABELS, defaultAgendaForType } from '../../types/scrumMeetings';
import { PageBackHeader } from '../shared/PageBackHeader';
import { ViewShell } from '../shared';
import { FormSelect } from '../shared/FormSelect';
import { PendingTasksPreview } from './PendingTasksPreview';

export interface MeetingFormValues {
  title: string;
  meetingType: ScrumMeetingType;
  sprintNumber: string;
  date: string;
  time: string;
  duration: number;
  participants: string[];
  facilitator: string;
}

export function emptyMeetingForm(type: ScrumMeetingType = 'review'): MeetingFormValues {
  return {
    title: '',
    meetingType: type,
    sprintNumber: '',
    date: '',
    time: '10:00',
    duration: type === 'daily' ? 15 : 60,
    participants: [],
    facilitator: '',
  };
}

interface MeetingFormPageProps {
  mode: 'create' | 'edit';
  values: MeetingFormValues;
  writerName: string;
  periodDays: number;
  pendingTasks?: MeetingActionItem[];
  previousSprint?: number;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (values: MeetingFormValues) => void;
  onTypeChange?: (type: ScrumMeetingType) => void;
}

export function MeetingFormPage({
  mode,
  values,
  writerName,
  periodDays,
  pendingTasks = [],
  previousSprint,
  onBack,
  onSubmit,
  onChange,
  onTypeChange,
}: MeetingFormPageProps) {
  const toggleParticipant = (name: string) => {
    onChange({
      ...values,
      participants: values.participants.includes(name)
        ? values.participants.filter((p) => p !== name)
        : [...values.participants, name],
    });
  };

  const applyTypeDefaults = (type: ScrumMeetingType) => {
    onTypeChange?.(type);
    onChange({
      ...values,
      meetingType: type,
      duration: type === 'daily' ? 15 : type === 'planning' ? 120 : 60,
    });
  };

  const refDate = values.date || new Date().toISOString().slice(0, 10);

  return (
    <ViewShell narrow>
      <PageBackHeader
        title={mode === 'create' ? 'Planifier une cérémonie Scrum' : 'Modifier la réunion'}
        subtitle="Sprint Planning · Daily · Review · Retro"
        onBack={onBack}
      />

      {mode === 'create' && (
        <section className="mb-6 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-1">
            <ListChecks className="w-5 h-5 text-amber-600" />
            Suivi des tâches du sprint précédent
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Avant la cérémonie, vérifiez l&apos;avancement des tâches laissées ouvertes lors des CR
            publiés du sprint précédent (et des cérémonies antérieures du même sprint).
          </p>
          <PendingTasksPreview
            tasks={pendingTasks}
            referenceDate={refDate}
            previousSprint={previousSprint}
            compact
          />
        </section>
      )}

      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Type de cérémonie *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(SCRUM_MEETING_LABELS) as ScrumMeetingType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => applyTypeDefaults(type)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  values.meetingType === type
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {SCRUM_MEETING_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Titre *</label>
          <input
            required
            value={values.title}
            onChange={(e) => onChange({ ...values, title: e.target.value })}
            placeholder="Ex: Sprint Review — Sprint 13"
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Sprint n°
              {mode === 'create' && values.sprintNumber ? (
                <span className="ml-1 text-xs font-normal text-indigo-600">(proposé automatiquement)</span>
              ) : null}
            </label>
            <input
              type="number"
              min={1}
              value={values.sprintNumber}
              onChange={(e) => onChange({ ...values, sprintNumber: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50"
            />
            <p className="text-xs text-slate-500 mt-1">
              Modifiable si besoin. Le suivi des tâches se base sur ce numéro de sprint.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Durée *</label>
            <FormSelect
              value={String(values.duration)}
              onChange={(e) => onChange({ ...values, duration: parseInt(e.target.value, 10) })}
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 h</option>
              <option value={90}>1h30</option>
              <option value={120}>2 h</option>
            </FormSelect>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
            <input
              type="date"
              required
              value={values.date}
              onChange={(e) => onChange({ ...values, date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Heure *</label>
            <input
              type="time"
              required
              value={values.time}
              onChange={(e) => onChange({ ...values, time: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Facilitateur</label>
          <FormSelect
            value={values.facilitator}
            onChange={(e) => onChange({ ...values, facilitator: e.target.value })}
          >
            <option value="">— Sélectionner —</option>
            {TEST_TEAM_MEMBERS.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </FormSelect>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Participants *</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {TEST_TEAM_MEMBERS.map((member) => (
              <label
                key={member.id}
                className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={values.participants.includes(member.name)}
                  onChange={() => toggleParticipant(member.name)}
                  className="rounded text-indigo-600"
                />
                {member.name}
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">{values.participants.length} participant(s)</p>
        </div>

        <div className="rounded-xl bg-violet-50 border border-violet-200 p-4 text-sm text-violet-900">
          <p className="font-semibold flex items-center gap-2">
            <Info className="w-4 h-4" />
            Rédacteur automatique : {writerName}
          </p>
          <p className="text-violet-800 mt-1 text-xs">
            Rotation tous les {periodDays} jours · Ordre du jour pré-rempli (
            {defaultAgendaForType(values.meetingType).length} points)
          </p>
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 inline-flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {mode === 'create' ? 'Planifier' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </ViewShell>
  );
}
