import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Download,
  Package,
  Plus,
  Upload,
} from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { filterByActiveProject } from '../../utils/projectMatch';
import { DEMO_BOM_BY_PROJECT } from '../../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../../utils/demoDataMerge';
import {
  calculateBudgetTracking,
  type BOMComponent,
  type ComponentStatus,
  type FundingSource,
  type Quote,
  type Supplier,
} from '../../types/budget';
import {
  ActionButton,
  ViewHeader,
  ViewShell,
  ViewStatCard,
  ViewStatsGrid,
} from '../../components/shared';
import {
  createCategory,
  deleteCategory,
  getScopedCategories,
  loadBudgetCategories,
  saveBudgetCategories,
  updateCategory,
  CATEGORY_COLOR_PRESETS,
  type BOMCategoryDefinition,
} from '../../utils/budgetCategoryStore';
import {
  BUDGET_PAGE_SIZE,
  loadFundingSources,
  loadQuotes,
  loadSuppliers,
  saveFundingSources,
  saveQuotes,
  saveSuppliers,
} from '../../utils/budgetStore';
import { downloadBudgetPdf } from '../../utils/budgetExportPdf';
import {
  parseBudgetImportFile,
  readFileAsText,
} from '../../utils/budgetImportExport';
import { DEFAULT_BOM_COMPONENTS } from './data/budgetDemoData';
import { BudgetTabsNav, type BudgetTabId } from './components/BudgetTabsNav';
import { CategoryFormModal } from './components/CategoryFormModal';
import { BomPanel } from './components/BomPanel';
import { BomComponentForm, emptyBomForm, type BomFormValues } from './components/BomComponentForm';
import { BomComponentDetail } from './components/BomComponentDetail';
import {
  BudgetAlertsStrip,
  BudgetFundingPanel,
  BudgetQuotesPanel,
  BudgetSuppliersPanel,
  BudgetTrackingPanel,
} from './components/BudgetSecondaryPanels';
import {
  emptyFundingForm,
  emptyQuoteForm,
  emptySupplierForm,
  FundingDetailPage,
  FundingFormPage,
  QuoteDetailPage,
  QuoteFormPage,
  SupplierDetailPage,
  SupplierFormPage,
  type FundingFormValues,
  type QuoteFormValues,
  type SupplierFormValues,
} from './components/BudgetEntityPages';
import '../../../styles/budget.css';

type Screen =
  | { type: 'main' }
  | { type: 'component'; mode: 'create' | 'view' | 'edit'; id?: string }
  | { type: 'quote'; mode: 'create' | 'view' | 'edit'; id?: string }
  | { type: 'supplier'; mode: 'create' | 'view' | 'edit'; id?: string }
  | { type: 'funding'; mode: 'create' | 'view' | 'edit'; id?: string };

const BOM_STORAGE_KEY = 'popilot:budget-bom-local';

export function BudgetFeature() {
  const { matchesProject, activeProjectSlug, activeProject } = useProjectContext();

  const [activeTab, setActiveTab] = useState<BudgetTabId>('bom');
  const [screen, setScreen] = useState<Screen>({ type: 'main' });
  const [categories, setCategories] = useState(loadBudgetCategories);
  const [bomComponents, setBomComponents] = useState<BOMComponent[]>(DEFAULT_BOM_COMPONENTS);
  const [quotes, setQuotes] = useState<Quote[]>(loadQuotes);
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadSuppliers);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>(loadFundingSources);

  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ComponentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bomForm, setBomForm] = useState<BomFormValues>(emptyBomForm());
  const [quoteForm, setQuoteForm] = useState<QuoteFormValues>(emptyQuoteForm([]));
  const [supplierForm, setSupplierForm] = useState<SupplierFormValues>(emptySupplierForm());
  const [fundingForm, setFundingForm] = useState<FundingFormValues>(emptyFundingForm());

  const [quotesPage, setQuotesPage] = useState(1);
  const [suppliersPage, setSuppliersPage] = useState(1);
  const [fundingPage, setFundingPage] = useState(1);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<BOMCategoryDefinition | undefined>();
  const [dataNotice, setDataNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BOM_STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as BOMComponent[]) : [];
      setBomComponents(mergeDemoData(saved, DEMO_BOM_BY_PROJECT, DEFAULT_BOM_COMPONENTS));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(BOM_STORAGE_KEY, JSON.stringify(bomComponents));
    } catch {
      /* ignore */
    }
  }, [bomComponents]);

  useEffect(() => {
    saveQuotes(quotes);
  }, [quotes]);

  useEffect(() => {
    saveSuppliers(suppliers);
  }, [suppliers]);

  useEffect(() => {
    saveFundingSources(fundingSources);
  }, [fundingSources]);

  useEffect(() => {
    const refresh = () => setCategories(loadBudgetCategories());
    window.addEventListener('popilot:budget-updated', refresh);
    return () => window.removeEventListener('popilot:budget-updated', refresh);
  }, []);

  const goMain = () => setScreen({ type: 'main' });

  const handleImportClick = () => importInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await readFileAsText(file);
      const result = parseBudgetImportFile(text);
      if (!result.ok) {
        setDataNotice({ type: 'error', message: result.error });
        return;
      }
      const { bundle } = result;
      const summary = `${bundle.bom.length} composants, ${bundle.quotes.length} devis, ${bundle.suppliers.length} fournisseurs, ${bundle.funding.length} sources de financement`;
      if (
        !window.confirm(
          `Importer ${summary} ?\n\nLes données budget actuelles seront remplacées par le contenu du fichier.`
        )
      ) {
        return;
      }
      setBomComponents(bundle.bom);
      if (bundle.quotes.length) setQuotes(bundle.quotes);
      if (bundle.suppliers.length) setSuppliers(bundle.suppliers);
      if (bundle.funding.length) setFundingSources(bundle.funding);
      if (bundle.categories.length) {
        saveBudgetCategories(bundle.categories);
        setCategories(loadBudgetCategories());
      }
      setDataNotice({ type: 'success', message: `Import réussi : ${summary}.` });
      goMain();
    } catch {
      setDataNotice({ type: 'error', message: 'Impossible de lire le fichier sélectionné.' });
    }
  };

  useEffect(() => {
    if (!dataNotice) return;
    const t = window.setTimeout(() => setDataNotice(null), 5000);
    return () => window.clearTimeout(t);
  }, [dataNotice]);

  const scopedCategories = useMemo(
    () => getScopedCategories(categories, matchesProject, activeProjectSlug ?? 'popy'),
    [categories, matchesProject, activeProjectSlug]
  );

  const scopedBomComponents = useMemo(
    () => filterByActiveProject(bomComponents, matchesProject, activeProjectSlug ?? 'popy'),
    [bomComponents, matchesProject, activeProjectSlug]
  );

  const categoryIds = useMemo(() => scopedCategories.map((c) => c.id), [scopedCategories]);

  const tracking = useMemo(
    () => calculateBudgetTracking(scopedBomComponents, quotes, categoryIds),
    [scopedBomComponents, quotes, categoryIds]
  );

  const handleExport = useCallback(async () => {
    try {
      await downloadBudgetPdf({
        projectName: activeProject?.name ?? activeProjectSlug ?? 'Projet',
        exportedAt: new Date().toISOString(),
        tracking,
        bom: scopedBomComponents,
        quotes,
        suppliers,
        funding: fundingSources,
        categories: scopedCategories,
      });
      setDataNotice({ type: 'success', message: 'Rapport PDF téléchargé.' });
    } catch {
      setDataNotice({ type: 'error', message: 'Impossible de générer le PDF.' });
    }
  }, [
    activeProject?.name,
    activeProjectSlug,
    tracking,
    scopedBomComponents,
    quotes,
    suppliers,
    fundingSources,
    scopedCategories,
  ]);

  const selectedComponent = useMemo(() => {
    if (screen.type !== 'component' || !screen.id) return null;
    return scopedBomComponents.find((c) => c.id === screen.id) ?? null;
  }, [screen, scopedBomComponents]);

  const selectedQuote = useMemo(() => {
    if (screen.type !== 'quote' || !screen.id) return null;
    return quotes.find((q) => q.id === screen.id) ?? null;
  }, [screen, quotes]);

  const selectedSupplier = useMemo(() => {
    if (screen.type !== 'supplier' || !screen.id) return null;
    return suppliers.find((s) => s.id === screen.id) ?? null;
  }, [screen, suppliers]);

  const selectedFunding = useMemo(() => {
    if (screen.type !== 'funding' || !screen.id) return null;
    return fundingSources.find((f) => f.id === screen.id) ?? null;
  }, [screen, fundingSources]);

  const toBomComponent = useCallback(
    (base?: BOMComponent): BOMComponent => {
      const totalEstimated = bomForm.quantity * bomForm.unitPriceEstimated;
      return {
        id: base?.id ?? `bom-${Date.now()}`,
        category: bomForm.category,
        name: bomForm.name,
        functionalName: bomForm.functionalName,
        example: bomForm.example,
        quantity: bomForm.quantity,
        unitPriceEstimated: bomForm.unitPriceEstimated,
        totalEstimated,
        unitPriceActual: base?.unitPriceActual,
        totalActual: base?.totalActual,
        status: bomForm.status,
        supplierName: bomForm.supplierName || undefined,
        priceSource: bomForm.priceSource,
        criticality: bomForm.criticality,
        notes: bomForm.notes || undefined,
        linkedTo: base?.linkedTo,
        createdAt: base?.createdAt ?? new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        createdBy: base?.createdBy ?? 'user-local',
        lastModifiedBy: 'user-local',
        projectId: base?.projectId ?? activeProjectSlug ?? 'popy',
      };
    },
    [bomForm, activeProjectSlug]
  );

  const submitBomForm = (e: React.FormEvent) => {
    e.preventDefault();
    const next = toBomComponent(screen.type === 'component' && screen.mode === 'edit' ? selectedComponent ?? undefined : undefined);
    if (screen.type === 'component' && screen.mode === 'create') {
      setBomComponents((prev) => [...prev, next]);
    } else {
      setBomComponents((prev) => prev.map((c) => (c.id === next.id ? next : c)));
    }
    goMain();
    setBomForm(emptyBomForm());
  };

  const submitQuoteForm = (e: React.FormEvent) => {
    e.preventDefault();
    const base = selectedQuote;
    const next: Quote = {
      ...quoteForm,
      id: base?.id ?? `quote-${Date.now()}`,
      createdAt: base?.createdAt ?? new Date().toISOString().slice(0, 10),
      createdBy: base?.createdBy ?? 'user-local',
    };
    if (screen.type === 'quote' && screen.mode === 'create') {
      setQuotes((prev) => [next, ...prev]);
    } else {
      setQuotes((prev) => prev.map((q) => (q.id === next.id ? next : q)));
    }
    setScreen({ type: 'quote', mode: 'view', id: next.id });
  };

  const submitSupplierForm = (e: React.FormEvent) => {
    e.preventDefault();
    const base = selectedSupplier;
    const today = new Date().toISOString().slice(0, 10);
    const next: Supplier = {
      ...supplierForm,
      id: base?.id ?? `sup-${Date.now()}`,
      createdAt: base?.createdAt ?? today,
      updatedAt: today,
    };
    if (screen.type === 'supplier' && screen.mode === 'create') {
      setSuppliers((prev) => [next, ...prev]);
    } else {
      setSuppliers((prev) => prev.map((s) => (s.id === next.id ? next : s)));
    }
    setScreen({ type: 'supplier', mode: 'view', id: next.id });
  };

  const submitFundingForm = (e: React.FormEvent) => {
    e.preventDefault();
    const base = selectedFunding;
    const today = new Date().toISOString().slice(0, 10);
    const next: FundingSource = {
      ...fundingForm,
      id: base?.id ?? `fund-${Date.now()}`,
      createdAt: base?.createdAt ?? today,
      updatedAt: today,
    };
    if (screen.type === 'funding' && screen.mode === 'create') {
      setFundingSources((prev) => [next, ...prev]);
    } else {
      setFundingSources((prev) => prev.map((f) => (f.id === next.id ? next : f)));
    }
    setScreen({ type: 'funding', mode: 'view', id: next.id });
  };

  const handleCreateCategory = (label: string, colorIndex: number) => {
    const cat = createCategory(label, colorIndex, activeProjectSlug ?? 'popy', categories);
    setCategories(loadBudgetCategories());
    setSelectedCategory(cat.id);
  };

  const handleUpdateCategory = (id: string, label: string, colorIndex: number) => {
    const preset = CATEGORY_COLOR_PRESETS[colorIndex % CATEGORY_COLOR_PRESETS.length];
    updateCategory(id, { label, gradient: preset.gradient, accent: preset.accent }, categories);
    setCategories(loadBudgetCategories());
  };

  const handleDeleteCategory = (id: string) => {
    if (scopedBomComponents.some((c) => c.category === id)) {
      window.alert('Supprimez ou déplacez les composants de cette catégorie avant de la supprimer.');
      return;
    }
    deleteCategory(id, categories);
    setCategories(loadBudgetCategories());
    if (selectedCategory === id) setSelectedCategory('all');
  };

  const canDeleteCategory =
    editingCategory &&
    !editingCategory.isBuiltIn &&
    !scopedBomComponents.some((c) => c.category === editingCategory.id);

  const shellClass = 'view-shell budget-shell';

  if (screen.type === 'component' && (screen.mode === 'create' || screen.mode === 'edit')) {
    return (
      <div className={shellClass}>
        <BomComponentForm
          mode={screen.mode}
          form={bomForm}
          categories={scopedCategories}
          onChange={setBomForm}
          onSubmit={submitBomForm}
          onBack={() => (screen.mode === 'edit' && selectedComponent ? setScreen({ type: 'component', mode: 'view', id: selectedComponent.id }) : goMain())}
        />
      </div>
    );
  }

  if (screen.type === 'component' && screen.mode === 'view' && selectedComponent) {
    return (
      <div className={shellClass}>
        <BomComponentDetail
          component={selectedComponent}
          categories={scopedCategories}
          onBack={goMain}
          onEdit={() => {
            setBomForm({
              category: selectedComponent.category,
              name: selectedComponent.name,
              functionalName: selectedComponent.functionalName,
              example: selectedComponent.example,
              quantity: selectedComponent.quantity,
              unitPriceEstimated: selectedComponent.unitPriceEstimated,
              status: selectedComponent.status,
              priceSource: selectedComponent.priceSource,
              criticality: selectedComponent.criticality,
              supplierName: selectedComponent.supplierName ?? '',
              notes: selectedComponent.notes ?? '',
            });
            setScreen({ type: 'component', mode: 'edit', id: selectedComponent.id });
          }}
          onDelete={() => {
            setBomComponents((prev) => prev.filter((c) => c.id !== selectedComponent.id));
            goMain();
          }}
        />
      </div>
    );
  }

  if (screen.type === 'quote' && (screen.mode === 'create' || screen.mode === 'edit')) {
    return (
      <div className={shellClass}>
        <QuoteFormPage
          mode={screen.mode}
          form={quoteForm}
          suppliers={suppliers}
          components={scopedBomComponents}
          onChange={setQuoteForm}
          onSubmit={submitQuoteForm}
          onBack={() => (screen.mode === 'edit' && selectedQuote ? setScreen({ type: 'quote', mode: 'view', id: selectedQuote.id }) : goMain())}
        />
      </div>
    );
  }

  if (screen.type === 'quote' && screen.mode === 'view' && selectedQuote) {
    return (
      <div className={shellClass}>
        <QuoteDetailPage
          quote={selectedQuote}
          components={scopedBomComponents}
          onBack={goMain}
          onEdit={() => {
            setQuoteForm({ ...selectedQuote });
            setScreen({ type: 'quote', mode: 'edit', id: selectedQuote.id });
          }}
          onDelete={() => {
            setQuotes((prev) => prev.filter((q) => q.id !== selectedQuote.id));
            goMain();
          }}
          onAccept={() => {
            setQuotes((prev) => prev.map((q) => (q.id === selectedQuote.id ? { ...q, status: 'accepted', acceptedAt: new Date().toISOString().slice(0, 10) } : q)));
          }}
          onReject={() => {
            setQuotes((prev) => prev.map((q) => (q.id === selectedQuote.id ? { ...q, status: 'rejected' } : q)));
          }}
        />
      </div>
    );
  }

  if (screen.type === 'supplier' && (screen.mode === 'create' || screen.mode === 'edit')) {
    return (
      <div className={shellClass}>
        <SupplierFormPage
          mode={screen.mode}
          form={supplierForm}
          components={scopedBomComponents}
          onChange={setSupplierForm}
          onSubmit={submitSupplierForm}
          onBack={() => (screen.mode === 'edit' && selectedSupplier ? setScreen({ type: 'supplier', mode: 'view', id: selectedSupplier.id }) : goMain())}
        />
      </div>
    );
  }

  if (screen.type === 'supplier' && screen.mode === 'view' && selectedSupplier) {
    return (
      <div className={shellClass}>
        <SupplierDetailPage
          supplier={selectedSupplier}
          components={scopedBomComponents}
          onBack={goMain}
          onEdit={() => {
            setSupplierForm({ ...selectedSupplier });
            setScreen({ type: 'supplier', mode: 'edit', id: selectedSupplier.id });
          }}
          onDelete={() => {
            setSuppliers((prev) => prev.filter((s) => s.id !== selectedSupplier.id));
            goMain();
          }}
        />
      </div>
    );
  }

  if (screen.type === 'funding' && (screen.mode === 'create' || screen.mode === 'edit')) {
    return (
      <div className={shellClass}>
        <FundingFormPage
          mode={screen.mode}
          form={fundingForm}
          onChange={setFundingForm}
          onSubmit={submitFundingForm}
          onBack={() => (screen.mode === 'edit' && selectedFunding ? setScreen({ type: 'funding', mode: 'view', id: selectedFunding.id }) : goMain())}
        />
      </div>
    );
  }

  if (screen.type === 'funding' && screen.mode === 'view' && selectedFunding) {
    return (
      <div className={shellClass}>
        <FundingDetailPage
          source={selectedFunding}
          onBack={goMain}
          onEdit={() => {
            setFundingForm({ ...selectedFunding });
            setScreen({ type: 'funding', mode: 'edit', id: selectedFunding.id });
          }}
          onDelete={() => {
            setFundingSources((prev) => prev.filter((f) => f.id !== selectedFunding.id));
            goMain();
          }}
        />
      </div>
    );
  }

  return (
    <ViewShell className="budget-shell">
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={handleImportFile}
        aria-hidden
      />

      {dataNotice && (
        <div
          role="status"
          className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            dataNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {dataNotice.message}
        </div>
      )}

      <ViewHeader
        title="Budget & BOM"
        subtitle="Bill of Materials, devis, fournisseurs et suivi budgétaire"
        badge="Finances · BOM"
        theme="emerald"
        actions={
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
            <ActionButton variant="secondary" icon={Upload} onClick={handleImportClick}>
              Importer
            </ActionButton>
            <ActionButton variant="secondary" icon={Download} onClick={() => void handleExport()}>
              Export PDF
            </ActionButton>
            <ActionButton
              icon={Plus}
              onClick={() => {
                setActiveTab('bom');
                setBomForm({ ...emptyBomForm(), category: scopedCategories[0]?.id ?? 'brain-ai' });
                setScreen({ type: 'component', mode: 'create' });
              }}
              className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
            >
              Nouveau composant
            </ActionButton>
          </div>
        }
      />

      <ViewStatsGrid cols={4}>
        <ViewStatCard label="Budget estimé" value={`${tracking.estimatedTotal.toFixed(2)} €`} hint={`${scopedBomComponents.length} composants`} gradient="from-slate-500 to-slate-700" icon={Package} />
        <ViewStatCard label="Budget validé" value={`${tracking.validatedTotal.toFixed(2)} €`} hint={`${quotes.filter((q) => q.status === 'accepted').length} devis acceptés`} gradient="from-emerald-500 to-teal-500" icon={CheckCircle} />
        <ViewStatCard label="Budget engagé" value={`${tracking.committedTotal.toFixed(2)} €`} hint="Commandes en cours" gradient="from-amber-500 to-orange-500" icon={Clock} />
        <ViewStatCard label="Écart budget" value={`${tracking.deviationPercent > 0 ? '+' : ''}${tracking.deviationPercent.toFixed(1)}%`} hint={`${tracking.deviationAmount > 0 ? '+' : ''}${tracking.deviationAmount.toFixed(2)} €`} gradient={tracking.deviationPercent > 0 ? 'from-red-500 to-rose-500' : 'from-emerald-500 to-teal-500'} icon={tracking.deviationPercent > 0 ? ArrowUpRight : ArrowDownRight} />
      </ViewStatsGrid>

      <BudgetAlertsStrip tracking={tracking} />

      <BudgetTabsNav
        active={activeTab}
        onChange={setActiveTab}
        counts={{ bom: scopedBomComponents.length, quotes: quotes.length, suppliers: suppliers.length, funding: fundingSources.length }}
      />

      {activeTab === 'bom' && (
        <BomPanel
          components={scopedBomComponents}
          categories={scopedCategories}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          onCategoryChange={setSelectedCategory}
          onStatusChange={setSelectedStatus}
          onSearchChange={setSearchQuery}
          onCreateCategory={() => {
            setCategoryModalMode('create');
            setEditingCategory(undefined);
            setCategoryModalOpen(true);
          }}
          onManageCategory={(cat) => {
            setCategoryModalMode('edit');
            setEditingCategory(cat);
            setCategoryModalOpen(true);
          }}
          onCreateComponent={() => {
            setBomForm({ ...emptyBomForm(), category: scopedCategories[0]?.id ?? 'brain-ai' });
            setScreen({ type: 'component', mode: 'create' });
          }}
          onViewComponent={(c) => setScreen({ type: 'component', mode: 'view', id: c.id })}
          onEditComponent={(c) => {
            setBomForm({
              category: c.category,
              name: c.name,
              functionalName: c.functionalName,
              example: c.example,
              quantity: c.quantity,
              unitPriceEstimated: c.unitPriceEstimated,
              status: c.status,
              priceSource: c.priceSource,
              criticality: c.criticality,
              supplierName: c.supplierName ?? '',
              notes: c.notes ?? '',
            });
            setScreen({ type: 'component', mode: 'edit', id: c.id });
          }}
        />
      )}

      {activeTab === 'quotes' && (
        <BudgetQuotesPanel
          quotes={quotes}
          components={scopedBomComponents}
          page={quotesPage}
          pageSize={BUDGET_PAGE_SIZE}
          onPageChange={setQuotesPage}
          onCreate={() => {
            setQuoteForm(emptyQuoteForm(suppliers));
            setScreen({ type: 'quote', mode: 'create' });
          }}
          onView={(q) => setScreen({ type: 'quote', mode: 'view', id: q.id })}
        />
      )}

      {activeTab === 'suppliers' && (
        <BudgetSuppliersPanel
          suppliers={suppliers}
          components={scopedBomComponents}
          page={suppliersPage}
          pageSize={BUDGET_PAGE_SIZE}
          onPageChange={setSuppliersPage}
          onCreate={() => {
            setSupplierForm(emptySupplierForm());
            setScreen({ type: 'supplier', mode: 'create' });
          }}
          onView={(s) => setScreen({ type: 'supplier', mode: 'view', id: s.id })}
        />
      )}

      {activeTab === 'tracking' && (
        <BudgetTrackingPanel
          tracking={tracking}
          categories={scopedCategories}
          components={scopedBomComponents}
          onCategoryClick={(id) => {
            setSelectedCategory(id);
            setActiveTab('bom');
          }}
          onViewBom={() => setActiveTab('bom')}
        />
      )}

      {activeTab === 'funding' && (
        <BudgetFundingPanel
          sources={fundingSources}
          page={fundingPage}
          pageSize={BUDGET_PAGE_SIZE}
          onPageChange={setFundingPage}
          onCreate={() => {
            setFundingForm(emptyFundingForm());
            setScreen({ type: 'funding', mode: 'create' });
          }}
          onView={(s) => setScreen({ type: 'funding', mode: 'view', id: s.id })}
        />
      )}

      <CategoryFormModal
        open={categoryModalOpen}
        mode={categoryModalMode}
        category={editingCategory}
        canDelete={Boolean(canDeleteCategory)}
        onClose={() => setCategoryModalOpen(false)}
        onCreate={handleCreateCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />
    </ViewShell>
  );
}
