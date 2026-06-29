import { useCallback, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Mail, UserCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { loadPersonalProfile, savePersonalProfile } from '../../data/personalProfileStore';
import type { PersonalProfile, PersonalTab } from '../../types/personal';
import { ViewHero, ViewShell } from '../../components/shared';
import { buildPersonalStats } from './personalPresentation';
import { PersonalStatCard } from './PersonalStatCard';
import { PersonalTabNav } from './PersonalTabNav';
import { PersonalOverviewTab } from './PersonalOverviewTab';
import { PersonalInfoTab } from './PersonalInfoTab';
import { PersonalPreferencesTab } from './PersonalPreferencesTab';
import { PersonalSecurityTab } from './PersonalSecurityTab';

export function PersonalSpaceView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PersonalTab>('overview');
  const [profile, setProfile] = useState<PersonalProfile>(() => loadPersonalProfile(user));

  const stats = useMemo(() => buildPersonalStats(user, profile), [user, profile]);

  const handleSave = useCallback(
    (next: PersonalProfile) => {
      savePersonalProfile(next);
      setProfile(next);
    },
    []
  );

  const activeNotifications = useMemo(
    () => Object.values(profile.notifications).filter(Boolean).length,
    [profile.notifications]
  );

  return (
    <ViewShell>
      <ViewHero
        title="Espace personnel"
        subtitle="Vos informations, préférences et paramètres de compte au même endroit."
        badge="Mon espace · Profil"
        badgeIcon={UserCircle}
        theme="blue"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <PersonalStatCard
          label="Profil complété"
          value={`${stats.completion}%`}
          hint={stats.completion < 100 ? 'Complétez vos informations' : 'Profil à jour'}
          tone={stats.completion >= 80 ? 'good' : 'sky'}
          icon={CheckCircle2}
        />
        <PersonalStatCard
          label="Rôle"
          value={stats.roleLabel}
          hint="Droits dans POPILOT"
          tone="violet"
          icon={UserCircle}
        />
        <PersonalStatCard
          label="Notifications"
          value={String(activeNotifications)}
          hint="Canaux actifs"
          tone="amber"
          icon={Mail}
        />
        <PersonalStatCard
          label="Membre depuis"
          value={stats.memberSince.split(' ').slice(-2).join(' ')}
          hint={user.email}
          tone="sky"
          icon={Calendar}
        />
      </div>

      <PersonalTabNav
        activeTab={activeTab}
        onChange={setActiveTab}
        completion={stats.completion}
      />

      {activeTab === 'overview' ? (
        <PersonalOverviewTab
          user={user}
          profile={profile}
          stats={stats}
          onGoToTab={setActiveTab}
        />
      ) : null}
      {activeTab === 'profile' ? (
        <PersonalInfoTab profile={profile} onSave={handleSave} />
      ) : null}
      {activeTab === 'preferences' ? (
        <PersonalPreferencesTab profile={profile} onSave={handleSave} />
      ) : null}
      {activeTab === 'security' ? (
        <PersonalSecurityTab user={user} stats={stats} />
      ) : null}
    </ViewShell>
  );
}
