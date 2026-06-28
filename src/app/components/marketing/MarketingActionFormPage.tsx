import { Megaphone, Target } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton, FormSelect } from '../shared';
import type { MarketingActionFormValues, RoadmapPhase } from '../../types/marketing';
import {
  inputClass,
  labelClass,
  MARKETING_CHANNELS_SUGGESTIONS,
  sectionClass,
} from './marketingPresentation';

interface MarketingActionFormPageProps {
  mode: 'create' | 'edit';
  values: MarketingActionFormValues;
  phases: RoadmapPhase[];
  onChange: (values: MarketingActionFormValues) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function MarketingActionFormPage({
  mode,
  values,
  phases,
  onChange,
  onBack,
  onSubmit,
}: MarketingActionFormPageProps) {
  const patch = (partial: Partial<MarketingActionFormValues>) => onChange({ ...values, ...partial });

  return (
    <ViewShell>
      <PageBackHeader
        title={mode === 'create' ? 'Nouvelle action marketing' : 'Modifier l\'action'}
        subtitle="Plan d'actions aligné sur la roadmap 5 ans"
        onBack={onBack}
      />

      <form onSubmit={onSubmit} className="space-y-5">
        <section className={sectionClass}>
          <SectionHead icon={Megaphone} title="Action" subtitle="Canal, phase et statut" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className={labelClass} htmlFor="ma-title">
                Titre *
              </label>
              <input
                id="ma-title"
                required
                value={values.title}
                onChange={(e) => patch({ title: e.target.value })}
                className={inputClass}
                placeholder="Ex. Storytelling R&D authentique"
              />
            </div>
            <div>
              <label className={labelClass}>Phase roadmap</label>
              <FormSelect value={values.phase} onChange={(e) => patch({ phase: e.target.value as MarketingActionFormValues['phase'] })}>
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.year} — {p.label}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div>
              <label className={labelClass}>Statut</label>
              <FormSelect value={values.status} onChange={(e) => patch({ status: e.target.value as MarketingActionFormValues['status'] })}>
                <option value="planned">Planifiée</option>
                <option value="in-progress">En cours</option>
                <option value="done">Terminée</option>
              </FormSelect>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass} htmlFor="ma-channel">
                Canal *
              </label>
              <input
                id="ma-channel"
                required
                list="marketing-channels"
                value={values.channel}
                onChange={(e) => patch({ channel: e.target.value })}
                className={inputClass}
                placeholder="LinkedIn, Instagram, TikTok…"
              />
              <datalist id="marketing-channels">
                {MARKETING_CHANNELS_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass} htmlFor="ma-desc">
                Description *
              </label>
              <textarea
                id="ma-desc"
                required
                rows={4}
                value={values.description}
                onChange={(e) => patch({ description: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHead icon={Target} title="Alignement stratégique" subtitle="ISO §5.1 — orientation client et marché" />
          <p className="text-sm text-stone-600">
            Chaque action doit être rattachée à une phase de la roadmap et à un canal digital prioritaire pour garantir la cohérence
            entre R&D, industrialisation et communication.
          </p>
        </section>

        <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-3 sm:justify-end">
          <ActionButton type="button" variant="secondary" onClick={onBack} className="w-full sm:w-auto justify-center">
            Annuler
          </ActionButton>
          <ActionButton type="submit" className="w-full sm:w-auto justify-center">
            {mode === 'create' ? 'Créer l\'action' : 'Enregistrer'}
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
