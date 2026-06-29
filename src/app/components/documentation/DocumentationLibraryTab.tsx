import { FileText, Grid3X3, List, Plus } from 'lucide-react';
import { useState } from 'react';
import type { DocumentCategoryDef, ISODocument } from '../../types/documents';
import { getDocumentCategoryLabel } from '../../types/documents';
import { FormSelect, SearchField, ViewEmptyState } from '../shared';
import { DocumentLibraryCard } from './DocumentLibraryCard';
import { getCategoryBadgeClass, getCategoryIcon, type LibraryViewMode } from './documentationPresentation';

interface DocumentationLibraryTabProps {
  documents: ISODocument[];
  categories: DocumentCategoryDef[];
  filterCategory: string;
  searchQuery: string;
  onFilterCategory: (id: string) => void;
  onSearchQuery: (q: string) => void;
  onView: (doc: ISODocument) => void;
  onPreview: (doc: ISODocument) => void;
  onEdit: (doc: ISODocument) => void;
  onDelete: (doc: ISODocument) => void;
  onCreate: () => void;
}

export function DocumentationLibraryTab({
  documents,
  categories,
  filterCategory,
  searchQuery,
  onFilterCategory,
  onSearchQuery,
  onView,
  onPreview,
  onEdit,
  onDelete,
  onCreate,
}: DocumentationLibraryTabProps) {
  const [viewMode, setViewMode] = useState<LibraryViewMode>('grid');

  const filtered = documents
    .filter((d) => filterCategory === 'all' || d.category === filterCategory)
    .filter(
      (d) =>
        !searchQuery.trim() ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.file?.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.responsibleName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const byCategory = filtered.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
    },
    {} as Record<string, ISODocument[]>
  );

  const categoryOrder =
    filterCategory !== 'all'
      ? [filterCategory]
      : categories.map((c) => c.id).filter((id) => byCategory[id]?.length);

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchField
            wrapperClassName="flex-1 min-w-0"
            placeholder="Rechercher par titre, responsable, fichier…"
            value={searchQuery}
            onChange={(e) => onSearchQuery(e.target.value)}
          />
          <FormSelect
            value={filterCategory}
            onChange={(e) => onFilterCategory(e.target.value)}
            className="sm:min-w-[11rem]"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </FormSelect>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin max-w-full">
            <FilterPill active={filterCategory === 'all'} onClick={() => onFilterCategory('all')} label="Tous" />
            {categories.map((cat) => (
              <FilterPill
                key={cat.id}
                active={filterCategory === cat.id}
                onClick={() => onFilterCategory(cat.id)}
                label={cat.label}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex rounded-lg border border-stone-200 p-0.5 bg-stone-50">
              <ViewToggle active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={Grid3X3} label="Grille" />
              <ViewToggle active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={List} label="Liste" />
            </div>
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <ViewEmptyState
          icon={FileText}
          title="Aucun document"
          description="Importez un fichier (PDF, Office, image…) ou créez une fiche avec contenu texte."
          action={
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Nouveau document
            </button>
          }
        />
      ) : (
        categoryOrder.map((catId) => {
          const docs = byCategory[catId] ?? [];
          const catDef = categories.find((c) => c.id === catId);
          const CatIcon = getCategoryIcon(catId);
          return (
            <section key={catId} className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg border ${catDef ? getCategoryBadgeClass(catDef) : 'bg-stone-100'}`}>
                  <CatIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {getDocumentCategoryLabel(catId, categories)}
                </h3>
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                  {docs.length}
                </span>
              </div>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-3 gap-3'
                    : 'space-y-2 sm:space-y-3'
                }
              >
                {docs.map((doc) => (
                  <DocumentLibraryCard
                    key={doc.id}
                    doc={doc}
                    categories={categories}
                    variant={viewMode}
                    onView={() => onView(doc)}
                    onPreview={() => onPreview(doc)}
                    onEdit={() => onEdit(doc)}
                    onDelete={() => onDelete(doc)}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
        active
          ? 'bg-blue-700 text-white border-blue-700'
          : 'bg-white text-stone-800 border-stone-300 hover:border-blue-400'
      }`}
    >
      {label}
    </button>
  );
}

function ViewToggle({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Grid3X3;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${active ? 'bg-white shadow-sm text-blue-800' : 'text-stone-500 hover:text-stone-800'}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
