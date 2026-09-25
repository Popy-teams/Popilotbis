import { FileText, Mail, Phone, Upload, User } from 'lucide-react';
import type { TeamPosition } from '../../data/teamPositions';
import { ViewShell, PageBackHeader, ActionButton, AppIcon, FormSelect } from '../shared';

export interface MemberFormValues {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  positionIds: string[];
  photoUrl: string;
  availability?: string;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

interface MemberFormPageProps {
  mode: 'create' | 'edit';
  values: MemberFormValues;
  positions: TeamPosition[];
  photoPreview: string | null;
  submitLabel: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (values: MemberFormValues) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

import { useApi } from '../../hooks/useApi';

export function MemberFormPage({
  mode,
  values,
  positions,
  photoPreview,
  submitLabel,
  onBack,
  onSubmit,
  onChange,
  onPhotoUpload,
}: MemberFormPageProps) {
  const selectedPositions = positions.filter((p) => values.positionIds.includes(p.id));
  const patch = (partial: Partial<MemberFormValues>) => onChange({ ...values, ...partial });

  const { data: users } = useApi<any[]>('/users');

  const handleUserChange = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    if (user) {
      patch({ userId: user.id, name: user.name, email: user.email });
    } else {
      patch({ userId: '' });
    }
  };

  return (
    <ViewShell>
      <PageBackHeader
        title={mode === 'create' ? 'Nouveau membre' : 'Modifier le membre'}
        subtitle="Liez le membre à un poste existant pour hériter de ses compétences"
        onBack={onBack}
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <AppIcon icon={User} size="sm" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Profil</h2>
            </div>
          </div>

          <div>
            <label className={labelClass}>Photo</label>
            <div className="flex items-center gap-4">
              {photoPreview || values.photoUrl ? (
                <img
                  src={photoPreview || values.photoUrl}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100">
                <Upload className="w-4 h-4" />
                Choisir une photo
                <input type="file" accept="image/*" onChange={onPhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="member-user">
              Lier à un compte utilisateur existant
            </label>
            <FormSelect
              id="member-user"
              value={values.userId || ''}
              onChange={(e) => handleUserChange(e.target.value)}
            >
              <option value="">Sélectionner un utilisateur...</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <label className={labelClass} htmlFor="member-name">
              Nom complet *
            </label>
            <input
              id="member-name"
              required
              value={values.name}
              onChange={(e) => patch({ name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="member-email">
                Email *
              </label>
              <input
                id="member-email"
                type="email"
                required
                value={values.email}
                onChange={(e) => patch({ email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="member-phone">
                Téléphone
              </label>
              <input
                id="member-phone"
                type="tel"
                value={values.phone}
                onChange={(e) => patch({ phone: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div>
            <label className={labelClass}>
              Postes * (Cochez un ou plusieurs)
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-white">
              {positions.map((p) => {
                const isSelected = values.positionIds.includes(p.id);
                return (
                  <label key={p.id} className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          patch({ positionIds: [...values.positionIds, p.id] });
                        } else {
                          patch({ positionIds: values.positionIds.filter(id => id !== p.id) });
                        }
                      }}
                    />
                    <div>
                      <div className={`text-sm font-medium leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{p.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.category}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            {values.positionIds.length === 0 && (
              <p className="mt-2 text-xs text-red-500">Veuillez sélectionner au moins un poste.</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="member-availability">
              Disponibilité
            </label>
            <FormSelect
              id="member-availability"
              value={values.availability || 'Disponible'}
              onChange={(e) => patch({ availability: e.target.value })}
            >
              <option value="Disponible">Disponible</option>
              <option value="Occupé">Occupé</option>
              <option value="Surchargé">Surchargé</option>
              <option value="En congé">En congé</option>
            </FormSelect>
          </div>

          {selectedPositions.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-medium text-slate-500 mb-2">Compétences des postes</p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(selectedPositions.flatMap(p => p.competencies))).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <ActionButton type="button" variant="secondary" onClick={onBack} className="!rounded-xl !py-3">
            Annuler
          </ActionButton>
          <ActionButton type="submit" variant="primary" icon={FileText} className="!rounded-xl !py-3">
            {submitLabel}
          </ActionButton>
        </div>
      </form>
    </ViewShell>
  );
}

export function emptyMemberForm(defaultPositionId = ''): MemberFormValues {
  return {
    name: '',
    email: '',
    phone: '',
    positionIds: defaultPositionId ? [defaultPositionId] : [],
    photoUrl: '',
  };
}
