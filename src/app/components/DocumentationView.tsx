import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { usePipeline } from '../context/PipelineContext';
import { applyPipelineSync } from '../utils/pipelineSync';
import type { DocumentCategoryDef, ISODocument } from '../types/documents';
import { INITIAL_DOCUMENTS } from '../data/documentationDemoData';
import {
  BUILTIN_DOCUMENT_CATEGORIES,
  DOC_FIXTURE_VERSION,
  DOC_FIXTURE_VERSION_KEY,
  DOCS_STORAGE_KEY,
  loadDocumentCategories,
  mergeCategories,
  saveCustomCategories,
} from '../data/documentationHelpers';
import { ViewShell, ViewHeader, ActionButton } from './shared';
import { DocumentationTabNav } from './documentation/DocumentationTabNav';
import { DocumentationOverviewTab } from './documentation/DocumentationOverviewTab';
import { DocumentationLibraryTab } from './documentation/DocumentationLibraryTab';
import { DocumentationComplianceTab } from './documentation/DocumentationComplianceTab';
import { DocumentationCategoriesTab } from './documentation/DocumentationCategoriesTab';
import { DocumentationLinksTab } from './documentation/DocumentationLinksTab';
import { DocumentFormPage } from './documentation/DocumentFormPage';
import { DocumentDetailPage } from './documentation/DocumentDetailPage';
import { DocumentPreviewPanel } from './documentation/DocumentPreviewPanel';
import {
  buildDocumentFromForm,
  computeDocumentationStats,
  documentToFormValues,
  emptyDocumentForm,
  type DocumentationPageMode,
  type DocumentationTab,
} from './documentation/documentationPresentation';

export { INITIAL_DOCUMENTS } from '../data/documentationDemoData';

export function DocumentationView() {
  const { matchesProject, activeProjectSlug, activeProject } = useProjectContext();
  const { scopedStages } = usePipeline();
  const projectId = activeProjectSlug ?? 'popy';

  const [activeTab, setActiveTab] = useState<DocumentationTab>('overview');
  const [pageMode, setPageMode] = useState<DocumentationPageMode>('list');
  const [documents, setDocuments] = useState<ISODocument[]>([]);
  const [categories, setCategories] = useState<DocumentCategoryDef[]>(BUILTIN_DOCUMENT_CATEGORIES);
  const [selectedDoc, setSelectedDoc] = useState<ISODocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ISODocument | null>(null);
  const [form, setForm] = useState(emptyDocumentForm());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const fixtureVersion = localStorage.getItem(DOC_FIXTURE_VERSION_KEY);
      const raw = localStorage.getItem(DOCS_STORAGE_KEY);
      const saved: ISODocument[] = raw ? JSON.parse(raw) : [];

      if (fixtureVersion !== DOC_FIXTURE_VERSION) {
        setDocuments(INITIAL_DOCUMENTS);
        localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
        localStorage.setItem(DOC_FIXTURE_VERSION_KEY, DOC_FIXTURE_VERSION);
      } else {
        setDocuments(saved.length ? saved : INITIAL_DOCUMENTS);
      }

      setCategories(loadDocumentCategories());
    } catch {
      setDocuments(INITIAL_DOCUMENTS);
      setCategories(BUILTIN_DOCUMENT_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    if (documents.length === 0) return;
    try {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(documents));
      applyPipelineSync(undefined, documents);
    } catch {
      /* ignore */
    }
  }, [documents]);

  const scopedDocuments = useMemo(
    () => documents.filter((d) => matchesProject(d.linkedTo?.projectId ?? 'popy')),
    [documents, matchesProject]
  );

  const stats = useMemo(() => computeDocumentationStats(scopedDocuments), [scopedDocuments]);

  const documentCounts = stats.byCategory;

  const goList = () => {
    setPageMode('list');
    setSelectedDoc(null);
    setPreviewDoc(null);
  };

  const openCreate = () => {
    setForm(emptyDocumentForm(filterCategory !== 'all' ? filterCategory : 'pilotage'));
    setSelectedDoc(null);
    setPageMode('create');
  };

  const openView = (doc: ISODocument) => {
    setSelectedDoc(doc);
    setPageMode('view');
  };

  const openEdit = (doc: ISODocument) => {
    setSelectedDoc(doc);
    setForm(documentToFormValues(doc));
    setPageMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = buildDocumentFromForm(
      form,
      pageMode === 'edit' ? selectedDoc ?? undefined : undefined,
      projectId
    );
    if (pageMode === 'create') {
      setDocuments((prev) => [...prev, next]);
      goList();
    } else {
      setDocuments((prev) => prev.map((d) => (d.id === next.id ? next : d)));
      setSelectedDoc(next);
      setPageMode('view');
    }
    setForm(emptyDocumentForm());
  };

  const removeDoc = (doc: ISODocument) => {
    if (!window.confirm(`Supprimer « ${doc.title} » ?`)) return;
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    goList();
  };

  const persistCategories = (next: DocumentCategoryDef[]) => {
    const merged = mergeCategories(next);
    setCategories(merged);
    saveCustomCategories(merged);
  };

  const handleAddCategory = (category: DocumentCategoryDef) => {
    persistCategories([...categories, category]);
  };

  const handleUpdateCategory = (category: DocumentCategoryDef) => {
    persistCategories(categories.map((c) => (c.id === category.id ? category : c)));
  };

  const handleDeleteCategory = (id: string) => {
    const inUse = scopedDocuments.some((d) => d.category === id);
    if (inUse) {
      window.alert('Impossible : des documents utilisent encore cette catégorie.');
      return;
    }
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    persistCategories(categories.filter((c) => c.id !== id));
  };

  const goLibraryWithCategory = (categoryId: string) => {
    setFilterCategory(categoryId);
    setActiveTab('library');
  };

  if (pageMode === 'create' || pageMode === 'edit') {
    return (
      <DocumentFormPage
        mode={pageMode}
        form={form}
        categories={categories}
        stages={scopedStages.map((s) => ({ id: s.id, name: s.name, order: s.order }))}
        projectId={projectId}
        onChange={setForm}
        onSubmit={handleSubmit}
        onBack={() => (pageMode === 'edit' && selectedDoc ? setPageMode('view') : goList())}
      />
    );
  }

  if (pageMode === 'view' && selectedDoc) {
    const doc = documents.find((d) => d.id === selectedDoc.id) ?? selectedDoc;
    return (
      <DocumentDetailPage
        doc={doc}
        categories={categories}
        onBack={goList}
        onEdit={() => openEdit(doc)}
        onDelete={() => removeDoc(doc)}
        showPreviewModal={!!previewDoc}
        onOpenPreviewModal={() => setPreviewDoc(doc)}
        onClosePreviewModal={() => setPreviewDoc(null)}
      />
    );
  }

  return (
    <ViewShell>
      <ViewHeader
        title="Documentation Projet"
        subtitle={
          activeProject
            ? `${activeProject.name} — ${stats.total} documents · ${categories.length} catégories`
            : 'Bibliothèque · ISO 9001 · traçabilité'
        }
        badge="Mémoire · ISO"
        theme="blue"
        actions={
          <ActionButton icon={Plus} onClick={openCreate}>
            Nouveau document
          </ActionButton>
        }
      />

      <div className="space-y-4 sm:space-y-5 min-w-0">
        <DocumentationTabNav
          activeTab={activeTab}
          onChange={setActiveTab}
          docCount={scopedDocuments.length}
        />

        {activeTab === 'overview' && (
          <DocumentationOverviewTab
            stats={stats}
            documents={scopedDocuments}
            categories={categories}
            onGoLibrary={() => setActiveTab('library')}
            onGoCompliance={() => setActiveTab('compliance')}
            onSelectCategory={goLibraryWithCategory}
            onViewDoc={openView}
            onPreviewDoc={(doc) => setPreviewDoc(doc)}
          />
        )}

        {activeTab === 'library' && (
          <DocumentationLibraryTab
            documents={scopedDocuments}
            categories={categories}
            filterCategory={filterCategory}
            searchQuery={searchQuery}
            onFilterCategory={setFilterCategory}
            onSearchQuery={setSearchQuery}
            onView={openView}
            onPreview={(doc) => setPreviewDoc(doc)}
            onEdit={openEdit}
            onDelete={removeDoc}
            onCreate={openCreate}
          />
        )}

        {activeTab === 'compliance' && (
          <DocumentationComplianceTab
            complianceRate={stats.complianceRate}
            onGoLibrary={() => setActiveTab('library')}
          />
        )}

        {activeTab === 'categories' && (
          <DocumentationCategoriesTab
            categories={categories}
            documentCounts={documentCounts}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'links' && (
          <DocumentationLinksTab documents={scopedDocuments} onViewDoc={openView} />
        )}
      </div>

      {previewDoc && pageMode === 'list' ? (
        <DocumentPreviewPanel
          doc={documents.find((d) => d.id === previewDoc.id) ?? previewDoc}
          open
          onClose={() => setPreviewDoc(null)}
        />
      ) : null}
    </ViewShell>
  );
}
