import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Layers,
  Package,
  Plus,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { ViewSectionTitle, ViewStatCard, ViewStatsGrid } from '../../../components/shared';
import {
  getComponentStatusLabel,
  getFundingStatusColor,
  getFundingStatusLabel,
  getQuoteStatusLabel,
  getSupplierTypeLabel,
  type BOMComponent,
  type BudgetTracking,
  type FundingSource,
  type Quote,
  type Supplier,
} from '../../../types/budget';
import type { BOMCategoryDefinition } from '../../../utils/budgetCategoryStore';
import { BudgetPagination } from './BudgetPagination';
import { BudgetEmptyPanel, BudgetPipelineCard, BudgetRichCard } from './BudgetRichCard';
import { BudgetBadge, BudgetPanelToolbar, BudgetTag } from './BudgetUIKit';

const quoteBadgeClass: Record<Quote['status'], string> = {
  accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  rejected: 'bg-red-50 text-red-700 border border-red-100',
  received: 'bg-violet-50 text-violet-700 border border-violet-100',
  pending: 'bg-slate-50 text-slate-600 border border-slate-200',
};

function QuoteStatusBadge({ status }: { status: Quote['status'] }) {
  return <BudgetBadge className={quoteBadgeClass[status]}>{getQuoteStatusLabel(status)}</BudgetBadge>;
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Fiabilité ${value}/5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

export function BudgetQuotesPanel({
  quotes,
  components,
  page,
  pageSize,
  onPageChange,
  onCreate,
  onView,
}: {
  quotes: Quote[];
  components: BOMComponent[];
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onCreate: () => void;
  onView: (q: Quote) => void;
}) {
  const start = (page - 1) * pageSize;
  const pageQuotes = quotes.slice(start, start + pageSize);
  const totalAmount = quotes.reduce((s, q) => s + q.amountTTC, 0);
  const accepted = quotes.filter((q) => q.status === 'accepted').length;

  return (
    <div className="space-y-4">
      <BudgetPanelToolbar
        countLabel={`${quotes.length} devis enregistrés`}
        actionLabel="Nouveau devis"
        onAction={onCreate}
        icon={Plus}
      />

      <ViewStatsGrid cols={3}>
        <ViewStatCard label="Devis" value={String(quotes.length)} gradient="from-violet-500 to-purple-600" icon={FileText} />
        <ViewStatCard
          label="Montant total"
          value={`${totalAmount.toFixed(0)} €`}
          gradient="from-violet-500 to-indigo-600"
          icon={Wallet}
          hint="TTC cumulé"
        />
        <ViewStatCard label="Acceptés" value={String(accepted)} gradient="from-emerald-500 to-teal-500" icon={CheckCircle2} hint="Validés" />
      </ViewStatsGrid>

      {pageQuotes.length === 0 ? (
        <BudgetEmptyPanel title="Aucun devis" description="Centralisez vos chiffrages fournisseurs pour suivre le budget matériel." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {pageQuotes.map((quote) => {
            const linked = components.filter((c) => quote.componentIds.includes(c.id));
            const progressPct =
              quote.status === 'accepted' ? 100 : quote.status === 'received' ? 65 : quote.status === 'pending' ? 25 : 10;
            return (
              <BudgetRichCard
                key={quote.id}
                accent="quote"
                icon={FileText}
                title={quote.reference}
                subtitle={quote.supplierName}
                badge={<QuoteStatusBadge status={quote.status} />}
                highlight={`${quote.amountTTC.toFixed(2)} €`}
                stats={[
                  { label: 'Reçu', value: new Date(quote.receivedAt).toLocaleDateString('fr-FR'), icon: Calendar },
                  { label: 'Lignes', value: linked.length || '—', icon: Layers },
                  { label: 'Délai', value: quote.deliveryDelay || '—', icon: Clock },
                ]}
                progress={{ label: 'Avancement', pct: progressPct }}
                tags={
                  linked.length > 0
                    ? linked.slice(0, 4).map((c) => (
                        <BudgetTag key={c.id}>{c.functionalName || c.name}</BudgetTag>
                      ))
                    : undefined
                }
                footerLabel="Consulter le devis"
                onClick={() => onView(quote)}
              />
            );
          })}
        </div>
      )}
      <BudgetPagination page={page} total={quotes.length} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  );
}

export function BudgetSuppliersPanel({
  suppliers,
  components,
  page,
  pageSize,
  onPageChange,
  onCreate,
  onView,
}: {
  suppliers: Supplier[];
  components: BOMComponent[];
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onCreate: () => void;
  onView: (s: Supplier) => void;
}) {
  const start = (page - 1) * pageSize;
  const pageItems = suppliers.slice(start, start + pageSize);
  const soleSource = suppliers.filter((s) => s.isSoleSource).length;
  const avgRel =
    suppliers.length > 0 ? suppliers.reduce((a, s) => a + s.reliability, 0) / suppliers.length : 0;

  return (
    <div className="space-y-4">
      <BudgetPanelToolbar
        countLabel={`${suppliers.length} fournisseurs`}
        actionLabel="Nouveau fournisseur"
        onAction={onCreate}
        icon={Plus}
      />

      <ViewStatsGrid cols={3}>
        <ViewStatCard label="Référencés" value={String(suppliers.length)} gradient="from-blue-500 to-cyan-600" icon={Building2} />
        <ViewStatCard label="Fiabilité moy." value={`${avgRel.toFixed(1)}/5`} gradient="from-amber-500 to-orange-500" icon={Star} />
        <ViewStatCard label="Sole source" value={String(soleSource)} gradient="from-rose-500 to-red-500" icon={Building2} hint="Fournisseurs uniques" />
      </ViewStatsGrid>

      {pageItems.length === 0 ? (
        <BudgetEmptyPanel title="Aucun fournisseur" description="Créez votre répertoire pour relier devis et composants BOM." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pageItems.map((supplier) => {
            const count = components.filter((c) => supplier.componentIds.includes(c.id)).length;
            return (
              <BudgetRichCard
                key={supplier.id}
                accent="supplier"
                icon={Building2}
                title={supplier.name}
                subtitle={`${getSupplierTypeLabel(supplier.type)} · ${supplier.country}`}
                badge={
                  supplier.isSoleSource ? (
                    <BudgetBadge className="bg-rose-50 text-rose-700 border border-rose-100">Unique</BudgetBadge>
                  ) : undefined
                }
                highlight={<StarRating value={supplier.reliability} />}
                stats={[
                  { label: 'Composants', value: count, icon: Package },
                  { label: 'Délai', value: supplier.averageDeliveryDays ? `${supplier.averageDeliveryDays}j` : '—', icon: Clock },
                  { label: 'Pays', value: supplier.country, icon: Globe },
                ]}
                tags={
                  <>
                    {supplier.email && <BudgetTag>{supplier.email}</BudgetTag>}
                    {count > 0 && <BudgetTag>{count} réf. BOM</BudgetTag>}
                  </>
                }
                footerLabel="Fiche fournisseur"
                onClick={() => onView(supplier)}
              />
            );
          })}
        </div>
      )}
      <BudgetPagination page={page} total={suppliers.length} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  );
}

export function BudgetTrackingPanel({
  tracking,
  categories,
  components,
  onCategoryClick,
  onViewBom,
}: {
  tracking: BudgetTracking;
  categories: BOMCategoryDefinition[];
  components: BOMComponent[];
  onCategoryClick: (categoryId: string) => void;
  onViewBom: () => void;
}) {
  const activeCategories = categories.filter(
    (c) => (tracking.estimatedByCategory[c.id] ?? 0) > 0 || components.some((comp) => comp.category === c.id)
  );
  const validatedRate =
    tracking.estimatedTotal > 0 ? (tracking.validatedTotal / tracking.estimatedTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Pilotage consolidé du budget matériel et de l&apos;avancement d&apos;achat.</p>
        <button type="button" onClick={onViewBom} className="budget-btn budget-btn--primary shrink-0">
          <Package className="w-4 h-4" aria-hidden />
          BOM complet
          <ChevronRight className="w-4 h-4" aria-hidden />
        </button>
      </div>

      <ViewStatsGrid cols={4}>
        <ViewStatCard label="Estimé" value={`${tracking.estimatedTotal.toFixed(0)} €`} gradient="from-slate-600 to-slate-800" icon={TrendingUp} />
        <ViewStatCard label="Validé" value={`${tracking.validatedTotal.toFixed(0)} €`} gradient="from-emerald-500 to-teal-500" icon={CheckCircle2} />
        <ViewStatCard label="Engagé" value={`${tracking.committedTotal.toFixed(0)} €`} gradient="from-amber-500 to-orange-500" icon={Wallet} />
        <ViewStatCard
          label="Validation"
          value={`${validatedRate.toFixed(0)} %`}
          gradient="from-violet-500 to-purple-600"
          icon={Layers}
          hint={`${components.length} composants`}
        />
      </ViewStatsGrid>

      <div>
        <ViewSectionTitle icon={TrendingUp} title="Budget par catégorie" />
        <p className="text-xs text-slate-500 mt-1 mb-0">Cliquez sur une carte pour filtrer le BOM</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeCategories.map((cat) => {
            const estimated = tracking.estimatedByCategory[cat.id] ?? 0;
            const validated = tracking.validatedByCategory[cat.id] ?? 0;
            const share = tracking.estimatedTotal > 0 ? (estimated / tracking.estimatedTotal) * 100 : 0;
            const valPct = estimated > 0 ? (validated / estimated) * 100 : 0;
            const count = components.filter((c) => c.category === cat.id).length;
            return (
              <BudgetRichCard
                key={cat.id}
                accent="tracking"
                icon={TrendingUp}
                categoryGradient={cat.gradient}
                title={cat.label}
                subtitle={`${count} composant${count !== 1 ? 's' : ''} · ${share.toFixed(0)} % du budget global`}
                highlight={`${estimated.toFixed(0)} €`}
                stats={[
                  { label: 'Estimé', value: `${estimated.toFixed(0)} €` },
                  { label: 'Validé', value: validated > 0 ? `${validated.toFixed(0)} €` : '—' },
                  { label: 'Part', value: `${share.toFixed(1)} %` },
                ]}
                progress={{ label: 'Taux de validation', pct: valPct }}
                footerLabel="Filtrer cette catégorie"
                onClick={() => onCategoryClick(cat.id)}
              />
            );
          })}
        </div>
      </div>

      <div>
        <ViewSectionTitle icon={Layers} title="Pipeline d'achat" />
        <p className="text-xs text-slate-500 mt-1">Répartition par étape du cycle d&apos;achat</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['to-quote', 'quote-requested', 'quote-received', 'validated', 'ordered', 'received'] as const).map(
            (status) => {
              const count = components.filter((c) => c.status === status).length;
              const pct = components.length ? (count / components.length) * 100 : 0;
              return (
                <BudgetPipelineCard
                  key={status}
                  count={count}
                  label={getComponentStatusLabel(status)}
                  pct={pct}
                />
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export function BudgetFundingPanel({
  sources,
  page,
  pageSize,
  onPageChange,
  onCreate,
  onView,
}: {
  sources: FundingSource[];
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onCreate: () => void;
  onView: (s: FundingSource) => void;
}) {
  const start = (page - 1) * pageSize;
  const pageItems = sources.slice(start, start + pageSize);
  const obtained = sources.filter((s) => s.status === 'won').length;
  const inProgress = sources.filter((s) => s.status === 'in-progress').length;
  const explore = sources.filter((s) => s.status === 'explore').length;

  return (
    <div className="space-y-4">
      <BudgetPanelToolbar
        countLabel={`${sources.length} sources de financement`}
        actionLabel="Nouvelle source"
        onAction={onCreate}
        icon={Plus}
      />

      <ViewStatsGrid cols={4}>
        <ViewStatCard label="Objectif" value="3,5 k€" gradient="from-blue-500 to-indigo-600" icon={Wallet} />
        <ViewStatCard label="Obtenus" value={String(obtained)} gradient="from-emerald-500 to-teal-500" icon={CheckCircle2} />
        <ViewStatCard label="En cours" value={String(inProgress)} gradient="from-amber-500 to-orange-500" icon={Clock} />
        <ViewStatCard label="À explorer" value={String(explore)} gradient="from-violet-500 to-purple-600" icon={TrendingUp} />
      </ViewStatsGrid>

      {pageItems.length === 0 ? (
        <BudgetEmptyPanel title="Aucune source" description="Référencez subventions, aides publiques ou financements privés." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pageItems.map((s) => {
            const progressPct =
              s.status === 'won' ? 100 : s.status === 'in-progress' ? 60 : s.status === 'explore' ? 20 : s.status === 'lost' ? 5 : 40;
            return (
              <BudgetRichCard
                key={s.id}
                accent="funding"
                icon={Wallet}
                title={s.title}
                subtitle={s.description?.slice(0, 100) || 'Dossier de financement'}
                badge={<BudgetBadge className={getFundingStatusColor(s.status)}>{getFundingStatusLabel(s.status)}</BudgetBadge>}
                highlight={s.amountLabel}
                stats={[
                  {
                    label: 'Échéance',
                    value: s.deadline ? new Date(s.deadline).toLocaleDateString('fr-FR') : '—',
                    icon: Calendar,
                  },
                  { label: 'Succès', value: s.successRate || '—', icon: TrendingUp },
                  { label: 'Statut', value: getFundingStatusLabel(s.status) },
                ]}
                progress={{ label: 'Maturité du dossier', pct: progressPct }}
                footerLabel="Voir le dossier"
                onClick={() => onView(s)}
              />
            );
          })}
        </div>
      )}
      <BudgetPagination page={page} total={sources.length} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  );
}

export function BudgetAlertsStrip({ tracking }: { tracking: BudgetTracking }) {
  if (tracking.alerts.length === 0) return null;
  return (
    <div className="space-y-2 mb-5">
      {tracking.alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
            alert.severity === 'critical'
              ? 'bg-red-50/90 border-red-100'
              : alert.severity === 'warning'
                ? 'bg-amber-50/90 border-amber-100'
                : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <div className="font-semibold text-slate-900">{alert.message}</div>
            <div className="text-slate-600 text-xs mt-1 leading-relaxed">{alert.actionRequired}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
