import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import type { PersonalProfile } from '../../types/personal';
import { ActionButton, FormActions } from '../../components/shared';

interface PersonalInfoTabProps {
  profile: PersonalProfile;
  onSave: (profile: PersonalProfile) => void;
}

export function PersonalInfoTab({ profile, onSave }: PersonalInfoTabProps) {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const update = <K extends keyof PersonalProfile>(key: K, value: PersonalProfile[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Identité</h2>
          <p className="text-sm text-stone-500 mt-1">Nom affiché dans POPILOT et auprès de votre équipe.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prénom" required>
            <input
              required
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className="saas-input w-full"
            />
          </Field>
          <Field label="Nom">
            <input
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className="saas-input w-full"
            />
          </Field>
        </div>
        <Field label="Bio / Présentation">
          <textarea
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            rows={4}
            placeholder="Décrivez votre rôle, vos expertises et ce sur quoi vous travaillez actuellement..."
            className="saas-input w-full resize-y min-h-[6rem]"
          />
        </Field>
        <Field label="Profil LinkedIn (URL)">
          <input
            type="url"
            value={form.linkedIn}
            onChange={(e) => update('linkedIn', e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className="saas-input w-full"
          />
        </Field>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Organisation</h2>
          <p className="text-sm text-stone-500 mt-1">Fonction et service au sein de l&apos;entreprise.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Intitulé de poste">
            <input
              value={form.jobTitle}
              onChange={(e) => update('jobTitle', e.target.value)}
              className="saas-input w-full"
            />
          </Field>
          <Field label="Département / Pôle">
            <input
              value={form.department}
              onChange={(e) => update('department', e.target.value)}
              className="saas-input w-full"
            />
          </Field>
          <Field label="Bureau / Localisation" className="sm:col-span-2">
            <input
              value={form.office}
              onChange={(e) => update('office', e.target.value)}
              placeholder="Ex : Paris — Siège, Télétravail..."
              className="saas-input w-full"
            />
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Coordonnées</h2>
          <p className="text-sm text-stone-500 mt-1">Visibles par les membres de vos projets.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Téléphone fixe">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+33 1 23 45 67 89"
              className="saas-input w-full"
            />
          </Field>
          <Field label="Mobile">
            <input
              type="tel"
              value={form.mobile}
              onChange={(e) => update('mobile', e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="saas-input w-full"
            />
          </Field>
        </div>
      </section>

      <FormActions>
        {saved ? (
          <span className="text-sm text-emerald-700 font-medium self-center">Profil enregistré</span>
        ) : null}
        <ActionButton type="submit" icon={Save}>
          Enregistrer
        </ActionButton>
      </FormActions>
    </form>
  );
}

function Field({
  label,
  children,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="block text-sm font-semibold text-stone-700 mb-1.5">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}
