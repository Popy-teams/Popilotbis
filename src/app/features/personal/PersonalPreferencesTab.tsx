import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import type { PersonalProfile } from '../../types/personal';
import { TIMEZONE_OPTIONS } from '../../data/personalProfileStore';
import { ActionButton, FormActions, FormSelect } from '../../components/shared';

interface PersonalPreferencesTabProps {
  profile: PersonalProfile;
  onSave: (profile: PersonalProfile) => void;
}

export function PersonalPreferencesTab({ profile, onSave }: PersonalPreferencesTabProps) {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleNotification = (key: keyof PersonalProfile['notifications']) => {
    setSaved(false);
    setForm((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Régionalisation</h2>
          <p className="text-sm text-stone-500 mt-1">Langue et fuseau horaire de l&apos;interface.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label>
            <span className="block text-sm font-semibold text-stone-700 mb-1.5">Langue</span>
            <FormSelect
              value={form.language}
              onChange={(e) => {
                setSaved(false);
                setForm((prev) => ({ ...prev, language: e.target.value as 'fr' | 'en' }));
              }}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </FormSelect>
          </label>
          <label>
            <span className="block text-sm font-semibold text-stone-700 mb-1.5">Fuseau horaire</span>
            <FormSelect
              value={form.timezone}
              onChange={(e) => {
                setSaved(false);
                setForm((prev) => ({ ...prev, timezone: e.target.value }));
              }}
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </FormSelect>
          </label>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Notifications</h2>
          <p className="text-sm text-stone-500 mt-1">Choisissez comment POPILOT vous contacte.</p>
        </div>
        <div className="divide-y divide-stone-100">
          <ToggleRow
            label="Tâches assignées"
            description="Recevoir un email quand une tâche vous est assignée ou modifiée."
            checked={form.notifications.emailTasks}
            onChange={() => toggleNotification('emailTasks')}
          />
          <ToggleRow
            label="Réunions & comptes-rendus"
            description="Rappels avant vos réunions et nouveaux CR publiés."
            checked={form.notifications.emailMeetings}
            onChange={() => toggleNotification('emailMeetings')}
          />
          <ToggleRow
            label="Mentions & messages"
            description="Quand un collègue vous mentionne dans un commentaire."
            checked={form.notifications.emailMentions}
            onChange={() => toggleNotification('emailMentions')}
          />
          <ToggleRow
            label="Résumé hebdomadaire"
            description="Synthèse de votre semaine : tâches, échéances et alertes."
            checked={form.notifications.weeklyDigest}
            onChange={() => toggleNotification('weeklyDigest')}
          />
          <ToggleRow
            label="Notifications navigateur"
            description="Alertes en temps réel dans le navigateur (si autorisé)."
            checked={form.notifications.pushEnabled}
            onChange={() => toggleNotification('pushEnabled')}
          />
        </div>
      </section>

      <FormActions>
        {saved ? (
          <span className="text-sm text-emerald-700 font-medium self-center">Préférences enregistrées</span>
        ) : null}
        <ActionButton type="submit" icon={Save}>
          Enregistrer
        </ActionButton>
      </FormActions>
    </form>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-900">{label}</p>
        <p className="text-xs text-stone-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-sky-600' : 'bg-stone-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
