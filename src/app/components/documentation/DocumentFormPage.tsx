import { useState } from 'react';
import { FileText, FileUp, Info, Link2, Settings2, Trash2 } from 'lucide-react';
import type { DocumentCategoryDef } from '../../types/documents';
import type { ISODocumentType } from '../../types/documents';
import { readFileAsDataUrl, formatFileSize } from '../../data/documentationHelpers';
import { FormSelect } from '../shared';
import { PageBackHeader } from '../shared/PageBackHeader';
import { ViewShell } from '../shared';
import { DocumentPreviewPanel } from './DocumentPreviewPanel';
import type { DocumentFormValues } from './documentationPresentation';
import { buildDocumentFromForm, getDocumentTypeLabel } from './documentationPresentation';

const inputClass =
  'w-full px-3 sm:px-4 py-2.5 border border-stone-300 rounded-lg bg-white text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

const DOC_TYPES: ISODocumentType[] = [
  'plan-projet',
  'politique-qualite',
  'etude-faisabilite-technique',
  'budget',
  'strategie-marketing',
  'conception-fonctionnelle',
  'architecture',
  'procedure',
  'compte-rendu',
  'registre-risques',
  'autre',
];

interface DocumentFormPageProps {
  mode: 'create' | 'edit';
  form: DocumentFormValues;
  categories: DocumentCategoryDef[];
  stages: { id: string; name: string; order: number }[];
  projectId: string;
  onChange: (form: DocumentFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function DocumentFormPage({
  mode,
  form,
  categories,
  stages,
  projectId,
  onChange,
  onSubmit,
  onBack,
}: DocumentFormPageProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [section, setSection] = useState<'info' | 'file' | 'links'>('info');

  const previewDoc = buildDocumentFromForm(form, undefined, projectId);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    try {
      const attachment = await readFileAsDataUrl(file);
      onChange({ ...form, file: attachment });
      setSection('file');
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Erreur de lecture du fichier');
    }
    e.target.value = '';
  };

  return (
    <ViewShell>
      <PageBackHeader
        title={mode === 'create' ? 'Nouveau document' : 'Modifier le document'}
        subtitle="Métadonnées · fichier · contenu · liens pipeline"
        onBack={onBack}
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 min-w-0">
        <form onSubmit={onSubmit} className="xl:col-span-3 space-y-4">
          <div className="flex gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200 overflow-x-auto">
            <SectionTab active={section === 'info'} onClick={() => setSection('info')} icon={Info} label="Informations" />
            <SectionTab active={section === 'file'} onClick={() => setSection('file')} icon={FileUp} label="Fichier & contenu" />
            <SectionTab active={section === 'links'} onClick={() => setSection('links')} icon={Link2} label="Liens & options" />
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
            {section === 'info' ? (
              <>
                <Field label="Titre *">
                  <input required value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })} className={inputClass} placeholder="Nom du document" />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Type">
                    <select value={form.type} onChange={(e) => onChange({ ...form, type: e.target.value as ISODocumentType })} className={inputClass}>
                      {DOC_TYPES.map((t) => (
                        <option key={t} value={t}>{getDocumentTypeLabel(t)}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Catégorie">
                    <select value={form.categoryId} onChange={(e) => onChange({ ...form, categoryId: e.target.value })} className={inputClass}>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                {form.type === 'autre' ? (
                  <Field label="Libellé du type">
                    <input value={form.customTypeLabel} onChange={(e) => onChange({ ...form, customTypeLabel: e.target.value })} className={inputClass} placeholder="Contrat, note interne…" />
                  </Field>
                ) : null}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Statut">
                    <select value={form.status} onChange={(e) => onChange({ ...form, status: e.target.value as DocumentFormValues['status'] })} className={inputClass}>
                      <option value="draft">Brouillon</option>
                      <option value="validated">Validé</option>
                      <option value="obsolete">Obsolète</option>
                    </select>
                  </Field>
                  <Field label="Version">
                    <input value={form.version} onChange={(e) => onChange({ ...form, version: e.target.value })} className={inputClass} />
                  </Field>
                </div>
                <Field label="Responsable">
                  <input value={form.responsibleName} onChange={(e) => onChange({ ...form, responsibleName: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Description">
                  <textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} rows={3} className={inputClass} />
                </Field>
              </>
            ) : null}

            {section === 'file' ? (
              <>
                <label className="flex flex-col gap-3 cursor-pointer rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-5 hover:border-blue-400 transition-colors">
                  <span className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-medium w-fit mx-auto">
                    <FileUp className="w-4 h-4" /> Importer un fichier
                  </span>
                  <span className="text-xs text-stone-600 text-center">PDF · images · Office · tout format · max 8 Mo</span>
                  <input type="file" className="hidden" accept="*/*" onChange={handleFile} />
                </label>
                {form.file ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm">
                    <span className="text-stone-900 truncate flex items-center gap-2">
                      <FileText className="w-4 h-4 shrink-0 text-blue-700" />
                      {form.file.fileName} ({formatFileSize(form.file.size)})
                    </span>
                    <button type="button" onClick={() => onChange({ ...form, file: undefined })} className="p-1.5 text-red-700 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
                {fileError ? <p className="text-sm text-red-700">{fileError}</p> : null}
                <Field label="Contenu texte (aperçu)">
                  <textarea
                    value={form.content}
                    onChange={(e) => onChange({ ...form, content: e.target.value })}
                    rows={10}
                    className={`${inputClass} font-mono text-xs leading-relaxed`}
                    placeholder="Markdown ou texte brut pour l'aperçu intégré…"
                  />
                </Field>
              </>
            ) : null}

            {section === 'links' ? (
              <>
                <Field label="Étape pipeline liée">
                  <FormSelect value={form.stageId} onChange={(e) => onChange({ ...form, stageId: e.target.value })}>
                    <option value="">Aucune</option>
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>{stage.order}. {stage.name}</option>
                    ))}
                  </FormSelect>
                </Field>
                <label className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isCritical}
                    onChange={(e) => onChange({ ...form, isCritical: e.target.checked })}
                    className="mt-1 rounded border-stone-300"
                  />
                  <div>
                    <span className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                      <Settings2 className="w-4 h-4" /> Document critique
                    </span>
                    <p className="text-xs text-stone-600 mt-1">Bloque le passage d&apos;étape pipeline si absent ou non validé.</p>
                  </div>
                </label>
              </>
            ) : null}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button type="button" onClick={onBack} className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg text-stone-900 bg-white hover:bg-stone-50 font-medium">
              Annuler
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium">
              {mode === 'create' ? 'Créer le document' : 'Enregistrer'}
            </button>
          </div>
        </form>

        <div className="xl:col-span-2 hidden xl:block min-h-[480px] sticky top-4 self-start">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Aperçu en direct</p>
          <DocumentPreviewPanel doc={previewDoc} open embedded onClose={() => {}} />
        </div>
      </div>
    </ViewShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-800 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SectionTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Info;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
        active ? 'bg-white text-blue-900 shadow-sm border border-stone-200' : 'text-stone-600 hover:text-stone-900'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
}
