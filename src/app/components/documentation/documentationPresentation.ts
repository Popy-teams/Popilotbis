import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Brain,
  CheckCircle,
  DollarSign,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Link2,
  Megaphone,
  Target,
  Users,
} from 'lucide-react';
import type { DocumentCategoryDef, ISODocument, ISODocumentType } from '../../types/documents';
import { ISO_REQUIREMENTS, getDocumentCategoryLabel, getDocumentTypeColor, getDocumentTypeLabel } from '../../types/documents';
import { CATEGORY_COLOR_CLASSES, getPreviewKind } from '../../data/documentationHelpers';

export type DocumentationTab = 'overview' | 'library' | 'compliance' | 'categories' | 'links';
export type DocumentationPageMode = 'list' | 'create' | 'edit' | 'view' | 'preview';
export type LibraryViewMode = 'grid' | 'list';

export interface DocumentFormValues {
  title: string;
  type: ISODocumentType;
  customTypeLabel: string;
  categoryId: string;
  status: ISODocument['status'];
  responsibleName: string;
  version: string;
  description: string;
  stageId: string;
  content: string;
  isCritical: boolean;
  file: ISODocument['file'];
}

export interface DocumentationStats {
  total: number;
  validated: number;
  draft: number;
  obsolete: number;
  critical: number;
  withFile: number;
  complianceRate: number;
  complianceCompliant: number;
  complianceTotal: number;
  healthScore: number;
  byCategory: Record<string, number>;
}

export interface DocumentLinkSummary {
  stage?: boolean;
  tasks: number;
  decisions: number;
  risks: number;
  total: number;
}

export const BUILTIN_CATEGORY_ICONS: Record<string, LucideIcon> = {
  feasibility: BarChart3,
  conception: Brain,
  financial: DollarSign,
  marketing: Megaphone,
  hr: Users,
  quality: CheckCircle,
  pilotage: Target,
};

export function getCategoryIcon(categoryId: string): LucideIcon {
  return BUILTIN_CATEGORY_ICONS[categoryId] ?? FolderOpen;
}

export function getCategoryBadgeClass(category: DocumentCategoryDef): string {
  return CATEGORY_COLOR_CLASSES[category.color] ?? CATEGORY_COLOR_CLASSES.slate;
}

export function getCategoryAccentBar(color: string): string {
  const map: Record<string, string> = {
    blue: 'from-blue-500 to-indigo-500',
    violet: 'from-violet-500 to-purple-500',
    emerald: 'from-emerald-500 to-teal-500',
    pink: 'from-pink-500 to-rose-500',
    amber: 'from-amber-500 to-orange-500',
    green: 'from-green-500 to-emerald-500',
    indigo: 'from-indigo-500 to-blue-500',
    cyan: 'from-cyan-500 to-sky-500',
    rose: 'from-rose-500 to-pink-500',
    slate: 'from-stone-500 to-slate-500',
  };
  return map[color] ?? map.slate;
}

export function getFileIcon(doc: ISODocument): LucideIcon {
  const mime = doc.file?.mimeType ?? '';
  const name = doc.file?.fileName.toLowerCase() ?? '';
  if (mime.startsWith('image/')) return FileImage;
  if (mime.includes('sheet') || mime.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.csv'))
    return FileSpreadsheet;
  if (doc.content || doc.file?.textContent) return FileText;
  return File;
}

export function hasPreview(doc: ISODocument): boolean {
  return getPreviewKind(doc) !== 'empty';
}

export function computeDocumentationStats(documents: ISODocument[]): DocumentationStats {
  const byCategory: Record<string, number> = {};
  let validated = 0;
  let draft = 0;
  let obsolete = 0;
  let critical = 0;
  let withFile = 0;

  for (const doc of documents) {
    byCategory[doc.category] = (byCategory[doc.category] ?? 0) + 1;
    if (doc.status === 'validated') validated += 1;
    else if (doc.status === 'draft') draft += 1;
    else obsolete += 1;
    if (doc.isCritical) critical += 1;
    if (doc.file?.dataUrl || doc.content || doc.file?.textContent) withFile += 1;
  }

  const total = documents.length || 1;
  const complianceCompliant = ISO_REQUIREMENTS.filter((r) => r.status === 'compliant').length;
  const complianceTotal = ISO_REQUIREMENTS.length;
  const complianceRate = Math.round((complianceCompliant / complianceTotal) * 100);
  const healthScore = Math.round(
    ((validated / total) * 60 + (withFile / total) * 25 + (complianceRate / 100) * 15)
  );

  return {
    total: documents.length,
    validated,
    draft,
    obsolete,
    critical,
    withFile,
    complianceRate,
    complianceCompliant,
    complianceTotal,
    healthScore,
    byCategory,
  };
}

export function getDocumentLinkSummary(doc: ISODocument): DocumentLinkSummary {
  const linked = doc.linkedTo;
  const tasks = linked?.taskIds?.length ?? 0;
  const decisions = linked?.decisionIds?.length ?? 0;
  const risks = linked?.riskIds?.length ?? 0;
  const stage = !!linked?.stageId;
  return { stage, tasks, decisions, risks, total: (stage ? 1 : 0) + tasks + decisions + risks };
}

export function formatDocDate(date?: string): string {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return date;
  }
}

export function emptyDocumentForm(categoryId = 'pilotage'): DocumentFormValues {
  return {
    title: '',
    type: 'autre',
    customTypeLabel: '',
    categoryId,
    status: 'draft',
    responsibleName: '',
    version: '1.0',
    description: '',
    stageId: '',
    content: '',
    isCritical: false,
    file: undefined,
  };
}

export function documentToFormValues(doc: ISODocument): DocumentFormValues {
  return {
    title: doc.title,
    type: doc.type,
    customTypeLabel: doc.customTypeLabel ?? '',
    categoryId: doc.category,
    status: doc.status,
    responsibleName: doc.responsibleName ?? '',
    version: doc.version,
    description: doc.description ?? '',
    stageId: doc.linkedTo?.stageId ?? '',
    content: doc.content ?? doc.file?.textContent ?? '',
    isCritical: !!doc.isCritical,
    file: doc.file,
  };
}

export function buildDocumentFromForm(
  form: DocumentFormValues,
  base: ISODocument | undefined,
  projectId: string
): ISODocument {
  const today = new Date().toISOString().slice(0, 10);
  const file = form.file
    ? { ...form.file, textContent: form.content.trim() || form.file.textContent }
    : form.content.trim()
      ? {
          fileName: `${form.title || 'document'}.txt`,
          mimeType: 'text/plain',
          size: new Blob([form.content]).size,
          textContent: form.content,
        }
      : undefined;

  return {
    id: base?.id ?? `doc-${Date.now()}`,
    title: form.title,
    type: form.type,
    customTypeLabel: form.type === 'autre' ? form.customTypeLabel : undefined,
    category: form.categoryId,
    status: form.status,
    responsible: base?.responsible ?? 'user-local',
    responsibleName: form.responsibleName,
    version: form.version,
    description: form.description,
    content: form.content || undefined,
    file,
    createdAt: base?.createdAt ?? today,
    updatedAt: today,
    history: base?.history ?? [],
    linkedTo: {
      ...(base?.linkedTo ?? { projectId }),
      projectId,
      stageId: form.stageId || undefined,
    },
    isCritical: form.isCritical,
    validatedBy: base?.validatedBy,
    validatedAt: base?.validatedAt,
    validUntil: base?.validUntil,
    tags: base?.tags,
  };
}

export function statusLabel(status: ISODocument['status']): string {
  const map = { draft: 'Brouillon', validated: 'Validé', obsolete: 'Obsolète' };
  return map[status];
}

export function statusBadgeClass(status: ISODocument['status']): string {
  const map = {
    draft: 'bg-amber-100 text-amber-950 border-amber-200',
    validated: 'bg-emerald-100 text-emerald-950 border-emerald-200',
    obsolete: 'bg-stone-200 text-stone-700 border-stone-300',
  };
  return map[status];
}

export { getDocumentTypeLabel, getDocumentTypeColor, getDocumentCategoryLabel, Link2 };
