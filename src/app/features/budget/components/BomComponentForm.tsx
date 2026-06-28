import {
  BudgetFormSection,
  BudgetHighlightBox,
  BudgetPageChrome,
  budgetInputClass,
  budgetLabelClass,
} from './BudgetPageChrome';
import type { BOMCategoryDefinition } from '../../../utils/budgetCategoryStore';
import { getCategoryLabel } from '../../../utils/budgetCategoryStore';
import type { BOMComponent, ComponentStatus } from '../../../types/budget';
import { getComponentStatusColor, getComponentStatusLabel } from '../../../types/budget';
import { BudgetBadge, BudgetFormActions } from './BudgetUIKit';

export type BomFormValues = {
  category: string;
  name: string;
  functionalName: string;
  example: string;
  quantity: number;
  unitPriceEstimated: number;
  status: ComponentStatus;
  priceSource: string;
  criticality: BOMComponent['criticality'];
  supplierName: string;
  notes: string;
};

export const emptyBomForm = (): BomFormValues => ({
  category: 'brain-ai',
  name: '',
  functionalName: '',
  example: '',
  quantity: 1,
  unitPriceEstimated: 0,
  status: 'to-quote',
  priceSource: '',
  criticality: 'medium',
  supplierName: '',
  notes: '',
});

interface BomComponentFormProps {
  mode: 'create' | 'edit';
  form: BomFormValues;
  categories: BOMCategoryDefinition[];
  onChange: (form: BomFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function BomComponentForm({
  mode,
  form,
  categories,
  onChange,
  onSubmit,
  onBack,
}: BomComponentFormProps) {
  const totalPreview = form.quantity * form.unitPriceEstimated;

  return (
    <BudgetPageChrome
      crumbs={[
        { label: 'Budget', onClick: onBack },
        { label: 'BOM', onClick: onBack },
        { label: mode === 'create' ? 'Nouveau composant' : 'Modification' },
      ]}
      title={mode === 'create' ? 'Nouveau composant BOM' : 'Modifier le composant'}
      subtitle={getCategoryLabel(form.category, categories)}
      accent="bom"
      badge={
        <BudgetBadge className={getComponentStatusColor(form.status)}>
          {getComponentStatusLabel(form.status)}
        </BudgetBadge>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <BudgetFormSection title="Identification" description="Nom, catégorie et référence produit">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={budgetLabelClass}>Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => onChange({ ...form, category: e.target.value })}
                className={budgetInputClass}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={budgetLabelClass}>Statut</label>
              <select
                value={form.status}
                onChange={(e) => onChange({ ...form, status: e.target.value as ComponentStatus })}
                className={budgetInputClass}
              >
                <option value="to-quote">À chiffrer</option>
                <option value="quote-requested">Devis demandé</option>
                <option value="quote-received">Devis reçu</option>
                <option value="validated">Validé</option>
                <option value="ordered">Commandé</option>
                <option value="received">Reçu</option>
              </select>
            </div>
          </div>

          <div>
            <label className={budgetLabelClass}>Nom technique *</label>
            <input
              required
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className={budgetInputClass}
              placeholder="Microcontrôleur principal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={budgetLabelClass}>Nom fonctionnel</label>
              <input
                value={form.functionalName}
                onChange={(e) => onChange({ ...form, functionalName: e.target.value })}
                className={budgetInputClass}
                placeholder="Cerveau central"
              />
            </div>
            <div>
              <label className={budgetLabelClass}>Référence / exemple</label>
              <input
                value={form.example}
                onChange={(e) => onChange({ ...form, example: e.target.value })}
                className={budgetInputClass}
                placeholder="Raspberry Pi 5 8GB"
              />
            </div>
          </div>
        </BudgetFormSection>

        <BudgetFormSection title="Coûts & quantité" description="Estimation budgétaire du composant">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={budgetLabelClass}>Quantité</label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => onChange({ ...form, quantity: Number(e.target.value) })}
                className={budgetInputClass}
              />
            </div>
            <div>
              <label className={budgetLabelClass}>Prix unit. estimé (€)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.unitPriceEstimated}
                onChange={(e) => onChange({ ...form, unitPriceEstimated: Number(e.target.value) })}
                className={budgetInputClass}
              />
            </div>
            <BudgetHighlightBox label="Total estimé" value={`${totalPreview.toFixed(2)} €`} />
          </div>

          <div>
            <label className={budgetLabelClass}>Source du prix</label>
            <input
              value={form.priceSource}
              onChange={(e) => onChange({ ...form, priceSource: e.target.value })}
              className={budgetInputClass}
              placeholder="URL boutique, référence devis…"
            />
          </div>
        </BudgetFormSection>

        <BudgetFormSection title="Approvisionnement" description="Fournisseur et niveau de criticité">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={budgetLabelClass}>Fournisseur</label>
              <input
                value={form.supplierName}
                onChange={(e) => onChange({ ...form, supplierName: e.target.value })}
                className={budgetInputClass}
                placeholder="Nom du fournisseur"
              />
            </div>
            <div>
              <label className={budgetLabelClass}>Criticité</label>
              <select
                value={form.criticality}
                onChange={(e) =>
                  onChange({ ...form, criticality: e.target.value as BOMComponent['criticality'] })
                }
                className={budgetInputClass}
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="critical">Critique</option>
              </select>
            </div>
          </div>

          <div>
            <label className={budgetLabelClass}>Notes internes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
              className={`${budgetInputClass} resize-y min-h-[80px]`}
              placeholder="Contraintes, alternatives, remarques…"
            />
          </div>
        </BudgetFormSection>

        <BudgetFormActions
          onCancel={onBack}
          submitLabel={mode === 'create' ? 'Ajouter au BOM' : 'Enregistrer les modifications'}
        />
      </form>
    </BudgetPageChrome>
  );
}
