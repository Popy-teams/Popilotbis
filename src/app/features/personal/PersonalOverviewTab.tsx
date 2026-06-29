import {
  Briefcase,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import type { AuthUser } from '../../auth/authApi';
import type { PersonalProfile } from '../../types/personal';
import { getDisplayName, getInitials } from '../../data/personalProfileStore';
import { ViewHighlightBanner } from '../../components/shared';
import type { PersonalStats } from './personalPresentation';
import type { PersonalTab } from '../../types/personal';

interface PersonalOverviewTabProps {
  user: AuthUser;
  profile: PersonalProfile;
  stats: PersonalStats;
  onGoToTab: (tab: PersonalTab) => void;
}

export function PersonalOverviewTab({ user, profile, stats, onGoToTab }: PersonalOverviewTabProps) {
  const displayName = getDisplayName(profile) || user.name;
  const initials = getInitials(profile);

  return (
    <div className="space-y-6">
      <ViewHighlightBanner
        title={`Bonjour, ${profile.firstName || displayName.split(' ')[0]}`}
        subtitle="Gérez vos informations personnelles, vos préférences de notification et les paramètres de votre compte POPILOT."
        theme="blue"
      />

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 h-20 sm:h-24" />
        <div className="px-4 sm:px-6 pb-6 -mt-10 sm:-mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white bg-sky-100 text-sky-800 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-md shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 truncate">{displayName}</h2>
              <p className="text-sm text-stone-600 mt-0.5">{profile.jobTitle || stats.roleLabel}</p>
              <p className="text-xs text-stone-500 mt-1">{profile.department}</p>
            </div>
            <button
              type="button"
              onClick={() => onGoToTab('profile')}
              className="shrink-0 px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors"
            >
              Modifier le profil
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-stone-700">Profil complété</span>
              <span className="font-bold text-sky-700">{stats.completion}%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-sky-500 to-blue-600 h-2.5 rounded-full transition-all"
                style={{ width: `${stats.completion}%` }}
              />
            </div>
            {stats.completion < 100 ? (
              <p className="text-xs text-stone-500 mt-2">
                Complétez vos coordonnées et votre bio pour faciliter la collaboration en équipe.
              </p>
            ) : (
              <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Votre profil est complet
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow icon={Mail} label="Email" value={user.email} />
        <InfoRow icon={Phone} label="Téléphone" value={profile.phone || profile.mobile || '—'} />
        <InfoRow icon={Building2} label="Bureau" value={profile.office || '—'} />
        <InfoRow icon={Briefcase} label="Rôle POPILOT" value={stats.roleLabel} />
        <InfoRow icon={MapPin} label="Fuseau horaire" value={profile.timezone.replace('_', ' ')} />
        <InfoRow icon={User} label="Membre depuis" value={stats.memberSince} />
      </div>

      {profile.bio ? (
        <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-2">À propos</h3>
          <p className="text-sm text-stone-600 whitespace-pre-wrap">{profile.bio}</p>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-stone-200 min-w-0">
      <div className="p-2 rounded-lg bg-sky-50 text-sky-700 shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-stone-500">{label}</p>
        <p className="text-sm font-medium text-stone-900 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}
