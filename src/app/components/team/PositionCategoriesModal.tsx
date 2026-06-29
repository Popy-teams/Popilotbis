import { useState } from 'react';
import { FolderKanban, FolderPlus, Trash2, X } from 'lucide-react';
import { ActionButton, AppIcon } from '../shared';
import {
  countCategoryUsage,
  isDefaultPositionCategory,
  normalizeCategoryLabel,
} from '../../utils/positionCategoryStore';

interface PositionCategoriesModalProps {
  categories: string[];
  positions: { category: string }[];
  members: { category: string }[];
  onClose: () => void;
  onAdd: (label: string) => void;
  onRemove: (label: string) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

export function PositionCategoriesModal({
  categories,
  positions,
  members,
  onClose,
  onAdd,
  onRemove,
}: PositionCategoriesModalProps) {
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeCategoryLabel(label);
    if (!normalized) {
      setError('Indiquez un nom de catégorie.');
      return;
    }
    if (categories.some((c) => c.toLowerCase() === normalized.toLowerCase())) {
      setError('Cette catégorie existe déjà.');
      return;
    }
    onAdd(normalized);
    setLabel('');
    setError('');
  };

  const tryRemove = (cat: string) => {
    const usage = countCategoryUsage(cat, positions, members);
    if (usage.positions > 0 || usage.members > 0) {
      setError(
        `Impossible de supprimer « ${cat} » : ${usage.positions} poste(s) et ${usage.members} membre(s) l'utilisent encore.`
      );
      setConfirmDelete(null);
      return;
    }
    if (confirmDelete === cat) {
      onRemove(cat);
      setConfirmDelete(null);
      setError('');
      return;
    }
    setConfirmDelete(cat);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-labelledby="categories-modal-title"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <AppIcon icon={FolderKanban} size="sm" />
            </div>
            <div className="min-w-0">
              <h2 id="categories-modal-title" className="font-semibold text-slate-900">
                Catégories de poste
              </h2>
              <p className="text-xs text-slate-500 truncate">Ajouter ou supprimer des regroupements</p>
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

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          <form onSubmit={submitAdd} className="space-y-3">
            <label htmlFor="category-label" className="block text-sm font-medium text-slate-700">
              Nouvelle catégorie
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="category-label"
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  setError('');
                }}
                className={`${inputClass} flex-1 min-w-0`}
                placeholder="Ex. Design & Expérience utilisateur"
              />
              <ActionButton
                type="submit"
                variant="primary"
                icon={FolderPlus}
                className="!rounded-xl shrink-0"
              >
                Ajouter
              </ActionButton>
            </div>
          </form>

          {error ? (
            <p role="alert" className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
              {error}
            </p>
          ) : null}

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Catégories existantes ({categories.length})
            </p>
            <ul className="space-y-2">
              {categories.map((cat) => {
                const usage = countCategoryUsage(cat, positions, members);
                const inUse = usage.positions > 0 || usage.members > 0;
                const isConfirming = confirmDelete === cat;

                return (
                  <li
                    key={cat}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 min-w-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 break-words">{cat}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {inUse
                          ? `${usage.positions} poste(s) · ${usage.members} membre(s)`
                          : isDefaultPositionCategory(cat)
                            ? 'Catégorie par défaut · libre'
                            : 'Aucune utilisation'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={inUse}
                      onClick={() => tryRemove(cat)}
                      title={
                        inUse
                          ? 'Réassignez les postes et membres avant de supprimer'
                          : isConfirming
                            ? 'Confirmer la suppression'
                            : 'Supprimer cette catégorie'
                      }
                      className={`inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        inUse
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                          : isConfirming
                            ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isConfirming ? 'Confirmer' : 'Supprimer'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
          <ActionButton type="button" variant="secondary" onClick={onClose} className="!rounded-xl w-full sm:w-auto sm:ml-auto">
            Fermer
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
