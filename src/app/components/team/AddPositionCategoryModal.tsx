import { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { ActionButton, AppIcon } from '../shared';
import { normalizeCategoryLabel } from '../../utils/positionCategoryStore';

interface AddPositionCategoryModalProps {
  existing: string[];
  onClose: () => void;
  onAdd: (label: string) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

export function AddPositionCategoryModal({ existing, onClose, onAdd }: AddPositionCategoryModalProps) {
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeCategoryLabel(label);
    if (!normalized) {
      setError('Indiquez un nom de catégorie.');
      return;
    }
    if (existing.some((c) => c.toLowerCase() === normalized.toLowerCase())) {
      setError('Cette catégorie existe déjà.');
      return;
    }
    onAdd(normalized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-labelledby="add-category-title"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <AppIcon icon={FolderPlus} size="sm" />
            </div>
            <div className="min-w-0">
              <h2 id="add-category-title" className="font-semibold text-slate-900">
                Nouvelle catégorie de poste
              </h2>
              <p className="text-xs text-slate-500 truncate">Regroupement pour organiser les fiches poste</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label htmlFor="category-label" className="block text-sm font-medium text-slate-700 mb-1.5">
              Nom de la catégorie *
            </label>
            <input
              id="category-label"
              autoFocus
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setError('');
              }}
              className={inputClass}
              placeholder="Ex. Design & Expérience utilisateur"
            />
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
            <ActionButton type="button" variant="secondary" onClick={onClose} className="!rounded-xl">
              Annuler
            </ActionButton>
            <ActionButton type="submit" variant="primary" icon={FolderPlus} className="!rounded-xl">
              Créer la catégorie
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
