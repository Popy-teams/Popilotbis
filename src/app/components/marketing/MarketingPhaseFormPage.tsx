import { ListChecks, Map, Target } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton } from '../shared';
import type { RoadmapPhaseFormValues } from '../../types/marketing';
import { inputClass, labelClass, sectionClass } from './marketingPresentation';

interface MarketingPhaseFormPageProps {
  phaseYear: string;
  values: RoadmapPhaseFormValues;
  onChange: (values: RoadmapPhaseFormValues) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function MarketingPhaseFormPage({
  phaseYear,
  values,
  onChange,
  onBack,
  onSubmit,
}: MarketingPhaseFormPageProps) {
  const patch = (partial: Partial<RoadmapPhaseFormValues>) => onChange({ ...values, ...partial });

  return (
    <ViewShell>
      <PageBackHeader
        title={`Modifier ${phaseYear}`}
        subtitle="Roadmap 5 ans — objectifs, marketing et indicateurs"
        onBack={onBack}
      />

      <form onSubmit={onSubmit} className="space-y-5">
        <section className={sectionClass}>
          <SectionHead icon={Map} title="Identité de la phase" subtitle="Libellés et indicateurs économiques" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="phase-year">
                Libellé année *
              </label>
              <input
                id="phase-year"
                required
                value={values.year}
                onChange={(e) => patch({ year: e.target.value })}
                className={inputClass}
                placeholder="Année 1"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="phase-label">
                Nom de l&apos;étape *
              </label>
              <input
                id="phase-label"
                required
                value={values.label}
                onChange={(e) => patch({ label: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="phase-volume">
                Volume *
              </label>
              <input
                id="phase-volume"
                required
                value={values.volume}
                onChange={(e) => patch({ volume: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="phase-cost">
                Coût unitaire *
              </label>
              <input
                id="phase-cost"
                required
                value={values.unitCost}
                onChange={(e) => patch({ unitCost: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="phase-price">
                Prix de vente
              </label>
              <input
                id="phase-price"
                value={values.sellingPrice}
                onChange={(e) => patch({ sellingPrice: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="phase-margin">
                Marge brute
              </label>
              <input
                id="phase-margin"
                value={values.margin}
                onChange={(e) => patch({ margin: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHead icon={Target} title="Objectifs stratégiques" subtitle="Une ligne par objectif" />
          <textarea
            required
            rows={4}
            value={values.objectives}
            onChange={(e) => patch({ objectives: e.target.value })}
            className={inputClass}
          />
        </section>

        <section className={sectionClass}>
          <SectionHead icon={ListChecks} title="Actions marketing" subtitle="Une ligne par action prévue" />
          <textarea
            required
            rows={5}
            value={values.marketing}
            onChange={(e) => patch({ marketing: e.target.value })}
            className={inputClass}
          />
        </section>

        <section className={sectionClass}>
          <SectionHead icon={Target} title="Risques identifiés" subtitle="Une ligne par risque" />
          <textarea
            rows={3}
            value={values.risks}
            onChange={(e) => patch({ risks: e.target.value })}
            className={inputClass}
          />
        </section>

        <section className={sectionClass}>
          <label className={labelClass} htmlFor="phase-tasks">
            Tâches liées (optionnel)
          </label>
          <textarea
            id="phase-tasks"
            rows={2}
            value={values.linkedTasks}
            onChange={(e) => patch({ linkedTasks: e.target.value })}
            className={inputClass}
          />
        </section>

        <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-3 sm:justify-end">
          <ActionButton type="button" variant="secondary" onClick={onBack} className="w-full sm:w-auto justify-center">
            Annuler
          </ActionButton>
          <ActionButton type="submit" className="w-full sm:w-auto justify-center">
            Enregistrer la phase
          </ActionButton>
        </div>
      </form>
    </ViewShell>
  );
}

function SectionHead({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-1">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="font-semibold text-stone-900">{title}</h2>
        <p className="text-sm text-stone-500">{subtitle}</p>
      </div>
    </div>
  );
}
