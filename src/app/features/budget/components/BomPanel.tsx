import { AlertCircle, Edit, Eye, Link as LinkIcon, Package, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TableWrap } from '../../../components/shared';
import {
  getComponentStatusColor,
  getComponentStatusLabel,
  getCriticalityColor,
  type BOMComponent,
  type ComponentStatus,
} from '../../../types/budget';
import type { BOMCategoryDefinition } from '../../../utils/budgetCategoryStore';
import { BomFiltersBar } from './BomFiltersBar';
import { BudgetCategoryStrip } from './BudgetCategoryStrip';
import { BudgetPagination } from './BudgetPagination';
import { BudgetCardFooterActions, BudgetRichCard } from './BudgetRichCard';
import { BudgetBadge, BudgetTag } from './BudgetUIKit';
import { BUDGET_PAGE_SIZE } from '../../../utils/budgetStore';

type ViewMode = 'cards' | 'table';

interface BomPanelProps {
  components: BOMComponent[];
  categories: BOMCategoryDefinition[];
  selectedCategory: string | 'all';
  selectedStatus: ComponentStatus | 'all';
  searchQuery: string;
  onCategoryChange: (id: string | 'all') => void;
  onStatusChange: (s: ComponentStatus | 'all') => void;
  onSearchChange: (q: string) => void;
  onCreateCategory: () => void;
  onManageCategory: (cat: BOMCategoryDefinition) => void;
  onCreateComponent: () => void;
  onViewComponent: (c: BOMComponent) => void;
  onEditComponent: (c: BOMComponent) => void;
}

export function BomPanel({
  components,
  categories,
  selectedCategory,
  selectedStatus,
  searchQuery,
  onCategoryChange,
  onStatusChange,
  onSearchChange,
  onCreateCategory,
  onManageCategory,
  onCreateComponent,
  onViewComponent,
  onEditComponent,
}: BomPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);

  const filtered = components.filter((comp) => {
    if (selectedCategory !== 'all' && comp.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && comp.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.functionalName.toLowerCase().includes(q) ||
        comp.example.toLowerCase().includes(q)
      );
    }
    return true;
  });

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedStatus, searchQuery]);

  const pageItems = filtered.slice((page - 1) * BUDGET_PAGE_SIZE, page * BUDGET_PAGE_SIZE);

  const componentCounts = components.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});

  const visibleCategories =
    selectedCategory === 'all'
      ? categories.filter((cat) => pageItems.some((c) => c.category === cat.id))
      : categories.filter((c) => c.id === selectedCategory);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <BudgetCategoryStrip
        categories={categories}
        selectedId={selectedCategory}
        componentCounts={componentCounts}
        onSelect={onCategoryChange}
        onCreateClick={onCreateCategory}
        onManageClick={onManageCategory}
      />

      <BomFiltersBar
        searchQuery={searchQuery}
        selectedStatus={selectedStatus}
        viewMode={viewMode}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        onViewModeChange={setViewMode}
        onCreateComponent={onCreateComponent}
        resultCount={filtered.length}
      />

      {filtered.length > 0 && (
        <BudgetPagination
          page={page}
          total={filtered.length}
          pageSize={BUDGET_PAGE_SIZE}
          onPageChange={setPage}
          className="mb-4"
        />
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-slate-600 font-medium">Aucun composant trouvé</p>
          <p className="text-sm text-slate-500 mt-1">Modifiez les filtres ou ajoutez un composant</p>
          <button
            type="button"
            onClick={onCreateComponent}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Ajouter un composant
          </button>
        </div>
      )}

      <div className="space-y-5">
        {visibleCategories.map((cat) => {
          const categoryComponents = pageItems.filter((c) => c.category === cat.id);
          if (categoryComponents.length === 0) return null;

          const categoryTotal = categoryComponents.reduce((s, c) => s + c.totalEstimated, 0);
          const categoryValidated = categoryComponents.reduce(
            (s, c) => s + (c.totalActual ?? (c.status === 'validated' ? c.totalEstimated : 0)),
            0
          );
          const validatedPct = categoryTotal > 0 ? (categoryValidated / categoryTotal) * 100 : 0;
          const isCollapsed = collapsed[cat.id];

          return (
            <section key={cat.id} className="rounded-2xl border border-slate-200/70 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCollapse(cat.id)}
                className="w-full text-left flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-1 self-stretch rounded-full bg-gradient-to-b ${cat.gradient} shrink-0 min-h-[2.5rem]`} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base text-slate-900 truncate">{cat.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {categoryComponents.length} composant{categoryComponents.length > 1 ? 's' : ''} ·{' '}
                      <span className="font-semibold text-slate-700 tabular-nums">{categoryTotal.toFixed(2)} €</span> estimé
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  {categoryValidated > 0 && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg tabular-nums whitespace-nowrap">
                      {categoryValidated.toFixed(2)} € validé
                    </span>
                  )}
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden max-w-[120px]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${cat.gradient} transition-all duration-500`}
                        style={{ width: `${Math.min(validatedPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 tabular-nums w-8 text-right">
                      {Math.round(validatedPct)}%
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs w-4 text-center">{isCollapsed ? '▼' : '▲'}</span>
                </div>
              </button>

              {!isCollapsed && (
                <>
                  <div className={`p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 ${viewMode === 'cards' ? 'lg:hidden' : 'lg:hidden'}`}>
                    {categoryComponents.map((comp) => (
                      <ComponentCard
                        key={comp.id}
                        comp={comp}
                        categoryGradient={cat.gradient}
                        onView={() => onViewComponent(comp)}
                        onEdit={() => onEditComponent(comp)}
                      />
                    ))}
                  </div>

                  {viewMode === 'table' && (
                    <div className="hidden lg:block budget-table-wrap border-t border-slate-100">
                      <TableWrap>
                        <table className="w-full min-w-[800px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Composant</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Référence</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Qté</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Statut</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Crit.</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {categoryComponents.map((comp) => (
                            <tr key={comp.id} className="hover:bg-emerald-50/30 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900 text-sm">{comp.functionalName || comp.name}</div>
                                <div className="text-xs text-slate-500">{comp.name}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">{comp.example}</td>
                              <td className="px-4 py-3 text-center text-sm font-medium">{comp.quantity}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="text-sm font-bold text-slate-900">{comp.totalEstimated.toFixed(2)} €</div>
                                {comp.totalActual != null && (
                                  <div className="text-xs text-emerald-600">{comp.totalActual.toFixed(2)} € réel</div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getComponentStatusColor(comp.status)}`}>
                                  {getComponentStatusLabel(comp.status)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <AlertCircle className={`w-4 h-4 mx-auto ${getCriticalityColor(comp.criticality)}`} />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-1">
                                  {comp.linkedTo && Object.keys(comp.linkedTo).length > 0 && (
                                    <LinkIcon className="w-4 h-4 text-blue-500" />
                                  )}
                                  <button type="button" onClick={() => onViewComponent(comp)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Voir">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button type="button" onClick={() => onEditComponent(comp)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Modifier">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableWrap>
                    </div>
                  )}

                  {viewMode === 'cards' && (
                    <div className="hidden lg:grid p-4 grid-cols-2 xl:grid-cols-3 gap-4 border-t border-slate-100">
                      {categoryComponents.map((comp) => (
                        <ComponentCard
                          key={comp.id}
                          comp={comp}
                          categoryGradient={cat.gradient}
                          onView={() => onViewComponent(comp)}
                          onEdit={() => onEditComponent(comp)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          );
        })}
      </div>

      <BudgetPagination
        page={page}
        total={filtered.length}
        pageSize={BUDGET_PAGE_SIZE}
        onPageChange={setPage}
        className="mt-2"
      />
    </div>
  );
}

const STATUS_PROGRESS: Record<ComponentStatus, number> = {
  'to-quote': 10,
  'quote-requested': 25,
  'quote-received': 45,
  validated: 70,
  ordered: 85,
  received: 100,
};

function ComponentCard({
  comp,
  categoryGradient,
  onView,
  onEdit,
}: {
  comp: BOMComponent;
  categoryGradient: string;
  onView: () => void;
  onEdit: () => void;
}) {
  const progressPct = STATUS_PROGRESS[comp.status] ?? 0;

  return (
    <BudgetRichCard
      accent="bom"
      icon={Package}
      categoryGradient={categoryGradient}
      title={comp.functionalName || comp.name}
      subtitle={
        comp.functionalName && comp.name !== comp.functionalName
          ? comp.name
          : comp.example || undefined
      }
      badge={
        <BudgetBadge className={getComponentStatusColor(comp.status)}>
          {getComponentStatusLabel(comp.status)}
        </BudgetBadge>
      }
      highlight={`${comp.totalEstimated.toFixed(2)} €`}
      stats={[
        { label: 'Qté', value: `×${comp.quantity}` },
        {
          label: 'Unitaire',
          value: `${comp.unitPriceEstimated.toFixed(2)} €`,
        },
        {
          label: 'Criticité',
          value: (
            <AlertCircle className={`w-3.5 h-3.5 mx-auto ${getCriticalityColor(comp.criticality)}`} />
          ),
        },
      ]}
      progress={{ label: 'Avancement achat', pct: progressPct }}
      tags={
        comp.supplierName || (comp.example && comp.functionalName) ? (
          <>
            {comp.supplierName && <BudgetTag>{comp.supplierName}</BudgetTag>}
            {comp.example && comp.functionalName && <BudgetTag>{comp.example}</BudgetTag>}
          </>
        ) : undefined
      }
      footer={<BudgetCardFooterActions onView={onView} onEdit={onEdit} />}
    />
  );
}
