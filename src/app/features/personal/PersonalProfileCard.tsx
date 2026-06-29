import {
  Briefcase,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Pencil,
  Phone,
} from 'lucide-react';
import type { AuthUser } from '../../auth/authApi';
import type { PersonalProfile } from '../../types/personal';
import { getDisplayName, getInitials } from '../../data/personalProfileStore';
import { cn } from '../../components/ui/utils';
import type { PersonalStats } from './personalPresentation';

interface PersonalProfileCardProps {
  user: AuthUser;
  profile: PersonalProfile;
  stats: PersonalStats;
  variant?: 'compact' | 'hero';
  onEdit?: () => void;
  className?: string;
}

export function PersonalProfileCard({
  user,
  profile,
  stats,
  variant = 'compact',
  onEdit,
  className,
}: PersonalProfileCardProps) {
  const displayName = getDisplayName(profile) || user.name;
  const initials = getInitials(profile);
  const isHero = variant === 'hero';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-sky-50/40 shadow-sm',
        className
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400" />

      <div className={cn('p-5 sm:p-6', isHero && 'sm:p-8')}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          <div
            className={cn(
              'rounded-2xl border-2 border-white bg-gradient-to-br from-sky-100 to-blue-100 text-sky-800 flex items-center justify-center font-bold shadow-md shrink-0 ring-4 ring-white/80',
              isHero ? 'w-24 h-24 sm:w-28 sm:h-28 text-3xl' : 'w-16 h-16 text-xl'
            )}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-[0.875rem] object-cover" />
            ) : (
              initials
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  className={cn(
                    'font-bold text-slate-900 tracking-tight truncate',
                    isHero ? 'text-2xl sm:text-3xl' : 'text-lg'
                  )}
                >
                  {displayName}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{profile.jobTitle || stats.roleLabel}</p>
                {profile.department ? (
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {profile.department}
                  </p>
                ) : null}
              </div>
              {onEdit ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier
                </button>
              ) : null}
            </div>

            <div className="mt-4 sm:mt-5">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                <span className="font-medium text-slate-600">Profil complété</span>
                <span className="font-bold text-sky-700">{stats.completion}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${stats.completion}%` }}
                />
              </div>
              {stats.completion >= 100 ? (
                <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Profil complet
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-2">
                  Complétez vos coordonnées pour faciliter la collaboration.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Chip icon={Mail} label="Email" value={user.email} />
          <Chip icon={Phone} label="Téléphone" value={profile.phone || profile.mobile || 'Non renseigné'} />
          <Chip icon={MapPin} label="Bureau" value={profile.office || 'Non renseigné'} />
          <Chip icon={Briefcase} label="Rôle" value={stats.roleLabel} />
        </div>

        {profile.bio ? (
          <div className="mt-5 rounded-xl border border-slate-100 bg-white/70 p-4">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-1.5">À propos</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white/80 px-3 py-2.5 min-w-0">
      <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">{label}</p>
        <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}
