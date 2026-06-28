import { Plus, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import type { ScrumMeetingType } from '../../types/scrumMeetings';
import { SCRUM_MEETING_LABELS } from '../../types/scrumMeetings';
import { getMeetingTypeAccent } from './scrumPresentation';
import { ActionButton } from '../shared';

interface MeetingsHeroProps {
  projectName: string;
  onCreate: (type: ScrumMeetingType) => void;
  onCreateDefault: () => void;
  currentWriter: string;
  nextWriter: string;
  nextWriterDate: string;
  rotationNames: string[];
  periodDays: number;
}

export function MeetingsHero({
  projectName,
  onCreate,
  onCreateDefault,
  currentWriter,
  nextWriter,
  nextWriterDate,
  rotationNames,
  periodDays,
}: MeetingsHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-indigo-100/90 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 shadow-sm shadow-indigo-100/50">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.85)_0%,_transparent_55%)]" />
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-200/35 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-violet-200/25 blur-3xl" />

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-4 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Cérémonies Scrum · {projectName}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-slate-900">
              Réunions & Comptes Rendus
            </h1>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Planifiez vos cérémonies, rédigez des CR structurés et synchronisez automatiquement
              les tâches, le pipeline, la documentation et le planning Gantt.
            </p>
            <div className="mt-6">
              <ActionButton icon={Plus} onClick={onCreateDefault}>
                Planifier une cérémonie
              </ActionButton>
            </div>
          </div>

          <div className="xl:w-[min(100%,22rem)] rounded-2xl bg-white/75 backdrop-blur-md border border-indigo-100/80 shadow-sm p-5">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-4">
              <RotateCcw className="w-4 h-4" />
              Rotation rédacteur · {periodDays} j
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-indigo-50/80 border border-indigo-100 p-3">
                <p className="text-[10px] uppercase tracking-wide text-indigo-500">Actuel</p>
                <p className="font-bold text-lg mt-0.5 truncate text-slate-900">{currentWriter}</p>
              </div>
              <div className="rounded-xl bg-violet-50/80 border border-violet-100 p-3">
                <p className="text-[10px] uppercase tracking-wide text-violet-500">Suivant</p>
                <p className="font-bold text-lg mt-0.5 truncate text-slate-900">{nextWriter}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{nextWriterDate}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-xs text-slate-600">
              {rotationNames.map((name, idx) => (
                <span key={name} className="inline-flex items-center">
                  {idx > 0 && <ArrowRight className="w-3 h-3 mx-0.5 opacity-40" />}
                  <span className={name === currentWriter ? 'font-bold text-indigo-700' : ''}>
                    {name.split(' ')[0]}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {(Object.keys(SCRUM_MEETING_LABELS) as ScrumMeetingType[]).map((type) => {
            const accent = getMeetingTypeAccent(type);
            const Icon = accent.Icon;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onCreate(type)}
                className="group text-left rounded-2xl bg-white/80 hover:bg-white border border-slate-200/80 hover:border-indigo-200 hover:shadow-md p-4 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm text-slate-900 leading-tight">
                  {SCRUM_MEETING_LABELS[type]}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{accent.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
