import { Link2, Paperclip, Plus, Trash2 } from 'lucide-react';
import type { BudgetDocument, BudgetLink } from '../../../types/budget';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm';

export function BudgetLinksEditor({
  links,
  onChange,
}: {
  links: BudgetLink[];
  onChange: (links: BudgetLink[]) => void;
}) {
  const add = () => onChange([...links, { id: `link-${Date.now()}`, label: '', url: '' }]);
  const update = (id: string, patch: Partial<BudgetLink>) =>
    onChange(links.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const remove = (id: string) => onChange(links.filter((l) => l.id !== id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <Link2 className="w-4 h-4" /> Liens
        </span>
        <button type="button" onClick={add} className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
      {links.length === 0 && <p className="text-xs text-slate-400">Aucun lien — ajoutez une URL utile</p>}
      {links.map((link) => (
        <div key={link.id} className="flex flex-col sm:flex-row gap-2">
          <input
            placeholder="Libellé"
            value={link.label}
            onChange={(e) => update(link.id, { label: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="https://…"
            type="url"
            value={link.url}
            onChange={(e) => update(link.id, { url: e.target.value })}
            className={`${inputClass} sm:flex-[2]`}
          />
          <button type="button" onClick={() => remove(link.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg self-end sm:self-auto">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function BudgetDocumentsEditor({
  documents,
  onChange,
}: {
  documents: BudgetDocument[];
  onChange: (docs: BudgetDocument[]) => void;
}) {
  const add = () =>
    onChange([
      ...documents,
      { id: `doc-${Date.now()}`, name: '', url: '', uploadedAt: new Date().toISOString().slice(0, 10) },
    ]);
  const update = (id: string, patch: Partial<BudgetDocument>) =>
    onChange(documents.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const remove = (id: string) => onChange(documents.filter((d) => d.id !== id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <Paperclip className="w-4 h-4" /> Documents
        </span>
        <button type="button" onClick={add} className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
      {documents.length === 0 && <p className="text-xs text-slate-400">Aucun document — ajoutez un nom et une URL</p>}
      {documents.map((doc) => (
        <div key={doc.id} className="flex flex-col sm:flex-row gap-2">
          <input
            placeholder="Nom du fichier"
            value={doc.name}
            onChange={(e) => update(doc.id, { name: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="URL ou lien de téléchargement"
            value={doc.url}
            onChange={(e) => update(doc.id, { url: e.target.value })}
            className={`${inputClass} sm:flex-[2]`}
          />
          <button type="button" onClick={() => remove(doc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function BudgetLinksList({ links }: { links?: BudgetLink[] }) {
  if (!links?.length) return null;
  return (
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l.id}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline"
          >
            <Link2 className="w-4 h-4 shrink-0" />
            {l.label || l.url}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function BudgetDocumentsList({ documents }: { documents?: BudgetDocument[] }) {
  if (!documents?.length) return null;
  return (
    <ul className="space-y-2">
      {documents.map((d) => (
        <li key={d.id}>
          <a
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-slate-700 hover:text-emerald-700 rounded-lg border border-slate-200 px-3 py-2 hover:border-emerald-200"
          >
            <Paperclip className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="font-medium truncate">{d.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
