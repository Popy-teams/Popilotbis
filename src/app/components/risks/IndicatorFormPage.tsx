import { Activity, Pencil, Save } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import { type RiskIndicatorConfig, inputClass, labelClass, sectionClass } from './riskPresentation';

interface IndicatorFormPageProps {
  mode: 'view' | 'edit';
  indicator: RiskIndicatorConfig;
  currentValue: number;
  relatedCount: number;
  onChange: (indicator: RiskIndicatorConfig) => void;
  onBack: () => void;
  onSave: () => void;
  onEdit?: () => void;
  onCreateRisk: () => void;
}

export function IndicatorFormPage({
  mode,
  indicator,
  currentValue,
  relatedCount,
  onChange,
  onBack,
  onSave,
  onEdit,
  onCreateRisk,
}: IndicatorFormPageProps) {
  const onTarget =
    indicator.direction === 'higher-is-better'
      ? currentValue >= indicator.target
      : currentValue <= indicator.target;

  return (
    <ViewShell>
      <PageBackHeader
        title={indicator.label}
        subtitle={mode === 'edit' ? 'Modifier la cible de pilotage' : 'Consultation indicateur ISO §9'}
        onBack={onBack}
        actions={
          mode === 'view' ? (
            <div className="flex flex-wrap gap-2">
              {onEdit ? (
                <ActionButton variant="secondary" icon={Pencil} onClick={onEdit}>
                  Modifier
                </ActionButton>
              ) : null}
              <ActionButton icon={Activity} onClick={onCreateRisk}>
                Nouveau risque
              </ActionButton>
            </div>
          ) : (
            <ActionButton icon={Save} onClick={onSave}>
              Enregistrer
            </ActionButton>
          )
        }
      />

      <div className="space-y-5">
        <section className={`${sectionClass} ${onTarget ? 'border-emerald-200/80' : 'border-amber-200/80'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-500 font-medium">Valeur actuelle</p>
              <p className="text-4xl font-bold text-stone-900 mt-1">
                {currentValue}
                {indicator.unit === '%' ? '%' : indicator.unit === 'days' ? ' jours' : ''}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                onTarget ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
              }`}
            >
              {onTarget ? 'Dans la cible' : 'Hors cible'}
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-3">{indicator.description}</p>
          <p className="text-xs text-stone-500 mt-2">{relatedCount} élément(s) concerné(s) dans le registre</p>
        </section>

        {mode === 'edit' ? (
          <section className={sectionClass}>
            <h2 className="font-semibold text-stone-900 mb-4">Paramètres de l&apos;indicateur</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Libellé</label>
                <input
                  value={indicator.label}
                  onChange={(e) => onChange({ ...indicator, label: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  value={indicator.description}
                  onChange={(e) => onChange({ ...indicator, description: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Cible</label>
                <input
                  type="number"
                  min={0}
                  value={indicator.target}
                  onChange={(e) => onChange({ ...indicator, target: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Unité</label>
                <select
                  value={indicator.unit}
                  onChange={(e) => onChange({ ...indicator, unit: e.target.value as RiskIndicatorConfig['unit'] })}
                  className={inputClass}
                >
                  <option value="%">Pourcentage (%)</option>
                  <option value="count">Nombre</option>
                  <option value="days">Jours</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Sens de la cible</label>
                <select
                  value={indicator.direction}
                  onChange={(e) =>
                    onChange({ ...indicator, direction: e.target.value as RiskIndicatorConfig['direction'] })
                  }
                  className={inputClass}
                >
                  <option value="higher-is-better">Plus haut = mieux</option>
                  <option value="lower-is-better">Plus bas = mieux</option>
                </select>
              </div>
            </div>
          </section>
        ) : (
          <section className={sectionClass}>
            <h2 className="font-semibold text-stone-900 mb-3">Cible de pilotage</h2>
            <p className="text-2xl font-bold text-stone-900">
              {indicator.target}
              {indicator.unit === '%' ? '%' : indicator.unit === 'days' ? ' jours' : ''}
            </p>
            <p className="text-sm text-stone-500 mt-1">
              {indicator.direction === 'higher-is-better' ? 'Objectif minimum à atteindre' : 'Objectif maximum à ne pas dépasser'}
            </p>
          </section>
        )}
      </div>
    </ViewShell>
  );
}
