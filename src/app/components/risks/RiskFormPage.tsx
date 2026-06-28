import {
  AlertTriangle,
  ClipboardList,
  GitBranch,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';
import { calculateCriticality } from '../../types/risks';
import type { PipelineStage } from '../../types/planning';
import { ViewShell, PageBackHeader, ActionButton, AppIcon, FormSelect } from '../shared';
import {
  CATEGORY_CONFIG,
  IMPACT_AXES,
  type RiskFormValues,
  criticalityLabel,
  criticalityTone,
  inputClass,
  labelClass,
  sectionClass,
} from './riskPresentation';

interface RiskFormPageProps {
  mode: 'create' | 'edit';
  values: RiskFormValues;
  stages: PipelineStage[];
  onChange: (values: RiskFormValues) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function RiskFormPage({
  mode,
  values,
  stages,
  onChange,
  onBack,
  onSubmit,
}: RiskFormPageProps) {
  const patch = (partial: Partial<RiskFormValues>) => onChange({ ...values, ...partial });
  const { criticality, score } = calculateCriticality(values.probability, values.impacts);
  const CategoryIcon = CATEGORY_CONFIG.find((c) => c.id === values.category)?.icon ?? Shield;

  return (
    <ViewShell>
      <PageBackHeader
        title={mode === 'create' ? 'Nouveau risque / opportunité' : 'Modifier le risque'}
        subtitle="ISO 9001 §6.1 — identification, analyse et plan de traitement"
        onBack={onBack}
      />

      <form onSubmit={onSubmit} className="space-y-5">
        <section className={sectionClass}>
          <SectionHead icon={ClipboardList} title="Identification" subtitle="Nature et contexte du risque" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className={labelClass} htmlFor="risk-title">
                Titre *
              </label>
              <input
                id="risk-title"
                required
                value={values.title}
                onChange={(e) => patch({ title: e.target.value })}
                className={inputClass}
                placeholder="Ex. Retard approvisionnement composant critique"
              />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass} htmlFor="risk-desc">
                Description *
              </label>
              <textarea
                id="risk-desc"
                required
                rows={4}
                value={values.description}
                onChange={(e) => patch({ description: e.target.value })}
                className={inputClass}
                placeholder="Décrivez le contexte, les causes possibles et les conséquences attendues…"
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['risk', 'opportunity'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => patch({ type })}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      values.type === type
                        ? type === 'risk'
                          ? 'border-red-300 bg-red-50 text-red-800'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {type === 'risk' ? 'Risque' : 'Opportunité'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="risk-category">
                Catégorie
              </label>
              <FormSelect
                id="risk-category"
                value={values.category}
                onChange={(e) => patch({ category: e.target.value as RiskFormValues['category'] })}
                leadingIconElement={<CategoryIcon className="w-4 h-4" />}
              >
                {CATEGORY_CONFIG.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass} htmlFor="risk-tags">
                Tags (séparés par des virgules)
              </label>
              <input
                id="risk-tags"
                value={values.tags}
                onChange={(e) => patch({ tags: e.target.value })}
                className={inputClass}
                placeholder="hardware, conformité, critique"
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHead icon={Target} title="Analyse" subtitle="Probabilité, impacts et criticité calculée" />
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-500 font-medium">Score</p>
              <p className="text-3xl font-bold text-stone-900">{score}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${criticalityTone(criticality)}`}>
              {criticalityLabel(criticality)}
            </span>
            <p className="text-sm text-stone-600 flex-1 min-w-[12rem]">
              Criticité = probabilité × impact maximal ({values.probability} ×{' '}
              {Math.max(...Object.values(values.impacts))})
            </p>
          </div>

          <div>
            <label className={labelClass}>Probabilité ({values.probability}/5)</label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={values.probability}
              onChange={(e) => patch({ probability: Number(e.target.value) as RiskFormValues['probability'] })}
              className="w-full accent-red-600"
            />
            <div className="flex justify-between text-xs text-stone-500 mt-1">
              <span>Très faible</span>
              <span>Très élevée</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {IMPACT_AXES.map(({ key, label }) => (
              <div key={key}>
                <label className={labelClass}>
                  Impact {label} ({values.impacts[key]}/5)
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={values.impacts[key]}
                  onChange={(e) =>
                    patch({
                      impacts: {
                        ...values.impacts,
                        [key]: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                      },
                    })
                  }
                  className="w-full accent-orange-500"
                />
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHead icon={Shield} title="Traitement" subtitle="Stratégie, responsabilité et visibilité" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Stratégie ISO</label>
              <FormSelect value={values.strategy} onChange={(e) => patch({ strategy: e.target.value as RiskFormValues['strategy'] })}>
                <option value="avoid">Éviter</option>
                <option value="reduce">Réduire</option>
                <option value="transfer">Transférer</option>
                <option value="accept">Accepter</option>
              </FormSelect>
            </div>
            <div>
              <label className={labelClass}>Statut</label>
              <FormSelect value={values.status} onChange={(e) => patch({ status: e.target.value as RiskFormValues['status'] })}>
                <option value="open">Ouvert</option>
                <option value="in-treatment">En traitement</option>
                <option value="accepted">Accepté</option>
                <option value="closed">Fermé</option>
              </FormSelect>
            </div>
            <div>
              <label className={labelClass}>Origine</label>
              <FormSelect value={values.origin} onChange={(e) => patch({ origin: e.target.value as RiskFormValues['origin'] })}>
                <option value="review">Revue</option>
                <option value="meeting">Réunion</option>
                <option value="study">Étude</option>
                <option value="field-feedback">Retour terrain</option>
                <option value="audit">Audit</option>
                <option value="brainstorming">Brainstorming</option>
                <option value="auto-detection">Détection auto</option>
              </FormSelect>
            </div>
            <div>
              <label className={labelClass}>Visibilité</label>
              <FormSelect
                value={values.visibility}
                onChange={(e) => patch({ visibility: e.target.value as RiskFormValues['visibility'] })}
              >
                <option value="team">Équipe</option>
                <option value="management">Management</option>
                <option value="steering">Comité de pilotage</option>
              </FormSelect>
            </div>
            <div>
              <label className={labelClass} htmlFor="risk-owner">
                Propriétaire *
              </label>
              <input
                id="risk-owner"
                required
                value={values.ownerName}
                onChange={(e) => patch({ ownerName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Étape pipeline liée</label>
              <FormSelect value={values.stageId} onChange={(e) => patch({ stageId: e.target.value })}>
                <option value="">Aucune</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.order}. {stage.name}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHead icon={Sparkles} title="Première action" subtitle="Optionnel — plan de mitigation immédiat" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="action-title">
                Action préventive / corrective
              </label>
              <input
                id="action-title"
                value={values.actionTitle}
                onChange={(e) => patch({ actionTitle: e.target.value })}
                className={inputClass}
                placeholder="Ex. Identifier un fournisseur alternatif"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="action-due">
                Échéance
              </label>
              <input
                id="action-due"
                type="date"
                value={values.actionDueDate}
                onChange={(e) => patch({ actionDueDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <ActionButton type="button" variant="secondary" onClick={onBack} className="sm:flex-1 justify-center">
            Annuler
          </ActionButton>
          <ActionButton type="submit" icon={mode === 'create' ? AlertTriangle : GitBranch} className="sm:flex-1 justify-center">
            {mode === 'create' ? 'Enregistrer le risque' : 'Enregistrer les modifications'}
          </ActionButton>
        </div>
      </form>
    </ViewShell>
  );
}

function SectionHead({
  icon,
  title,
  subtitle,
}: {
  icon: typeof Shield;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-1 border-b border-stone-100">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
        <AppIcon icon={icon} size="sm" />
      </div>
      <div>
        <h2 className="font-semibold text-stone-900">{title}</h2>
        <p className="text-xs text-stone-500">{subtitle}</p>
      </div>
    </div>
  );
}
