import { useEffect, useState } from 'react';
import { FolderPlus, Pencil, Trash2, X } from 'lucide-react';
import {
  CATEGORY_COLOR_PRESETS,
  type BOMCategoryDefinition,
} from '../../../utils/budgetCategoryStore';

type ModalMode = 'create' | 'edit';

interface CategoryFormModalProps {
  open: boolean;
  mode: ModalMode;
  category?: BOMCategoryDefinition;
  canDelete?: boolean;
  onClose: () => void;
  onCreate: (label: string, colorIndex: number) => void;
  onUpdate: (id: string, label: string, colorIndex: number) => void;
  onDelete?: (id: string) => void;
}

export function CategoryFormModal({
  open,
  mode,
  category,
  canDelete,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryFormModalProps) {
  const [label, setLabel] = useState('');
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && category) {
      setLabel(category.label);
      const idx = CATEGORY_COLOR_PRESETS.findIndex((p) => p.gradient === category.gradient);
      setColorIndex(idx >= 0 ? idx : 0);
    } else {
      setLabel('');
      setColorIndex(Math.floor(Math.random() * CATEGORY_COLOR_PRESETS.length));
    }
  }, [open, mode, category]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    if (mode === 'edit' && category) {
      onUpdate(category.id, trimmed, colorIndex);
    } else {
      onCreate(trimmed, colorIndex);
    }
    onClose();
  };

  return (
    <div className="budget-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="budget-modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="category-modal-title"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 id="category-modal-title" className="text-lg font-bold text-slate-900">
                {mode === 'create' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
              </h2>
              <p className="text-sm text-slate-500">
                Ex. Cerveau & IA, Vision & Perception…
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="cat-label" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nom de la catégorie
            </label>
            <input
              id="cat-label"
              required
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Cerveau & IA"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <span className="block text-sm font-semibold text-slate-700 mb-2">Couleur</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLOR_PRESETS.map((preset, i) => (
                <button
                  key={preset.gradient}
                  type="button"
                  title={`Couleur ${i + 1}`}
                  onClick={() => setColorIndex(i)}
                  className={`budget-color-swatch bg-gradient-to-br ${preset.gradient} ${
                    colorIndex === i ? 'budget-color-swatch--selected' : ''
                  }`}
                  aria-pressed={colorIndex === i}
                />
              ))}
            </div>
            <div
              className={`mt-3 px-4 py-2 rounded-xl bg-gradient-to-r ${CATEGORY_COLOR_PRESETS[colorIndex].gradient} text-white text-sm font-semibold text-center`}
            >
              Aperçu — {label.trim() || 'Ma catégorie'}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            {mode === 'edit' && category && !category.isBuiltIn && canDelete && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(category.id);
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            )}
            <div className="flex-1 flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold shadow-sm"
              >
                {mode === 'create' ? (
                  <>
                    <FolderPlus className="w-4 h-4" />
                    Créer
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
