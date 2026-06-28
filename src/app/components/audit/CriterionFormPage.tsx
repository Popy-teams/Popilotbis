import { ClipboardList, FileText, ListChecks, Shield } from 'lucide-react';
import { ViewShell, PageBackHeader, ActionButton, FormSelect } from '../shared';
import type { AuditBlockData } from '../../data/auditHelpers';
import type { CriterionFormValues } from '../../types/audit';
import type { ComplianceStatus } from '../../data/auditHelpers';
import { inputClass, labelClass, sectionClass } from './auditPresentation';

interface CriterionFormPageProps {
  mode: 'create' | 'edit';
  values: CriterionFormValues;
  blocks: AuditBlockData[];
  onChange: (values: CriterionFormValues) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CriterionFormPage({ mode, values, blocks, onChange, onBack, onSubmit }: CriterionFormPageProps) {
  const patch = (partial: Partial<CriterionFormValues>) => onChange({ ...values, ...partial });

  return (
    <ViewShell>
      <PageBackHeader
        title={mode === 'create' ? 'Nouveau critère ISO' : 'Modifier le critère'}
        subtitle="Évaluation, preuves, écarts et actions correctives"
        onBack={onBack}
      />

      <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
        <section className={sectionClass}>
          <SectionHead icon={Shield} title="Critère" subtitle="Bloc ISO et évaluation" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Bloc ISO</label>
              <FormSelect value={values.blockId} onChange={(e) => patch({ blockId: e.target.value as CriterionFormValues['blockId'] })}>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.isoRef})
                  </option>
                ))}
              </FormSelect>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Titre du critère *</label>
              <input required value={values.title} onChange={(e) => patch({ title: e.target.value })} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description *</label>
              <textarea required rows={3} value={values.description} onChange={(e) => patch({ description: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Statut</label>
              <FormSelect value={values.status} onChange={(e) => patch({ status: e.target.value as ComplianceStatus })}>
                <option value="compliant">Conforme</option>
                <option value="partial">Partiel</option>
                <option value="non-compliant">Non conforme</option>
                <option value="not-applicable">N/A</option>
              </FormSelect>
            </div>
            <div>
              <label className={labelClass}>Score (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={values.score}
                onChange={(e) => patch({ score: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Référence ISO</label>
              <input value={values.isoRef} onChange={(e) => patch({ isoRef: e.target.value })} className={inputClass} placeholder="§4.1" />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHead icon={ListChecks} title="Preuves & écarts" subtitle="Une ligne par élément" />
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Preuves de conformité</label>
              <textarea
                rows={4}
                value={values.evidence}
                onChange={(e) => patch({ evidence: e.target.value })}
                className={inputClass}
                placeholder="Document de stratégie validé&#10;CR de revue de direction"
              />
            </div>
            <div>
              <label className={labelClass}>Écarts identifiés</label>
              <textarea
                rows={3}
                value={values.gaps}
                onChange={(e) => patch({ gaps: e.target.value })}
                className={inputClass}
                placeholder="Cartographie parties prenantes incomplète"
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHead icon={ClipboardList} title="Suivi" subtitle="Actions et modules liés" />
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Actions planifiées (une par ligne)</label>
              <textarea
                rows={3}
                value={values.actions}
                onChange={(e) => patch({ actions: e.target.value })}
                className={inputClass}
                placeholder="task-stakeholder-mapping"
              />
            </div>
            <div>
              <label className={labelClass}>Modules liés (séparés par des virgules)</label>
              <input
                value={values.linkedModules}
                onChange={(e) => patch({ linkedModules: e.target.value })}
                className={inputClass}
                placeholder="marketing, documentation, risks"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <ActionButton type="button" variant="secondary" onClick={onBack} className="w-full sm:w-auto justify-center">
            Annuler
          </ActionButton>
          <ActionButton type="submit" className="w-full sm:w-auto justify-center !bg-indigo-600 hover:!bg-indigo-700 !text-white">
            {mode === 'create' ? 'Créer le critère' : 'Enregistrer'}
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="font-semibold text-stone-900">{title}</h2>
        <p className="text-sm text-stone-500">{subtitle}</p>
      </div>
    </div>
  );
}
