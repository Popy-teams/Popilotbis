import {
  Calendar,
  Clock,
  Users,
  FileText,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckSquare,
  Sparkles,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import type { ScrumMeetingRecord } from '../../types/scrumMeetings';
import {
  formatMeetingDate,
  getMeetingStatusLabel,
  getMeetingTypeAccent,
  getMeetingTypeLabel,
} from './scrumPresentation';

function participantInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatShortWeekday(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function MeetingCard({
  meeting,
  highlight,
  onView,
  onReport,
  onDelete,
}: {
  meeting: ScrumMeetingRecord;
  highlight?: boolean;
  onView: () => void;
  onReport: () => void;
  onDelete?: () => void;
}) {
  const accent = getMeetingTypeAccent(meeting.meetingType);
  const TypeIcon = accent.Icon;
  const daysUntil = Math.ceil(
    (new Date(`${meeting.date}T12:00:00`).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isToday = meeting.status === 'planned' && daysUntil === 0;
  const isSoon = meeting.status === 'planned' && daysUntil > 0 && daysUntil <= 3;
  const decisions = meeting.decisions ?? [];
  const actions = meeting.actions ?? [];
  const participants = meeting.participants ?? [];
  const taskCount = meeting.linkedTaskIds?.length ?? 0;
  const crProgress = meeting.hasReport ? 100 : meeting.status === 'in-progress' ? 55 : 0;

  return (
    <article
      className={`group relative bg-white rounded-[1.25rem] border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-1 cursor-pointer ${
        highlight ? 'border-amber-300/80 ring-2 ring-amber-200/60' : 'border-slate-200/80 shadow-sm'
      }`}
      onClick={onView}
    >
      {/* En-tête gradient */}
      <div className={`relative px-5 sm:px-6 pt-5 pb-6 bg-gradient-to-br ${accent.softBg} border-b border-white/60 overflow-hidden`}>
        <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl ${accent.glow}`} />
        <div className={`absolute -bottom-10 -left-6 w-24 h-24 rounded-full blur-2xl ${accent.glow} opacity-60`} />
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${accent.gradient}`} />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className={`relative w-14 h-14 rounded-2xl ${accent.iconBg} ${accent.iconColor} flex items-center justify-center shrink-0`}>
              <TypeIcon className="w-7 h-7" strokeWidth={1.75} />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${accent.gradient} text-white text-[9px] font-bold flex items-center justify-center shadow-md`}>
                {meeting.number}
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${accent.badge}`}>
                  {getMeetingTypeLabel(meeting.meetingType)}
                </span>
                {meeting.sprintNumber ? (
                  <span className="text-[11px] font-bold tracking-wide text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-full">
                    SPRINT {meeting.sprintNumber}
                  </span>
                ) : null}
                {isToday ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 rounded-full shadow-sm">
                    Aujourd&apos;hui
                  </span>
                ) : isSoon ? (
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-full border border-amber-200/80">
                    Dans {daysUntil} j
                  </span>
                ) : null}
              </div>

              <h3 className="font-bold text-slate-900 text-lg sm:text-xl leading-tight tracking-tight group-hover:text-indigo-700 transition-colors line-clamp-2">
                {meeting.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">{accent.description}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusPill status={meeting.status} hasReport={meeting.hasReport} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur border border-white/60 shadow-sm flex items-center justify-center text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600 hover:border-indigo-200"
              title="Ouvrir"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bandeau date / heure */}
      <div className="px-5 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white">
        <InfoTile
          icon={Calendar}
          label="Date"
          value={formatShortWeekday(meeting.date)}
          hint={formatMeetingDate(meeting.date)}
          accent={accent.gradient}
        />
        <InfoTile
          icon={Clock}
          label="Créneau"
          value={meeting.time}
          hint={`${meeting.duration} minutes`}
          accent={accent.gradient}
        />
        <InfoTile
          icon={FileText}
          label="Rédacteur"
          value={meeting.writerName.split(' ')[0]}
          hint={meeting.writerName}
          accent={accent.gradient}
        />
      </div>

      {/* Équipe & projet */}
      <div className="px-5 sm:px-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex -space-x-2.5">
            {participants.slice(0, 6).map((name, i) => (
              <div
                key={name}
                title={name}
                className={`w-8 h-8 rounded-full border-[2.5px] border-white bg-gradient-to-br ${accent.gradient} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}
                style={{ zIndex: 10 - i }}
              >
                {participantInitials(name)}
              </div>
            ))}
            {participants.length > 6 ? (
              <div className="w-8 h-8 rounded-full border-[2.5px] border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">
                +{participants.length - 6}
              </div>
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {participants.length} participant{participants.length > 1 ? 's' : ''}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{meeting.projectName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:min-w-[140px]">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>CR</span>
              <span className="font-semibold text-slate-600">{crProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${accent.gradient} transition-all duration-500`}
                style={{ width: `${crProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Métriques CR */}
      {meeting.hasReport ? (
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-b from-slate-50/80 to-white grid grid-cols-3 gap-2">
          <MetricBlock icon={Sparkles} value={decisions.length} label="Décisions" tone="violet" />
          <MetricBlock icon={CheckSquare} value={actions.length} label="Actions" tone="emerald" />
          <MetricBlock icon={BookOpen} value={taskCount} label="Tâches" tone="blue" />
        </div>
      ) : (
        <div className="px-5 sm:px-6 py-4 bg-slate-50/50">
          <p className="text-xs text-slate-500 text-center py-2 rounded-xl border border-dashed border-slate-200 bg-white/60">
            Compte rendu à rédiger après la cérémonie
          </p>
        </div>
      )}

      {/* Pied de carte */}
      <div className="px-5 sm:px-6 py-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {highlight && meeting.status === 'planned' ? (
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-900 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-3 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            Vous êtes le rédacteur désigné
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            {meeting.hasReport ? 'Synchronisé · Tâches · Pipeline · Planning' : 'Planifiée · en attente de CR'}
          </p>
        )}

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {meeting.status !== 'completed' && (
            <button
              type="button"
              onClick={onReport}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md shadow-indigo-200/50 bg-gradient-to-r ${accent.gradient} hover:opacity-95 transition-opacity`}
            >
              <Edit className="w-3.5 h-3.5" />
              Rédiger le CR
            </button>
          )}
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Détail
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusPill({ status, hasReport }: { status: string; hasReport: boolean }) {
  if (hasReport || status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Publié
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        En cours
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200/60">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {getMeetingStatusLabel(status)}
    </span>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  hint?: string;
  accent: string;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-3.5 overflow-hidden group/tile hover:border-slate-200 transition-colors">
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${accent} rounded-full opacity-80`} />
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pl-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </p>
      <p className="font-bold text-slate-900 text-sm mt-1 pl-2 truncate">{value}</p>
      {hint ? <p className="text-[11px] text-slate-500 mt-0.5 pl-2 truncate capitalize">{hint}</p> : null}
    </div>
  );
}

function MetricBlock({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Sparkles;
  value: number;
  label: string;
  tone: 'violet' | 'emerald' | 'blue';
}) {
  const tones = {
    violet: 'from-violet-500/10 to-violet-500/5 border-violet-100 text-violet-700',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-100 text-emerald-700',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-100 text-blue-700',
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-3 text-center ${tones[tone]}`}>
      <Icon className="w-4 h-4 mx-auto mb-1 opacity-70" />
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide mt-1 opacity-80">{label}</p>
    </div>
  );
}
