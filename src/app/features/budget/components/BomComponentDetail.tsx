import { Edit, Trash2, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import {
  BudgetDetailField,
  BudgetDetailGrid,
  BudgetFormSection,
  BudgetHighlightBox,
  BudgetPageChrome,
} from './BudgetPageChrome';
import {
  BudgetBadge,
  BudgetPageAction,
  BudgetPageActions,
} from './BudgetUIKit';
import {
  getComponentStatusColor,
  getComponentStatusLabel,
  getCriticalityColor,
  type BOMComponent,
} from '../../../types/budget';
import { getCategoryLabel, type BOMCategoryDefinition } from '../../../utils/budgetCategoryStore';

interface BomComponentDetailProps {
  component: BOMComponent;
  categories: BOMCategoryDefinition[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function BomComponentDetail({
  component,
  categories,
  onBack,
  onEdit,
  onDelete,
}: BomComponentDetailProps) {
  const variance =
    component.totalActual != null ? component.totalActual - component.totalEstimated : null;

  return (
    <BudgetPageChrome
      crumbs={[
        { label: 'Budget', onClick: onBack },
        { label: 'BOM', onClick: onBack },
        { label: component.functionalName || component.name },
      ]}
      title={component.functionalName || component.name}
      subtitle={getCategoryLabel(component.category, categories)}
      accent="bom"
      badge={
        <BudgetBadge className={getComponentStatusColor(component.status)}>
          {getComponentStatusLabel(component.status)}
        </BudgetBadge>
      }
      actions={
        <BudgetPageActions>
          <BudgetPageAction onClick={onEdit}>
            <Edit className="w-3.5 h-3.5" aria-hidden /> Modifier
          </BudgetPageAction>
          <BudgetPageAction onClick={onDelete} variant="danger">
            <Trash2 className="w-3.5 h-3.5" aria-hidden /> Supprimer
          </BudgetPageAction>
        </BudgetPageActions>
      }
      maxWidth="xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <BudgetHighlightBox label="Coût estimé" value={`${component.totalEstimated.toFixed(2)} €`} />
        {component.totalActual != null && (
          <BudgetHighlightBox
            label="Coût réel"
            value={`${component.totalActual.toFixed(2)} €`}
            hint={
              variance != null
                ? `${variance > 0 ? '+' : ''}${variance.toFixed(2)} € vs estimé`
                : undefined
            }
          />
        )}
        <BudgetHighlightBox
          label="Quantité"
          value={`×${component.quantity}`}
          hint={`${component.unitPriceEstimated.toFixed(2)} € / unité`}
        />
      </div>

      <BudgetFormSection title="Fiche technique" description="Références et identification">
        <BudgetDetailGrid>
          <BudgetDetailField label="Nom technique">{component.name}</BudgetDetailField>
          <BudgetDetailField label="Référence / exemple">{component.example || '—'}</BudgetDetailField>
          <BudgetDetailField label="Fournisseur">{component.supplierName ?? '—'}</BudgetDetailField>
          <BudgetDetailField label="Source prix">{component.priceSource || '—'}</BudgetDetailField>
          <BudgetDetailField label="Criticité">
            <span className={`inline-flex items-center gap-1 capitalize ${getCriticalityColor(component.criticality)}`}>
              {component.criticality === 'critical' && <AlertTriangle className="w-3.5 h-3.5" aria-hidden />}
              {component.criticality === 'critical'
                ? 'Critique'
                : component.criticality === 'medium'
                  ? 'Moyenne'
                  : 'Faible'}
            </span>
          </BudgetDetailField>
          <BudgetDetailField label="Dernière mise à jour">
            {component.updatedAt
              ? new Date(component.updatedAt).toLocaleDateString('fr-FR')
              : '—'}
          </BudgetDetailField>
        </BudgetDetailGrid>
      </BudgetFormSection>

      {component.linkedTo && Object.keys(component.linkedTo).length > 0 && (
        <BudgetFormSection title="Liens projet">
          <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <LinkIcon className="w-4 h-4 shrink-0 text-slate-500" aria-hidden />
            Lié à des tâches ou risques du projet
          </div>
        </BudgetFormSection>
      )}

      {component.notes && (
        <BudgetFormSection title="Notes">
          <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4 leading-relaxed">
            {component.notes}
          </p>
        </BudgetFormSection>
      )}
    </BudgetPageChrome>
  );
}
