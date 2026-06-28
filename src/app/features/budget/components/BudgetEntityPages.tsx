import { Edit, Trash2 } from 'lucide-react';
import {
  BudgetDetailField,
  BudgetDetailGrid,
  BudgetFormSection,
  BudgetHighlightBox,
  BudgetPageChrome,
  budgetInputClass,
  budgetLabelClass,
} from './BudgetPageChrome';
import {
  BudgetFormActions,
  BudgetPageAction,
  BudgetPageActions,
  BudgetBadge,
  BudgetTag,
  BudgetTagList,
} from './BudgetUIKit';
import type { BOMComponent, FundingSource, Quote, QuoteStatus, Supplier, SupplierType } from '../../../types/budget';
import {
  getFundingStatusColor,
  getFundingStatusLabel,
  getQuoteStatusLabel,
  getSupplierTypeLabel,
} from '../../../types/budget';
import {
  BudgetDocumentsEditor,
  BudgetDocumentsList,
  BudgetLinksEditor,
  BudgetLinksList,
} from './BudgetAttachments';

const inputClass = budgetInputClass;
const labelClass = budgetLabelClass;

// ——— Quote ———

export type QuoteFormValues = Omit<Quote, 'id' | 'createdAt' | 'createdBy'> & { id?: string };

export const emptyQuoteForm = (suppliers: Supplier[]): QuoteFormValues => ({
  reference: '',
  supplierId: suppliers[0]?.id ?? '',
  supplierName: suppliers[0]?.name ?? '',
  componentIds: [],
  amountTTC: 0,
  amountHT: undefined,
  deliveryDelay: '',
  conditions: '',
  status: 'pending',
  receivedAt: new Date().toISOString().slice(0, 10),
  notes: '',
  links: [],
  documents: [],
});

export function QuoteFormPage({
  mode,
  form,
  suppliers,
  components,
  onChange,
  onSubmit,
  onBack,
}: {
  mode: 'create' | 'edit';
  form: QuoteFormValues;
  suppliers: Supplier[];
  components: BOMComponent[];
  onChange: (f: QuoteFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  const pickSupplier = (id: string) => {
    const s = suppliers.find((x) => x.id === id);
    onChange({ ...form, supplierId: id, supplierName: s?.name ?? '' });
  };

  return (
    <BudgetPageChrome
      crumbs={[
        { label: 'Budget', onClick: onBack },
        { label: 'Devis', onClick: onBack },
        { label: mode === 'create' ? 'Nouveau' : 'Modification' },
      ]}
      title={mode === 'create' ? 'Nouveau devis' : 'Modifier le devis'}
      subtitle="Montants, fournisseur et pièces jointes"
      accent="quote"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <BudgetFormSection title="Informations générales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Référence *</label>
              <input required value={form.reference} onChange={(e) => onChange({ ...form, reference: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Statut</label>
              <select value={form.status} onChange={(e) => onChange({ ...form, status: e.target.value as QuoteStatus })} className={inputClass}>
                <option value="pending">En attente</option>
                <option value="received">Reçu</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Refusé</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Fournisseur *</label>
            <select required value={form.supplierId} onChange={(e) => pickSupplier(e.target.value)} className={inputClass}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </BudgetFormSection>

        <BudgetFormSection title="Montants & composants">
          <div>
            <label className={labelClass}>Composants concernés</label>
            <select
              multiple
              value={form.componentIds}
              onChange={(e) =>
                onChange({ ...form, componentIds: [...e.target.selectedOptions].map((o) => o.value) })
              }
              className={`${inputClass} min-h-[100px]`}
            >
              {components.map((c) => (
                <option key={c.id} value={c.id}>{c.functionalName || c.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs</p>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Montant TTC (€) *</label>
              <input type="number" min={0} step={0.01} required value={form.amountTTC} onChange={(e) => onChange({ ...form, amountTTC: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Montant HT (€)</label>
              <input type="number" min={0} step={0.01} value={form.amountHT ?? ''} onChange={(e) => onChange({ ...form, amountHT: e.target.value ? Number(e.target.value) : undefined })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Reçu le</label>
              <input type="date" value={form.receivedAt.slice(0, 10)} onChange={(e) => onChange({ ...form, receivedAt: e.target.value })} className={inputClass} />
            </div>
          </div>
        </BudgetFormSection>

        <BudgetFormSection title="Conditions & pièces jointes">
        <div>
          <label className={labelClass}>Délai de livraison</label>
          <input value={form.deliveryDelay} onChange={(e) => onChange({ ...form, deliveryDelay: e.target.value })} className={inputClass} placeholder="2 semaines" />
        </div>
        <div>
          <label className={labelClass}>Conditions</label>
          <textarea rows={2} value={form.conditions} onChange={(e) => onChange({ ...form, conditions: e.target.value })} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea rows={2} value={form.notes ?? ''} onChange={(e) => onChange({ ...form, notes: e.target.value })} className={`${inputClass} resize-none`} />
        </div>
        <BudgetLinksEditor links={form.links ?? []} onChange={(links) => onChange({ ...form, links })} />
        <BudgetDocumentsEditor documents={form.documents ?? []} onChange={(documents) => onChange({ ...form, documents })} />
        </BudgetFormSection>

        <BudgetFormActions
          onCancel={onBack}
          submitLabel={mode === 'create' ? 'Créer le devis' : 'Enregistrer'}
        />
      </form>
    </BudgetPageChrome>
  );
}

export function QuoteDetailPage({
  quote,
  components,
  onBack,
  onEdit,
  onDelete,
  onAccept,
  onReject,
}: {
  quote: Quote;
  components: BOMComponent[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const linked = components.filter((c) => quote.componentIds.includes(c.id));
  const quoteBadgeClass: Record<Quote['status'], string> = {
    accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    rejected: 'bg-red-50 text-red-700 border border-red-100',
    received: 'bg-violet-50 text-violet-700 border border-violet-100',
    pending: 'bg-slate-50 text-slate-600 border border-slate-200',
  };

  return (
    <BudgetPageChrome
      crumbs={[
        { label: 'Budget', onClick: onBack },
        { label: 'Devis', onClick: onBack },
        { label: quote.reference },
      ]}
      title={quote.reference}
      subtitle={quote.supplierName}
      accent="quote"
      badge={<BudgetBadge className={quoteBadgeClass[quote.status]}>{getQuoteStatusLabel(quote.status)}</BudgetBadge>}
      actions={
        <BudgetPageActions>
          <BudgetPageAction onClick={onEdit}><Edit className="w-3.5 h-3.5" aria-hidden /> Modifier</BudgetPageAction>
          <BudgetPageAction onClick={onDelete} variant="danger"><Trash2 className="w-3.5 h-3.5" aria-hidden /> Supprimer</BudgetPageAction>
        </BudgetPageActions>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BudgetHighlightBox label="Montant TTC" value={`${quote.amountTTC.toFixed(2)} €`} />
        {quote.amountHT != null && (
          <BudgetHighlightBox label="Montant HT" value={`${quote.amountHT.toFixed(2)} €`} />
        )}
      </div>

      <BudgetFormSection title="Détails du devis">
        <BudgetDetailGrid>
          <BudgetDetailField label="Délai de livraison">{quote.deliveryDelay || '—'}</BudgetDetailField>
          <BudgetDetailField label="Reçu le">{new Date(quote.receivedAt).toLocaleDateString('fr-FR')}</BudgetDetailField>
          {quote.conditions && (
            <div className="sm:col-span-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Conditions</dt>
              <dd className="text-sm text-slate-800 mt-1">{quote.conditions}</dd>
            </div>
          )}
        </BudgetDetailGrid>
      </BudgetFormSection>

      {linked.length > 0 && (
        <BudgetFormSection title={`Composants liés (${linked.length})`}>
          <BudgetTagList>
            {linked.map((c) => (
              <BudgetTag key={c.id}>{c.functionalName || c.name}</BudgetTag>
            ))}
          </BudgetTagList>
        </BudgetFormSection>
      )}

      {quote.notes && (
        <BudgetFormSection title="Notes">
          <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4 leading-relaxed">{quote.notes}</p>
        </BudgetFormSection>
      )}

      {(quote.links?.length ?? 0) > 0 && (
        <BudgetFormSection title="Liens">
          <BudgetLinksList links={quote.links} />
        </BudgetFormSection>
      )}

      {(quote.documents?.length ?? 0) > 0 && (
        <BudgetFormSection title="Documents">
          <BudgetDocumentsList documents={quote.documents} />
        </BudgetFormSection>
      )}

      {quote.status === 'received' && (
        <div className="budget-form-actions">
          <button type="button" onClick={onReject} className="budget-btn budget-btn--ghost budget-btn--block">Refuser</button>
          <button type="button" onClick={onAccept} className="budget-btn budget-btn--primary budget-btn--block">Accepter le devis</button>
        </div>
      )}
    </BudgetPageChrome>
  );
}

// ——— Supplier ———

export type SupplierFormValues = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export const emptySupplierForm = (): SupplierFormValues => ({
  name: '',
  type: 'retail',
  country: 'France',
  email: '',
  website: '',
  reliability: 3,
  averageDeliveryDays: 7,
  componentIds: [],
  quoteIds: [],
  isSoleSource: false,
  notes: '',
  links: [],
  documents: [],
});

export function SupplierFormPage({
  mode,
  form,
  components,
  onChange,
  onSubmit,
  onBack,
}: {
  mode: 'create' | 'edit';
  form: SupplierFormValues;
  components: BOMComponent[];
  onChange: (f: SupplierFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <BudgetPageChrome
      crumbs={[
        { label: 'Budget', onClick: onBack },
        { label: 'Fournisseurs', onClick: onBack },
        { label: mode === 'create' ? 'Nouveau' : 'Modification' },
      ]}
      title={mode === 'create' ? 'Nouveau fournisseur' : 'Modifier le fournisseur'}
      subtitle="Coordonnées, fiabilité et composants associés"
      accent="supplier"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <BudgetFormSection title="Identité">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Nom *</label><input required value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Type</label>
              <select value={form.type} onChange={(e) => onChange({ ...form, type: e.target.value as SupplierType })} className={inputClass}>
                <option value="retail">Retail</option>
                <option value="distributor">Distributeur</option>
                <option value="industrial">Industriel</option>
                <option value="prototype">Prototypage</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Pays</label><input value={form.country} onChange={(e) => onChange({ ...form, country: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Email</label><input type="email" value={form.email ?? ''} onChange={(e) => onChange({ ...form, email: e.target.value })} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Site web</label><input type="url" value={form.website ?? ''} onChange={(e) => onChange({ ...form, website: e.target.value })} className={inputClass} /></div>
        </BudgetFormSection>

        <BudgetFormSection title="Performance & composants">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Fiabilité (1-5)</label><input type="number" min={1} max={5} value={form.reliability} onChange={(e) => onChange({ ...form, reliability: Number(e.target.value) as Supplier['reliability'] })} className={inputClass} /></div>
            <div><label className={labelClass}>Délai moyen (jours)</label><input type="number" min={0} value={form.averageDeliveryDays ?? ''} onChange={(e) => onChange({ ...form, averageDeliveryDays: Number(e.target.value) })} className={inputClass} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.isSoleSource} onChange={(e) => onChange({ ...form, isSoleSource: e.target.checked })} />
            Fournisseur unique (sole source)
          </label>
          <div>
            <label className={labelClass}>Composants fournis</label>
            <select multiple value={form.componentIds} onChange={(e) => onChange({ ...form, componentIds: [...e.target.selectedOptions].map((o) => o.value) })} className={`${inputClass} min-h-[80px]`}>
              {components.map((c) => <option key={c.id} value={c.id}>{c.functionalName || c.name}</option>)}
            </select>
          </div>
        </BudgetFormSection>

        <BudgetFormSection title="Notes & pièces jointes">
          <div><label className={labelClass}>Notes</label><textarea rows={2} value={form.notes ?? ''} onChange={(e) => onChange({ ...form, notes: e.target.value })} className={`${inputClass} resize-none`} /></div>
          <BudgetLinksEditor links={form.links ?? []} onChange={(links) => onChange({ ...form, links })} />
          <BudgetDocumentsEditor documents={form.documents ?? []} onChange={(documents) => onChange({ ...form, documents })} />
        </BudgetFormSection>

        <BudgetFormActions
          onCancel={onBack}
          submitLabel={mode === 'create' ? 'Créer le fournisseur' : 'Enregistrer'}
        />
      </form>
    </BudgetPageChrome>
  );
}

export function SupplierDetailPage({
  supplier,
  components,
  onBack,
  onEdit,
  onDelete,
}: {
  supplier: Supplier;
  components: BOMComponent[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const linked = components.filter((c) => supplier.componentIds.includes(c.id));
  return (
    <BudgetPageChrome
      crumbs={[
        { label: 'Budget', onClick: onBack },
        { label: 'Fournisseurs', onClick: onBack },
        { label: supplier.name },
      ]}
      title={supplier.name}
      subtitle={`${getSupplierTypeLabel(supplier.type)} · ${supplier.country}`}
      accent="supplier"
      badge={
        supplier.isSoleSource ? (
          <BudgetBadge className="bg-red-50 text-red-700 border border-red-100">Fournisseur unique</BudgetBadge>
        ) : undefined
      }
      actions={
        <BudgetPageActions>
          <BudgetPageAction onClick={onEdit}><Edit className="w-3.5 h-3.5" aria-hidden /> Modifier</BudgetPageAction>
          <BudgetPageAction onClick={onDelete} variant="danger"><Trash2 className="w-3.5 h-3.5" aria-hidden /> Supprimer</BudgetPageAction>
        </BudgetPageActions>
      }
    >
      <BudgetFormSection title="Informations">
        <BudgetDetailGrid>
          <BudgetDetailField label="Fiabilité">{supplier.reliability}/5</BudgetDetailField>
          <BudgetDetailField label="Délai moyen">{supplier.averageDeliveryDays ?? '—'} jours</BudgetDetailField>
          {supplier.email && (
            <BudgetDetailField label="Email">
              <a href={`mailto:${supplier.email}`} className="text-emerald-700 hover:underline">{supplier.email}</a>
            </BudgetDetailField>
          )}
          {supplier.website && (
            <BudgetDetailField label="Site web">
              <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline break-all">{supplier.website}</a>
            </BudgetDetailField>
          )}
        </BudgetDetailGrid>
      </BudgetFormSection>

      {linked.length > 0 && (
        <BudgetFormSection title={`Composants fournis (${linked.length})`}>
          <BudgetTagList>
            {linked.map((c) => (
              <BudgetTag key={c.id}>{c.functionalName || c.name}</BudgetTag>
            ))}
          </BudgetTagList>
        </BudgetFormSection>
      )}

      {supplier.notes && (
        <BudgetFormSection title="Notes">
          <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4 leading-relaxed">{supplier.notes}</p>
        </BudgetFormSection>
      )}

      {(supplier.links?.length ?? 0) > 0 && (
        <BudgetFormSection title="Liens"><BudgetLinksList links={supplier.links} /></BudgetFormSection>
      )}
      {(supplier.documents?.length ?? 0) > 0 && (
        <BudgetFormSection title="Documents"><BudgetDocumentsList documents={supplier.documents} /></BudgetFormSection>
      )}
    </BudgetPageChrome>
  );
}

// ——— Funding ———

export type FundingFormValues = Omit<FundingSource, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export const emptyFundingForm = (): FundingFormValues => ({
  title: '',
  description: '',
  amountLabel: '',
  status: 'explore',
  links: [],
  documents: [],
  notes: '',
});

export function FundingFormPage({
  mode,
  form,
  onChange,
  onSubmit,
  onBack,
}: {
  mode: 'create' | 'edit';
  form: FundingFormValues;
  onChange: (f: FundingFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <BudgetPageChrome
      crumbs={[
        { label: 'Budget', onClick: onBack },
        { label: 'Financement', onClick: onBack },
        { label: mode === 'create' ? 'Nouveau' : 'Modification' },
      ]}
      title={mode === 'create' ? 'Nouvelle source de financement' : 'Modifier la source'}
      subtitle="Subventions, aides et opportunités de financement"
      accent="funding"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <BudgetFormSection title="Présentation">
          <div><label className={labelClass}>Titre *</label><input required value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Description</label><textarea rows={2} value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} /></div>
        </BudgetFormSection>

        <BudgetFormSection title="Montant & statut">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Montant (libellé)</label><input value={form.amountLabel} onChange={(e) => onChange({ ...form, amountLabel: e.target.value })} className={inputClass} placeholder="1 000 € – 5 000 €" /></div>
            <div>
              <label className={labelClass}>Statut</label>
              <select value={form.status} onChange={(e) => onChange({ ...form, status: e.target.value as FundingSource['status'] })} className={inputClass}>
                <option value="explore">À explorer</option>
                <option value="in-progress">En cours</option>
                <option value="won">Obtenu</option>
                <option value="lost">Refusé</option>
                <option value="later">Phase ultérieure</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Date limite</label><input type="date" value={form.deadline?.slice(0, 10) ?? ''} onChange={(e) => onChange({ ...form, deadline: e.target.value || undefined })} className={inputClass} /></div>
            <div><label className={labelClass}>Taux de succès</label><input value={form.successRate ?? ''} onChange={(e) => onChange({ ...form, successRate: e.target.value })} className={inputClass} /></div>
          </div>
        </BudgetFormSection>

        <BudgetFormSection title="Notes & pièces jointes">
          <div><label className={labelClass}>Notes</label><textarea rows={2} value={form.notes ?? ''} onChange={(e) => onChange({ ...form, notes: e.target.value })} className={`${inputClass} resize-none`} /></div>
          <BudgetLinksEditor links={form.links ?? []} onChange={(links) => onChange({ ...form, links })} />
          <BudgetDocumentsEditor documents={form.documents ?? []} onChange={(documents) => onChange({ ...form, documents })} />
        </BudgetFormSection>

        <BudgetFormActions
          onCancel={onBack}
          submitLabel={mode === 'create' ? 'Créer la source' : 'Enregistrer'}
        />
      </form>
    </BudgetPageChrome>
  );
}

export function FundingDetailPage({
  source,
  onBack,
  onEdit,
  onDelete,
}: {
  source: FundingSource;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <BudgetPageChrome
      crumbs={[
        { label: 'Budget', onClick: onBack },
        { label: 'Financement', onClick: onBack },
        { label: source.title },
      ]}
      title={source.title}
      subtitle={source.amountLabel}
      accent="funding"
      badge={
        <BudgetBadge className={getFundingStatusColor(source.status)}>
          {getFundingStatusLabel(source.status)}
        </BudgetBadge>
      }
      actions={
        <BudgetPageActions>
          <BudgetPageAction onClick={onEdit}><Edit className="w-3.5 h-3.5" aria-hidden /> Modifier</BudgetPageAction>
          <BudgetPageAction onClick={onDelete} variant="danger"><Trash2 className="w-3.5 h-3.5" aria-hidden /> Supprimer</BudgetPageAction>
        </BudgetPageActions>
      }
    >
      {source.description && (
        <BudgetFormSection title="Description">
          <p className="text-sm text-slate-700 leading-relaxed">{source.description}</p>
        </BudgetFormSection>
      )}

      <BudgetFormSection title="Détails">
        <BudgetDetailGrid>
          <BudgetDetailField label="Montant">{source.amountLabel || '—'}</BudgetDetailField>
          {source.deadline && (
            <BudgetDetailField label="Échéance">{new Date(source.deadline).toLocaleDateString('fr-FR')}</BudgetDetailField>
          )}
          {source.successRate && (
            <BudgetDetailField label="Succès estimé">{source.successRate}</BudgetDetailField>
          )}
        </BudgetDetailGrid>
      </BudgetFormSection>

      {source.notes && (
        <BudgetFormSection title="Notes">
          <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4 leading-relaxed">{source.notes}</p>
        </BudgetFormSection>
      )}

      {(source.links?.length ?? 0) > 0 && (
        <BudgetFormSection title="Liens"><BudgetLinksList links={source.links} /></BudgetFormSection>
      )}
      {(source.documents?.length ?? 0) > 0 && (
        <BudgetFormSection title="Documents"><BudgetDocumentsList documents={source.documents} /></BudgetFormSection>
      )}
    </BudgetPageChrome>
  );
}
