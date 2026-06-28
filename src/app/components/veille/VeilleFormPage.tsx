import { ClipboardList, Eye, Radar, Scale, Sparkles } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton, AppIcon, FormSelect } from '../shared';
import type { VeilleFormValues } from './veillePresentation';
import {
  VEILLE_TYPES,
  inputClass,
  labelClass,
  sectionClass,
} from './veillePresentation';

interface VeilleFormPageProps {
  mode: 'create' | 'edit';
  values: VeilleFormValues;
  onChange: (values: VeilleFormValues) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function VeilleFormPage({ mode, values, onChange, onBack, onSubmit }: VeilleFormPageProps) {
  const patch = (partial: Partial<VeilleFormValues>) => onChange({ ...values, ...partial });
  const selectedType = VEILLE_TYPES.find((t) => t.id === values.type)!;
  const TypeIcon = selectedType.icon;

  return (
    <ViewShell>
      <PageBackHeader
        title={mode === 'create' ? 'Nouvelle entrée de veille' : 'Modifier la veille'}
        subtitle="ISO §4.1 · §4.2 — identification, analyse d'impact et décision"
        onBack={onBack}
      />

      <form onSubmit={onSubmit} className="space-y-5">
        <section className={sectionClass}>
          <SectionHead icon={Radar} title="Signal détecté" subtitle="Source et nature de la veille" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className={labelClass}>Type de veille ISO</label>
              <FormSelect
                value={values.type}
                onChange={(e) => patch({ type: e.target.value as VeilleFormValues['type'] })}
                leadingIconElement={<TypeIcon className="w-4 h-4" />}
              >
                {VEILLE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} ({t.isoRef})
                  </option>
                ))}
              </FormSelect>
              <p className="text-xs text-stone-500 mt-1.5">{selectedType.description} · Fréquence {selectedType.frequency}</p>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass} htmlFor="veille-source">
                Source *
              </label>
              <input
                id="veille-source"
                required
                value={values.source}
                onChange={(e) => patch({ source: e.target.value })}
                className={inputClass}
                placeholder="Journal Officiel UE, retour client, IEEE…"
              />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass} htmlFor="veille-subject">
                Sujet *
              </label>
              <input
                id="veille-subject"
                required
                value={values.subject}
                onChange={(e) => patch({ subject: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass} htmlFor="veille-desc">
                Description *
              </label>
              <textarea
                id="veille-desc"
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
          <SectionHead icon={Scale} title="Analyse d'impact" subtitle="Conséquences sur le projet et décision" />
          <div>
            <label className={labelClass} htmlFor="veille-impact">
              Impact sur le projet
            </label>
            <textarea
              id="veille-impact"
              rows={4}
              value={values.impactAnalysis}
              onChange={(e) => patch({ impactAnalysis: e.target.value })}
              className={inputClass}
              placeholder="Opportunité, menace, changement réglementaire, coût…"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Priorité</label>
              <FormSelect value={values.priority} onChange={(e) => patch({ priority: e.target.value as VeilleFormValues['priority'] })}>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="critical">Critique</option>
              </FormSelect>
            </div>
            <div>
              <label className={labelClass}>Statut</label>
              <FormSelect value={values.status} onChange={(e) => patch({ status: e.target.value as VeilleFormValues['status'] })}>
                <option value="new">Nouveau</option>
                <option value="analyzing">En analyse</option>
                <option value="action-required">Action requise</option>
                <option value="monitoring">Suivi</option>
                <option value="closed">Clôturé</option>
              </FormSelect>
            </div>
            <div>
              <label className={labelClass}>Décision</label>
              <FormSelect value={values.decision} onChange={(e) => patch({ decision: e.target.value as VeilleFormValues['decision'] })}>
                <option value="pending">En attente</option>
                <option value="accepted">Acceptée</option>
                <option value="rejected">Rejetée</option>
                <option value="action-planned">Action planifiée</option>
              </FormSelect>
            </div>
            <div>
              <label className={labelClass} htmlFor="veille-responsible">
                Responsable
              </label>
              <input
                id="veille-responsible"
                value={values.responsible}
                onChange={(e) => patch({ responsible: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="veille-review">
                Prochaine revue
              </label>
              <input
                id="veille-review"
                type="date"
                value={values.nextReviewDate}
                onChange={(e) => patch({ nextReviewDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="veille-notes">
                Notes de décision
              </label>
              <textarea
                id="veille-notes"
                rows={2}
                value={values.decisionNotes}
                onChange={(e) => patch({ decisionNotes: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <ActionButton type="button" variant="secondary" onClick={onBack} className="sm:flex-1 justify-center">
            Annuler
          </ActionButton>
          <ActionButton type="submit" icon={mode === 'create' ? Eye : Sparkles} className="sm:flex-1 justify-center">
            {mode === 'create' ? 'Enregistrer la veille' : 'Enregistrer les modifications'}
          </ActionButton>
        </div>
      </form>
    </ViewShell>
  );
}

function SectionHead({ icon, title, subtitle }: { icon: typeof ClipboardList; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 pb-1 border-b border-stone-100">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
        <AppIcon icon={icon} size="sm" />
      </div>
      <div>
        <h2 className="font-semibold text-stone-900">{title}</h2>
        <p className="text-xs text-stone-500">{subtitle}</p>
      </div>
    </div>
  );
}
