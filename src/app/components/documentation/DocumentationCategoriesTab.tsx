import { useState } from 'react';
import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import type { DocumentCategoryDef } from '../../types/documents';
import {
  CATEGORY_COLOR_CLASSES,
  slugifyCategoryId,
} from '../../data/documentationHelpers';
import { ViewSectionTitle } from '../shared';
import { getCategoryBadgeClass, getCategoryIcon } from './documentationPresentation';

const COLOR_OPTIONS = Object.keys(CATEGORY_COLOR_CLASSES);

interface DocumentationCategoriesTabProps {
  categories: DocumentCategoryDef[];
  documentCounts: Record<string, number>;
  onAddCategory: (category: DocumentCategoryDef) => void;
  onUpdateCategory: (category: DocumentCategoryDef) => void;
  onDeleteCategory: (id: string) => void;
}

export function DocumentationCategoriesTab({
  categories,
  documentCounts,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: DocumentationCategoriesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('slate');

  const customCount = categories.filter((c) => !c.isBuiltin).length;
  const totalDocs = Object.values(documentCounts).reduce((a, b) => a + b, 0);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setLabel('');
    setDescription('');
    setColor('slate');
  };

  const startEdit = (cat: DocumentCategoryDef) => {
    if (cat.isBuiltin) return;
    setEditingId(cat.id);
    setLabel(cat.label);
    setDescription(cat.description ?? '');
    setColor(cat.color);
    setShowForm(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    if (editingId) {
      onUpdateCategory({
        id: editingId,
        label: label.trim(),
        description: description.trim() || undefined,
        color,
      });
    } else {
      onAddCategory({
        id: slugifyCategoryId(label),
        label: label.trim(),
        description: description.trim() || undefined,
        color,
      });
    }
    resetForm();
  };

  return (
    <div className="space-y-5 min-w-0">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniMetric label="Catégories" value={String(categories.length)} />
        <MiniMetric label="Personnalisées" value={String(customCount)} />
        <MiniMetric label="Documents" value={String(totalDocs)} />
        <MiniMetric label="Système" value={String(categories.length - customCount)} />
      </div>

      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-5">
        <ViewSectionTitle
          icon={FolderPlus}
          title="Organisation documentaire"
          action={
            !showForm ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
              >
                <FolderPlus className="w-4 h-4" /> Nouvelle catégorie
              </button>
            ) : null
          }
        />
        <p className="text-sm text-stone-700 mt-2">
          Créez des familles sur mesure : juridique, partenaires, certification, etc.
        </p>
      </div>

      {showForm ? (
        <form
          onSubmit={submit}
          className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 space-y-3 shadow-sm"
        >
          <h4 className="font-semibold text-stone-900">
            {editingId ? 'Modifier la catégorie' : 'Créer une catégorie'}
          </h4>
          <input
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nom de la catégorie"
            className="w-full px-3 py-2.5 border border-stone-300 rounded-lg bg-white text-stone-900 text-sm"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnel)"
            rows={2}
            className="w-full px-3 py-2.5 border border-stone-300 rounded-lg bg-white text-stone-900 text-sm"
          />
          <div>
            <label className="text-xs font-medium text-stone-600 mb-2 block">Couleur</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                    CATEGORY_COLOR_CLASSES[c]
                  } ${color === c ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={resetForm} className="flex-1 py-2.5 border border-stone-300 rounded-lg text-stone-900 text-sm">
              Annuler
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-medium">
              {editingId ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.id);
          const count = documentCounts[cat.id] ?? 0;
          return (
            <div
              key={cat.id}
              className={`rounded-xl border p-4 min-w-0 shadow-sm ${getCategoryBadgeClass(cat)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-white/70 border border-white/80">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm leading-snug">{cat.label}</h4>
                    <span className="text-[10px] uppercase tracking-wide opacity-70">
                      {cat.isBuiltin ? 'Système' : 'Personnalisée'}
                    </span>
                  </div>
                </div>
                {!cat.isBuiltin ? (
                  <div className="flex gap-0.5 shrink-0">
                    <button type="button" onClick={() => startEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/50">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-white/50 text-red-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null}
              </div>
              {cat.description ? (
                <p className="text-xs mt-2 opacity-90 line-clamp-2 leading-relaxed">{cat.description}</p>
              ) : null}
              <div className="mt-3 pt-3 border-t border-black/5 flex items-end justify-between">
                <span className="text-2xl font-bold">{count}</span>
                <span className="text-[10px] opacity-80 pb-1">document{count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-sm">
      <p className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold">{label}</p>
      <p className="text-xl font-bold text-stone-900 mt-1">{value}</p>
    </div>
  );
}
