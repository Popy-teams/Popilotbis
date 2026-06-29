import { useState } from 'react';
import { Briefcase, FileText, Layers, Plus } from 'lucide-react';
import type { TeamPosition } from '../../data/teamPositions';
import { DEFAULT_POSITION_CATEGORIES } from '../../utils/positionCategoryStore';
import { ViewShell, PageBackHeader, ActionButton, AppIcon, FormSelect } from '../shared';
import { CompetenciesEditor, normalizeCompetencies } from './CompetenciesEditor';

export interface PositionFormValues {
  title: string;
  category: string;
  competencies: string[];
}

const NEW_CATEGORY_VALUE = '__new_category__';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

export function positionToFormValues(position: TeamPosition): PositionFormValues {
  return {
    title: position.title,
    category: position.category,
    competencies: [...position.competencies],
  };
}

export function emptyPositionForm(category?: string): PositionFormValues {
  return {
    title: '',
    category: category ?? DEFAULT_POSITION_CATEGORIES[0],
    competencies: [],
  };
}

export function formValuesToPosition(
  values: PositionFormValues,
  base: { id: string; projectId?: string }
): TeamPosition {
  return {
    id: base.id,
    projectId: base.projectId,
    title: values.title.trim(),
    category: values.category.trim(),
    competencies: normalizeCompetencies(values.competencies),
  };
}

interface PositionFormPageProps {
  mode: 'create' | 'edit';
  values: PositionFormValues;
  categories: string[];
  submitLabel: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (values: PositionFormValues) => void;
  onAddCategory?: (label: string) => void;
}

export function PositionFormPage({
  mode,
  values,
  categories,
  submitLabel,
  onBack,
  onSubmit,
  onChange,
  onAddCategory,
}: PositionFormPageProps) {
  const categoryOptions = Array.from(
    new Set([...DEFAULT_POSITION_CATEGORIES, ...categories, values.category].filter(Boolean))
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const patch = (partial: Partial<PositionFormValues>) => onChange({ ...values, ...partial });

  const handleCategoryChange = (value: string) => {
    if (value === NEW_CATEGORY_VALUE) {
      setCreatingCategory(true);
      setNewCategoryName('');
      return;
    }
    setCreatingCategory(false);
    patch({ category: value });
  };

  const confirmNewCategory = () => {
    const label = newCategoryName.trim();
    if (!label) return;
    onAddCategory?.(label);
    patch({ category: label });
    setCreatingCategory(false);
    setNewCategoryName('');
  };

  return (
    <ViewShell>
      <PageBackHeader
        title={mode === 'create' ? 'Nouveau poste' : 'Modifier le poste'}
        subtitle="Définissez le titre, la catégorie et les compétences requises"
        onBack={onBack}
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <AppIcon icon={Briefcase} size="sm" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Identité du poste</h2>
              <p className="text-xs text-slate-500">Utilisé lors de la création de membres</p>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="pos-title">
              Intitulé du poste *
            </label>
            <input
              id="pos-title"
              required
              value={values.title}
              onChange={(e) => patch({ title: e.target.value })}
              className={inputClass}
              placeholder="Ex. Ingénieur IA / Vision"
            />
          </div>
          <div className="space-y-3">
            <label className={labelClass} htmlFor="pos-category">
              Catégorie *
            </label>
            <FormSelect
              id="pos-category"
              value={creatingCategory ? NEW_CATEGORY_VALUE : values.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value={NEW_CATEGORY_VALUE}>+ Nouvelle catégorie…</option>
            </FormSelect>
            {creatingCategory ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className={`${inputClass} flex-1 min-w-0`}
                  placeholder="Nom de la nouvelle catégorie"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      confirmNewCategory();
                    }
                  }}
                />
                <ActionButton
                  type="button"
                  variant="secondary"
                  icon={Plus}
                  className="!rounded-xl shrink-0"
                  onClick={confirmNewCategory}
                >
                  Ajouter
                </ActionButton>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <AppIcon icon={Layers} size="sm" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Compétences liées</h2>
              <p className="text-xs text-slate-500">Héritées par les membres assignés à ce poste</p>
            </div>
          </div>
          <CompetenciesEditor
            items={values.competencies}
            onChange={(competencies) => patch({ competencies })}
          />
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
