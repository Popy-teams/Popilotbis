import type { DocumentAttachment, DocumentCategoryDef, ISODocument } from '../types/documents';
import { DOCS_STORAGE_KEY } from '../utils/pipelineSync';

export const DOC_CATEGORIES_STORAGE_KEY = 'popilot:doc-categories-v1';
export const DOC_FIXTURE_VERSION_KEY = 'popilot:doc-fixture-version';
export const DOC_FIXTURE_VERSION = 'doc-v3-ui';
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

export const BUILTIN_DOCUMENT_CATEGORIES: DocumentCategoryDef[] = [
  { id: 'feasibility', label: 'Études & Faisabilité', color: 'blue', isBuiltin: true },
  { id: 'conception', label: 'Conception', color: 'violet', isBuiltin: true },
  { id: 'financial', label: 'Financier', color: 'emerald', isBuiltin: true },
  { id: 'marketing', label: 'Marketing & Communication', color: 'pink', isBuiltin: true },
  { id: 'hr', label: 'Ressources Humaines', color: 'amber', isBuiltin: true },
  { id: 'quality', label: 'Qualité', color: 'green', isBuiltin: true },
  { id: 'pilotage', label: 'Pilotage', color: 'indigo', isBuiltin: true },
];

export const CATEGORY_COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-900 border-blue-200',
  violet: 'bg-violet-100 text-violet-900 border-violet-200',
  emerald: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  pink: 'bg-pink-100 text-pink-900 border-pink-200',
  amber: 'bg-amber-100 text-amber-900 border-amber-200',
  green: 'bg-green-100 text-green-900 border-green-200',
  indigo: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  cyan: 'bg-cyan-100 text-cyan-900 border-cyan-200',
  rose: 'bg-rose-100 text-rose-900 border-rose-200',
  slate: 'bg-stone-100 text-stone-900 border-stone-200',
};

export function slugifyCategoryId(label: string): string {
  return `cat-${label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
}

export function loadDocumentCategories(): DocumentCategoryDef[] {
  try {
    const raw = localStorage.getItem(DOC_CATEGORIES_STORAGE_KEY);
    const custom: DocumentCategoryDef[] = raw ? JSON.parse(raw) : [];
    const map = new Map<string, DocumentCategoryDef>();
    for (const c of BUILTIN_DOCUMENT_CATEGORIES) map.set(c.id, c);
    for (const c of custom) if (!c.isBuiltin) map.set(c.id, c);
    return Array.from(map.values());
  } catch {
    return [...BUILTIN_DOCUMENT_CATEGORIES];
  }
}

export function saveCustomCategories(categories: DocumentCategoryDef[]): void {
  const custom = categories.filter((c) => !c.isBuiltin);
  localStorage.setItem(DOC_CATEGORIES_STORAGE_KEY, JSON.stringify(custom));
}

export function mergeCategories(
  saved: DocumentCategoryDef[],
  builtins = BUILTIN_DOCUMENT_CATEGORIES
): DocumentCategoryDef[] {
  const map = new Map<string, DocumentCategoryDef>();
  for (const c of builtins) map.set(c.id, c);
  for (const c of saved) map.set(c.id, c);
  return Array.from(map.values());
}

export function readFileAsDataUrl(file: File): Promise<DocumentAttachment> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error(`Fichier trop volumineux (max ${MAX_FILE_BYTES / 1024 / 1024} Mo)`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
      });
    };
    reader.onerror = () => reject(reader.error ?? new Error('Lecture du fichier impossible'));
    reader.readAsDataURL(file);
  });
}

export type PreviewKind = 'pdf' | 'image' | 'text' | 'unsupported' | 'empty';

export function getPreviewKind(doc: ISODocument): PreviewKind {
  const mime = doc.file?.mimeType ?? '';
  const dataUrl = doc.file?.dataUrl;
  const text = doc.file?.textContent ?? doc.content;
  if (dataUrl && mime === 'application/pdf') return 'pdf';
  if (dataUrl && mime.startsWith('image/')) return 'image';
  if (dataUrl && (mime.startsWith('text/') || mime === 'application/json')) return 'text';
  if (text?.trim()) return 'text';
  if (dataUrl) return 'unsupported';
  return 'empty';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function downloadDocumentFile(doc: ISODocument): void {
  if (!doc.file?.dataUrl) return;
  const a = document.createElement('a');
  a.href = doc.file.dataUrl;
  a.download = doc.file.fileName;
  a.click();
}

export { DOCS_STORAGE_KEY };
