import { Plus, Trash2 } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10';

interface CompetenciesEditorProps {
  label?: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function CompetenciesEditor({
  label = 'Compétences',
  hint = 'Une compétence par ligne — ajoutez autant que nécessaire.',
  items,
  onChange,
  placeholder = 'Ex. Gestion projet agile',
}: CompetenciesEditorProps) {
  const add = () => onChange([...items, '']);
  const update = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div>
        <p className="block text-sm font-medium text-slate-700 mb-1">{label}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      {items.length === 0 ? (
        <button
          type="button"
          onClick={add}
          className="w-full rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 py-6 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une compétence
        </button>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => update(index, e.target.value)}
                  placeholder={placeholder}
                  className={`${inputClass} flex-1 min-w-0 !py-2`}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          >
            <Plus className="w-4 h-4" />
            Ajouter une compétence
          </button>
        </>
      )}
    </div>
  );
}

export function normalizeCompetencies(items: string[]) {
  return items.map((s) => s.trim()).filter(Boolean);
}
