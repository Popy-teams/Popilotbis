import { ArrowRight, Bell, Shield, Sparkles } from 'lucide-react';
import type { AuthUser } from '../../auth/authApi';
import type { PersonalProfile } from '../../types/personal';
import type { PersonalStats } from './personalPresentation';
import type { PersonalTab } from '../../types/personal';
import { PersonalProfileCard } from './PersonalProfileCard';

interface PersonalOverviewTabProps {
  user: AuthUser;
  profile: PersonalProfile;
  stats: PersonalStats;
  onGoToTab: (tab: PersonalTab) => void;
}

export function PersonalOverviewTab({ user, profile, stats, onGoToTab }: PersonalOverviewTabProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <PersonalProfileCard
        user={user}
        profile={profile}
        stats={stats}
        variant="hero"
        onEdit={() => onGoToTab('profile')}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <QuickLink
          icon={Sparkles}
          title="Compléter le profil"
          description="Identité, poste et coordonnées"
          action="Informations"
          onClick={() => onGoToTab('profile')}
          tone="sky"
        />
        <QuickLink
          icon={Bell}
          title="Notifications"
          description="Emails, rappels et résumé hebdo"
          action="Préférences"
          onClick={() => onGoToTab('preferences')}
          tone="violet"
        />
        <QuickLink
          icon={Shield}
          title="Sécurité du compte"
          description="Email, rôle et session active"
          action="Sécurité"
          onClick={() => onGoToTab('security')}
          tone="slate"
        />
      </div>
    </div>
  );
}

function QuickLink({
  icon: Icon,
  title,
  description,
  action,
  onClick,
  tone,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  tone: 'sky' | 'violet' | 'slate';
}) {
  const tones = {
    sky: {
      wrap: 'border-sky-100 hover:border-sky-200 hover:bg-sky-50/40',
      icon: 'bg-sky-100 text-sky-700',
      action: 'text-sky-700',
    },
    violet: {
      wrap: 'border-violet-100 hover:border-violet-200 hover:bg-violet-50/40',
      icon: 'bg-violet-100 text-violet-700',
      action: 'text-violet-700',
    },
    slate: {
      wrap: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80',
      icon: 'bg-slate-100 text-slate-700',
      action: 'text-slate-700',
    },
  };
  const t = tones[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left rounded-2xl border bg-white p-4 sm:p-5 shadow-sm transition-all ${t.wrap}`}
    >
      <div className={`inline-flex p-2 rounded-xl mb-3 ${t.icon}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
      <span
        className={`inline-flex items-center gap-1 mt-3 text-xs font-semibold ${t.action} group-hover:gap-2 transition-all`}
      >
        {action}
        <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}
