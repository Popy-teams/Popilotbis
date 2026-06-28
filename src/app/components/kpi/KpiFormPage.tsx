import type { KpiFormValues } from '../../types/kpi';
import { KPI_CATEGORIES } from '../../data/kpiReferential';
import { PageBackHeader } from '../shared/PageBackHeader';
import { ViewShell } from '../shared';

const inputClass =
  'w-full px-3 sm:px-4 py-2.5 border border-stone-300 rounded-lg bg-white text-stone-900 placeholder:text-stone-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500';

interface KpiFormPageProps {
  mode: 'create' | 'edit';
  form: KpiFormValues;
  onChange: (form: KpiFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function KpiFormPage({ mode, form, onChange, onSubmit, onBack }: KpiFormPageProps) {
  return (
    <ViewShell narrow>
      <PageBackHeader
        title={mode === 'create' ? 'Nouveau KPI' : 'Modifier le KPI'}
        onBack={onBack}
      />
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 space-y-4 shadow-sm"
      >
        <input
          required
          placeholder="Nom du KPI"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className={inputClass}
        />
        <select
          value={form.categoryId}
          onChange={(e) => onChange({ ...form, categoryId: e.target.value as KpiFormValues['categoryId'] })}
          className={inputClass}
        >
          {KPI_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Objectif"
          value={form.objective}
          onChange={(e) => onChange({ ...form, objective: e.target.value })}
          className={inputClass}
        />
        <textarea
          placeholder="Méthode de mesure"
          value={form.measurementMethod}
          onChange={(e) => onChange({ ...form, measurementMethod: e.target.value })}
          className={inputClass}
          rows={2}
        />
        <input
          placeholder="Seuil cible (ex. ≥ 90 %)"
          value={form.targetThreshold}
          onChange={(e) => onChange({ ...form, targetThreshold: e.target.value })}
          className={inputClass}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="Valeur actuelle"
            value={form.currentValue}
            onChange={(e) => onChange({ ...form, currentValue: Number(e.target.value) })}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Valeur précédente"
            value={form.previousValue}
            onChange={(e) => onChange({ ...form, previousValue: Number(e.target.value) })}
            className={inputClass}
          />
          <input
            placeholder="Unité"
            value={form.unit}
            onChange={(e) => onChange({ ...form, unit: e.target.value })}
            className={inputClass}
          />
        </div>
        <input
          placeholder="Responsable"
          value={form.responsible}
          onChange={(e) => onChange({ ...form, responsible: e.target.value })}
          className={inputClass}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={form.status}
            onChange={(e) => onChange({ ...form, status: e.target.value as KpiFormValues['status'] })}
            className={inputClass}
          >
            <option value="good">Conforme</option>
            <option value="warning">Surveillance</option>
            <option value="critical">Action requise</option>
          </select>
          <select
            value={form.trend}
            onChange={(e) => onChange({ ...form, trend: e.target.value as KpiFormValues['trend'] })}
            className={inputClass}
          >
            <option value="up">Tendance hausse</option>
            <option value="down">Tendance baisse</option>
            <option value="stable">Stable</option>
          </select>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg text-stone-900 bg-white hover:bg-stone-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium"
          >
            {mode === 'create' ? 'Créer' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </ViewShell>
  );
}
