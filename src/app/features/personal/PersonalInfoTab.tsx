import { useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Contact,
  Linkedin,
  Save,
  UserRound,
} from 'lucide-react';
import type { PersonalProfile } from '../../types/personal';
import type { AuthUser } from '../../auth/authApi';
import { getDisplayName, getInitials } from '../../data/personalProfileStore';
import { personalInputClass, personalLabelClass, personalSectionCardClass } from './personalFormStyles';
import type { PersonalStats } from './personalPresentation';
import { cn } from '../../components/ui/utils';

type FormSection = 'identity' | 'organization' | 'contact';

interface PersonalInfoTabProps {
  user: AuthUser;
  profile: PersonalProfile;
  stats: PersonalStats;
  onSave: (profile: PersonalProfile) => void;
}

export function PersonalInfoTab({ user, profile, stats, onSave }: PersonalInfoTabProps) {
  const [form, setForm] = useState(profile);
  const [section, setSection] = useState<FormSection>('identity');
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

  const previewName = getDisplayName(form) || user.name;
  const previewInitials = getInitials(form);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 sm:gap-6 min-w-0">
      <form onSubmit={handleSubmit} className="xl:col-span-3 space-y-4 min-w-0">
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200 overflow-x-auto">
          <SectionTab
            active={section === 'identity'}
            onClick={() => setSection('identity')}
            icon={UserRound}
            label="Identité"
          />
          <SectionTab
            active={section === 'organization'}
            onClick={() => setSection('organization')}
            icon={Briefcase}
            label="Organisation"
          />
          <SectionTab
            active={section === 'contact'}
            onClick={() => setSection('contact')}
            icon={Contact}
            label="Coordonnées"
          />
        </div>

        <div className={cn(personalSectionCardClass, 'p-4 sm:p-6 space-y-4')}>
          {section === 'identity' ? (
            <>
              <SectionHeader
                title="Identité"
                description="Nom et présentation visibles par votre équipe dans POPILOT."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Prénom" required>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    className={personalInputClass}
                    placeholder="Votre prénom"
                  />
                </Field>
                <Field label="Nom">
                  <input
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    className={personalInputClass}
                    placeholder="Votre nom"
                  />
                </Field>
              </div>
              <Field label="Bio / Présentation">
                <textarea
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  rows={5}
                  placeholder="Votre rôle, expertises, projets en cours…"
                  className={cn(personalInputClass, 'resize-y min-h-[7rem] leading-relaxed')}
                />
              </Field>
              <Field label="Profil LinkedIn" hint="URL complète de votre profil public">
                <div className="relative">
                  <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    value={form.linkedIn}
                    onChange={(e) => update('linkedIn', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className={cn(personalInputClass, 'pl-10')}
                  />
                </div>
              </Field>
            </>
          ) : null}

          {section === 'organization' ? (
            <>
              <SectionHeader
                title="Organisation"
                description="Fonction et rattachement au sein de l'entreprise."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Intitulé de poste">
                  <input
                    value={form.jobTitle}
                    onChange={(e) => update('jobTitle', e.target.value)}
                    className={personalInputClass}
                    placeholder="Ex : Chef de projet"
                  />
                </Field>
                <Field label="Département / Pôle">
                  <input
                    value={form.department}
                    onChange={(e) => update('department', e.target.value)}
                    className={personalInputClass}
                    placeholder="Ex : R&D Produit"
                  />
                </Field>
                <Field label="Bureau / Localisation" className="sm:col-span-2">
                  <input
                    value={form.office}
                    onChange={(e) => update('office', e.target.value)}
                    placeholder="Paris — Siège, Télétravail…"
                    className={personalInputClass}
                  />
                </Field>
              </div>
            </>
          ) : null}

          {section === 'contact' ? (
            <>
              <SectionHeader
                title="Coordonnées"
                description="Informations de contact partagées avec les membres de vos projets."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Téléphone fixe">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                    className={personalInputClass}
                  />
                </Field>
                <Field label="Mobile">
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => update('mobile', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className={personalInputClass}
                  />
                </Field>
              </div>
              <div className="rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-3 text-xs text-sky-900 leading-relaxed">
                Votre email de connexion <strong className="font-semibold">{user.email}</strong> est géré
                dans l&apos;onglet Sécurité et ne peut pas être modifié ici.
              </div>
            </>
          ) : null}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500 sm:max-w-[50%]">
            Les modifications sont enregistrées localement sur cet appareil.
          </p>
          <div className="flex items-center gap-3">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Enregistré
              </span>
            ) : null}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </div>
      </form>

      <aside className="xl:col-span-2 min-w-0">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 px-0.5">
          Aperçu en direct
        </p>
        <div className="xl:sticky xl:top-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="h-16 bg-gradient-to-br from-slate-100 via-sky-50 to-blue-50 border-b border-slate-100" />
            <div className="px-5 pb-5 -mt-8">
              <div className="w-16 h-16 rounded-2xl border-4 border-white bg-gradient-to-br from-sky-100 to-blue-100 text-sky-800 flex items-center justify-center text-xl font-bold shadow-md">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  previewInitials
                )}
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900 truncate">{previewName}</h3>
              <p className="text-sm text-slate-600 truncate">{form.jobTitle || stats.roleLabel}</p>
              {form.department ? (
                <p className="text-xs text-slate-500 mt-0.5 truncate">{form.department}</p>
              ) : null}
            </div>
            <div className="px-5 pb-5 space-y-2 border-t border-slate-100 pt-4">
              <PreviewRow label="Email" value={user.email} />
              <PreviewRow label="Téléphone" value={form.phone || form.mobile || '—'} />
              <PreviewRow label="Bureau" value={form.office || '—'} />
            </div>
            {form.bio ? (
              <div className="mx-5 mb-5 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-1">Bio</p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{form.bio}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1">Conseil</p>
            Un profil complet améliore la visibilité de vos contributions dans les réunions, tâches et
            l&apos;espace équipe.
          </div>
        </div>
      </aside>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="pb-1 border-b border-slate-100 mb-1">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  hint,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={personalLabelClass}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {hint ? <p className="text-xs text-slate-400 -mt-1 mb-1.5">{hint}</p> : null}
      {children}
    </div>
  );
}

function SectionTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof UserRound;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors',
        active
          ? 'bg-white text-sky-900 shadow-sm border border-slate-200'
          : 'text-slate-600 hover:text-slate-900'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="font-medium text-slate-800 truncate text-right">{value}</span>
    </div>
  );
}
