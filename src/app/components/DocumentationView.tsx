import { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Eye,
  Download,
  Clock,
  Shield,
  Search,
  Link2,
  Target,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Check,
  X,
  DollarSign,
  Brain,
  Bot,
  BarChart3,
  Megaphone,
  Users,
  Pencil,
  Trash2,
} from 'lucide-react';
import { PageBackHeader } from './shared/PageBackHeader';
import { useProjectContext } from '../context/ProjectContext';
import { usePipeline } from '../context/PipelineContext';
import { applyPipelineSync, DOCS_STORAGE_KEY } from '../utils/pipelineSync';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, StatIcon, IconButton, ActionButton, IconLabel, FormSelect, SearchField, ViewStatCard, ViewStatsGrid } from './shared';
import type { LucideIcon } from 'lucide-react';
import {
  ISODocument,
  ISODocumentType,
  DocumentCategory,
  ISO_REQUIREMENTS,
  getDocumentTypeLabel,
  getDocumentTypeColor,
  getDocumentCategoryLabel,
  isCriticalDocumentMissing,
} from '../types/documents';

const DOCUMENT_CATEGORY_ICONS: Record<DocumentCategory, LucideIcon> = {
  feasibility: BarChart3,
  conception: Brain,
  financial: DollarSign,
  marketing: Megaphone,
  hr: Users,
  quality: CheckCircle,
  pilotage: Target,
};

type DocPageMode = 'list' | 'create' | 'view' | 'edit';

const emptyDocForm = {
  title: '',
  type: 'plan-projet' as ISODocumentType,
  category: 'pilotage' as DocumentCategory,
  status: 'draft' as ISODocument['status'],
  responsibleName: '',
  version: '1.0',
  description: '',
  stageId: '',
};

export const INITIAL_DOCUMENTS: ISODocument[] = [
    // === QUALITÉ & PILOTAGE ===
    {
      id: 'doc-1',
      title: 'Politique Qualité POPILOT',
      type: 'politique-qualite',
      category: 'quality',
      status: 'validated',
      responsible: 'user-1',
      responsibleName: 'Jean Dupont',
      version: '2.1',
      validUntil: '2026-12-31',
      description: 'Politique qualité de l\'entreprise conforme ISO 9001',
      createdAt: '2025-01-15',
      updatedAt: '2026-01-10',
      validatedBy: 'Direction',
      validatedAt: '2026-01-10',
      history: [
        { version: '2.1', date: '2026-01-10', author: 'Jean Dupont', changes: 'Mise à jour objectifs 2026' },
      ],
      linkedTo: { projectId: 'popy' },
      isCritical: true,
    },
    {
      id: 'doc-2',
      title: 'Plan Projet POPY',
      type: 'plan-projet',
      category: 'pilotage',
      status: 'validated',
      responsible: 'user-1',
      responsibleName: 'Jean Dupont',
      version: '3.4',
      validUntil: '2026-06-30',
      description: 'Plan complet du projet POPY avec jalons et livrables',
      createdAt: '2025-10-01',
      updatedAt: '2026-01-15',
      validatedBy: 'Comité pilotage',
      validatedAt: '2026-01-05',
      history: [],
      linkedTo: { projectId: 'popy', stageId: 'stage-1' },
      isCritical: true,
    },
    {
      id: 'doc-3',
      title: 'Registre des Risques POPY',
      type: 'registre-risques',
      category: 'pilotage',
      status: 'validated',
      responsible: 'user-7',
      responsibleName: 'Aline Moreau',
      version: '1.8',
      description: 'Registre complet des risques identifiés et plans de mitigation',
      createdAt: '2025-10-15',
      updatedAt: '2026-01-16',
      validatedBy: 'Responsable Qualité',
      validatedAt: '2026-01-16',
      history: [],
      linkedTo: { projectId: 'popy', riskIds: ['risk-1', 'risk-2', 'risk-3'] },
      isCritical: true,
    },
    // === ÉTUDES & FAISABILITÉ ===
    {
      id: 'doc-4',
      title: 'Étude de Faisabilité Technique POPY',
      type: 'etude-faisabilite-technique',
      category: 'feasibility',
      status: 'validated',
      responsible: 'user-2',
      responsibleName: 'Alice Chevalier',
      version: '1.0',
      description: 'Analyse complète de la faisabilité technique : hardware, IA, capteurs',
      createdAt: '2025-09-01',
      updatedAt: '2025-10-15',
      validatedBy: 'Comité technique',
      validatedAt: '2025-10-15',
      history: [],
      linkedTo: { projectId: 'popy', stageId: 'stage-1', decisionIds: ['dec-1'] },
      isCritical: true,
    },
    {
      id: 'doc-5',
      title: 'Étude de Marché - Robots Éducatifs IA',
      type: 'etude-marche',
      category: 'feasibility',
      status: 'validated',
      responsible: 'user-1',
      responsibleName: 'Jean Dupont',
      version: '1.2',
      description: 'Analyse du marché des robots éducatifs avec IA, taille, concurrence',
      createdAt: '2025-08-01',
      updatedAt: '2025-09-20',
      validatedBy: 'Direction Marketing',
      validatedAt: '2025-09-20',
      history: [],
      linkedTo: { projectId: 'popy' },
      tags: ['marché', 'concurrence', 'opportunité'],
    },
    {
      id: 'doc-6',
      title: 'Analyse des Besoins Utilisateurs',
      type: 'analyse-besoins',
      category: 'feasibility',
      status: 'validated',
      responsible: 'user-5',
      responsibleName: 'Marie Laurent',
      version: '2.0',
      description: 'Besoins des parents et enfants (3-8 ans), persona, journeys',
      createdAt: '2025-08-15',
      updatedAt: '2025-10-01',
      validatedBy: 'Équipe UX',
      validatedAt: '2025-10-01',
      history: [],
      linkedTo: { projectId: 'popy', taskIds: ['task-1', 'task-2'] },
    },
    // === CONCEPTION ===
    {
      id: 'doc-7',
      title: 'Conception Fonctionnelle POPY',
      type: 'conception-fonctionnelle',
      category: 'conception',
      status: 'validated',
      responsible: 'user-5',
      responsibleName: 'Marie Laurent',
      version: '3.1',
      description: 'Spécifications fonctionnelles détaillées, user stories, wireframes',
      createdAt: '2025-10-20',
      updatedAt: '2026-01-10',
      validatedBy: 'Product Owner',
      validatedAt: '2026-01-10',
      history: [],
      linkedTo: { projectId: 'popy', stageId: 'stage-2', taskIds: ['task-4', 'task-5'] },
      isCritical: true,
    },
    {
      id: 'doc-8',
      title: 'Architecture Technique POPY',
      type: 'architecture',
      category: 'conception',
      status: 'validated',
      responsible: 'user-3',
      responsibleName: 'Thomas Serrano',
      version: '2.5',
      description: 'Architecture globale : Raspberry Pi, capteurs ToF, IA embarquée, cloud',
      createdAt: '2025-11-01',
      updatedAt: '2026-01-12',
      validatedBy: 'Architecte technique',
      validatedAt: '2026-01-12',
      history: [],
      linkedTo: { projectId: 'popy', stageId: 'stage-2', decisionIds: ['dec-2', 'dec-3'] },
      isCritical: true,
    },
    {
      id: 'doc-9',
      title: 'Cas d\'Usage et Scénarios',
      type: 'cas-usage',
      category: 'conception',
      status: 'draft',
      responsible: 'user-5',
      responsibleName: 'Marie Laurent',
      version: '1.0-draft',
      description: 'Cas d\'usage détaillés : jeu, apprentissage, feedback émotionnel',
      createdAt: '2026-01-05',
      updatedAt: '2026-01-16',
      history: [],
      linkedTo: { projectId: 'popy', stageId: 'stage-2' },
    },
    // === FINANCIER ===
    {
      id: 'doc-10',
      title: 'Étude Financière Prévisionnelle POPY',
      type: 'etude-financiere-previsionnelle',
      category: 'financial',
      status: 'validated',
      responsible: 'user-1',
      responsibleName: 'Jean Dupont',
      version: '1.1',
      description: 'Business plan, prévisionnel sur 3 ans, seuil de rentabilité',
      createdAt: '2025-09-10',
      updatedAt: '2025-10-25',
      validatedBy: 'Direction Financière',
      validatedAt: '2025-10-25',
      history: [],
      linkedTo: { projectId: 'popy' },
      isCritical: true,
    },
    {
      id: 'doc-11',
      title: 'Budget Détaillé POPY 2026',
      type: 'budget',
      category: 'financial',
      status: 'validated',
      responsible: 'user-1',
      responsibleName: 'Jean Dupont',
      version: '2.0',
      validUntil: '2026-12-31',
      description: 'Budget 2026 : CAPEX, OPEX, salaires, achats hardware',
      createdAt: '2025-12-01',
      updatedAt: '2026-01-05',
      validatedBy: 'Direction',
      validatedAt: '2026-01-05',
      history: [],
      linkedTo: { projectId: 'popy', stageId: 'stage-1' },
      isCritical: true,
    },
    {
      id: 'doc-12',
      title: 'Suivi Financier Q1 2026',
      type: 'suivi-financier',
      category: 'financial',
      status: 'draft',
      responsible: 'user-1',
      responsibleName: 'Jean Dupont',
      version: '1.0-draft',
      description: 'Suivi budgétaire T1 2026 avec analyse des écarts',
      createdAt: '2026-01-02',
      updatedAt: '2026-01-16',
      history: [],
      linkedTo: { projectId: 'popy' },
    },
    // === MARKETING & COMMUNICATION ===
    {
      id: 'doc-13',
      title: 'Stratégie Marketing POPY',
      type: 'strategie-marketing',
      category: 'marketing',
      status: 'validated',
      responsible: 'user-1',
      responsibleName: 'Jean Dupont',
      version: '1.0',
      description: 'Positionnement, cibles, proposition de valeur, canaux de distribution',
      createdAt: '2025-09-15',
      updatedAt: '2025-10-20',
      validatedBy: 'Direction Marketing',
      validatedAt: '2025-10-20',
      history: [],
      linkedTo: { projectId: 'popy' },
    },
    {
      id: 'doc-14',
      title: 'Plan de Communication POPY',
      type: 'plan-communication',
      category: 'marketing',
      status: 'draft',
      responsible: 'user-6',
      responsibleName: 'Paul Leblanc',
      version: '0.5-draft',
      description: 'Plan de communication : messages, canaux, calendrier éditorial',
      createdAt: '2026-01-10',
      updatedAt: '2026-01-16',
      history: [],
      linkedTo: { projectId: 'popy' },
    },
    // === RH ===
    {
      id: 'doc-15',
      title: 'Plan de Recrutement POPY 2026',
      type: 'plan-recrutement',
      category: 'hr',
      status: 'validated',
      responsible: 'user-7',
      responsibleName: 'Aline Moreau',
      version: '1.0',
      description: 'Profils recherchés : dev IA, ingénieur hardware, designer',
      createdAt: '2025-11-01',
      updatedAt: '2025-12-15',
      validatedBy: 'DRH',
      validatedAt: '2025-12-15',
      history: [],
      linkedTo: { projectId: 'popy' },
    },
    {
      id: 'doc-16',
      title: 'Plan de Formation & Compétences',
      type: 'plan-formation',
      category: 'hr',
      status: 'draft',
      responsible: 'user-7',
      responsibleName: 'Aline Moreau',
      version: '1.0-draft',
      description: 'Plan de montée en compétences de l\'équipe POPY',
      createdAt: '2026-01-08',
      updatedAt: '2026-01-16',
      history: [],
      linkedTo: { projectId: 'popy', taskIds: ['task-onboarding'] },
    },
  ];

export function DocumentationView() {
  const { matchesProject, activeProjectSlug } = useProjectContext();
  const { scopedStages } = usePipeline();
  const [activeTab, setActiveTab] = useState<'library' | 'compliance' | 'links'>('library');
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageMode, setPageMode] = useState<DocPageMode>('list');
  const [documents, setDocuments] = useState<ISODocument[]>(INITIAL_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<ISODocument | null>(null);
  const [form, setForm] = useState(emptyDocForm);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DOCS_STORAGE_KEY);
      if (raw) {
        setDocuments(JSON.parse(raw));
      } else {
        setDocuments(INITIAL_DOCUMENTS);
        localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(documents));
      applyPipelineSync(undefined, documents);
    } catch {}
  }, [documents]);

  const toDocument = (base?: ISODocument): ISODocument => ({
    id: base?.id ?? `doc-${Date.now()}`,
    title: form.title,
    type: form.type,
    category: form.category,
    status: form.status,
    responsible: base?.responsible ?? 'user-local',
    responsibleName: form.responsibleName,
    version: form.version,
    description: form.description,
    createdAt: base?.createdAt ?? new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    history: base?.history ?? [],
    linkedTo: {
      ...(base?.linkedTo ?? { projectId: activeProjectSlug ?? 'popy' }),
      stageId: form.stageId || undefined,
    },
    isCritical: base?.isCritical,
    validatedBy: base?.validatedBy,
    validatedAt: base?.validatedAt,
    validUntil: base?.validUntil,
  });

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const next = toDocument(pageMode === 'edit' ? selectedDoc ?? undefined : undefined);
    if (pageMode === 'create') {
      setDocuments((prev) => [...prev, next]);
    } else {
      setDocuments((prev) => prev.map((d) => (d.id === next.id ? next : d)));
      setSelectedDoc(next);
    }
    setPageMode('list');
    setForm(emptyDocForm);
  };

  const removeDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedDoc(null);
    setPageMode('list');
  };

  const openCreate = () => {
    setForm(emptyDocForm);
    setSelectedDoc(null);
    setPageMode('create');
  };

  const openView = (doc: ISODocument) => {
    setSelectedDoc(doc);
    setPageMode('view');
  };

  const openEdit = (doc: ISODocument) => {
    setSelectedDoc(doc);
    setForm({
      title: doc.title,
      type: doc.type,
      category: doc.category,
      status: doc.status,
      responsibleName: doc.responsibleName ?? '',
      version: doc.version,
      description: doc.description ?? '',
      stageId: doc.linkedTo?.stageId ?? '',
    });
    setPageMode('edit');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'draft':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'obsolete':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'incomplete':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const docFormPage = (
    <ViewShell narrow>
      <PageBackHeader
        title={pageMode === 'create' ? 'Nouveau document' : 'Modifier le document'}
        onBack={() => setPageMode(selectedDoc ? 'view' : 'list')}
      />
      <form onSubmit={submitForm} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Titre *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ISODocumentType })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="plan-projet">Plan projet</option>
              <option value="etude-faisabilite-technique">Étude faisabilité</option>
              <option value="budget">Budget</option>
              <option value="strategie-marketing">Stratégie marketing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as DocumentCategory })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="feasibility">Études & Faisabilité</option>
              <option value="conception">Conception</option>
              <option value="financial">Financier</option>
              <option value="marketing">Marketing</option>
              <option value="hr">RH</option>
              <option value="quality">Qualité</option>
              <option value="pilotage">Pilotage</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ISODocument['status'] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="draft">Brouillon</option>
              <option value="validated">Validé</option>
              <option value="obsolete">Obsolète</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Version</label>
            <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Responsable</label>
          <input value={form.responsibleName} onChange={(e) => setForm({ ...form, responsibleName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Étape pipeline liée</label>
          <FormSelect value={form.stageId} onChange={(e) => setForm({ ...form, stageId: e.target.value })}>
            <option value="">Aucune</option>
            {scopedStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.order}. {stage.name}
              </option>
            ))}
          </FormSelect>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setPageMode(selectedDoc ? 'view' : 'list')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Annuler</button>
          <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{pageMode === 'create' ? 'Créer' : 'Enregistrer'}</button>
        </div>
      </form>
    </ViewShell>
  );

  if (pageMode === 'create' || pageMode === 'edit') return docFormPage;

  if (pageMode === 'view' && selectedDoc) {
    const doc = documents.find((d) => d.id === selectedDoc.id) ?? selectedDoc;
    return (
      <ViewShell narrow>
        <PageBackHeader
          title={doc.title}
          subtitle={getDocumentTypeLabel(doc.type)}
          onBack={() => { setPageMode('list'); setSelectedDoc(null); }}
          actions={
            <div className="flex gap-2">
              <button type="button" onClick={() => openEdit(doc)} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"><Pencil className="w-4 h-4" /> Modifier</button>
              <button type="button" onClick={() => removeDoc(doc.id)} className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /> Supprimer</button>
            </div>
          }
        />
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center gap-2">{getStatusIcon(doc.status)}<span className={`px-3 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(doc.type)}`}>{getDocumentTypeLabel(doc.type)}</span></div>
          {doc.description && <p className="text-gray-600">{doc.description}</p>}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Version</span><p className="font-medium">{doc.version}</p></div>
            <div><span className="text-gray-500">Responsable</span><p className="font-medium">{doc.responsibleName}</p></div>
            <div><span className="text-gray-500">Catégorie</span><p className="font-medium flex items-center gap-1.5"><AppIcon icon={DOCUMENT_CATEGORY_ICONS[doc.category]} size="sm" className="text-blue-600" />{getDocumentCategoryLabel(doc.category)}</p></div>
            {doc.validatedBy && <div className="flex items-center gap-1 text-green-600"><Check className="w-4 h-4" /> Validé par {doc.validatedBy}</div>}
          </div>
        </div>
      </ViewShell>
    );
  }

  // Statistiques par catégorie
  const scopedDocuments = useMemo(
    () => documents.filter((d) => matchesProject(d.linkedTo?.projectId ?? 'popy')),
    [documents, matchesProject]
  );

  const stats = {
    total: scopedDocuments.length,
    validated: scopedDocuments.filter((d) => d.status === 'validated').length,
    draft: scopedDocuments.filter((d) => d.status === 'draft').length,
    obsolete: scopedDocuments.filter((d) => d.status === 'obsolete').length,
    critical: scopedDocuments.filter((d) => d.isCritical).length,
  };

  const statsByCategory = {
    feasibility: scopedDocuments.filter((d) => d.category === 'feasibility').length,
    conception: scopedDocuments.filter((d) => d.category === 'conception').length,
    financial: scopedDocuments.filter((d) => d.category === 'financial').length,
    marketing: scopedDocuments.filter((d) => d.category === 'marketing').length,
    hr: scopedDocuments.filter((d) => d.category === 'hr').length,
    quality: scopedDocuments.filter((d) => d.category === 'quality').length,
    pilotage: scopedDocuments.filter((d) => d.category === 'pilotage').length,
  };

  const complianceStats = {
    compliant: ISO_REQUIREMENTS.filter((r) => r.status === 'compliant').length,
    incomplete: ISO_REQUIREMENTS.filter((r) => r.status === 'incomplete').length,
    missing: ISO_REQUIREMENTS.filter((r) => r.status === 'missing').length,
  };

  const filteredDocuments = scopedDocuments
    .filter((doc) => filterCategory === 'all' || doc.category === filterCategory)
    .filter((doc) =>
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Grouper les documents par catégorie
  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<DocumentCategory, ISODocument[]>);

  return (
    <ViewShell>
      <ViewHeader
        title="Documentation Projet"
        subtitle="Mémoire stratégique — études, faisabilité, conception, financier, marketing, RH, qualité & pilotage"
        badge="Mémoire · ISO"
        theme="blue"
        actions={<ActionButton icon={Plus} onClick={openCreate}>Nouveau document</ActionButton>}
      />

      <ViewStatsGrid cols={5}>
        <ViewStatCard label="Total documents" value={String(stats.total)} gradient="from-blue-500 to-indigo-500" icon={FileText} />
        <ViewStatCard label="Validés" value={String(stats.validated)} gradient="from-emerald-500 to-teal-500" icon={CheckCircle} />
        <ViewStatCard label="Brouillons" value={String(stats.draft)} gradient="from-amber-500 to-orange-500" icon={Clock} />
        <ViewStatCard label="Critiques" value={String(stats.critical)} gradient="from-red-500 to-rose-500" icon={AlertCircle} />
        <ViewStatCard
          label="Conformité ISO"
          value={`${Math.round((complianceStats.compliant / ISO_REQUIREMENTS.length) * 100)}%`}
          gradient="from-violet-500 to-purple-500"
          icon={Shield}
        />
      </ViewStatsGrid>

      {/* Stats par catégorie */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 text-lg mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Répartition par catégorie documentaire
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(statsByCategory).map(([category, count]) => {
            const cat = category as DocumentCategory;
            const CategoryIcon = DOCUMENT_CATEGORY_ICONS[cat];
            return (
            <div key={category} className="bg-white rounded-lg p-3 border border-blue-200 text-center">
              <div className="flex justify-center mb-2">
                <StatIcon icon={CategoryIcon} className="text-blue-600 bg-blue-50" />
              </div>
              <div className="text-xs text-gray-600 mb-1">
                {getDocumentCategoryLabel(cat)}
              </div>
              <div className="text-lg font-bold text-blue-600">{count}</div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'library'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5 inline mr-2" />
              Bibliothèque complète
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'compliance'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Conformité ISO 9001
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'links'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Link2 className="w-5 h-5 inline mr-2" />
              Liens automatiques
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tab: Bibliothèque */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              {/* Filtres et recherche */}
              <div className="filter-toolbar">
                <SearchField
                  wrapperClassName="filter-toolbar-grow"
                  placeholder="Rechercher un document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FormSelect
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as DocumentCategory | 'all')}
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="feasibility">Études & Faisabilité</option>
                  <option value="conception">Conception</option>
                  <option value="financial">Financier</option>
                  <option value="marketing">Marketing & Communication</option>
                  <option value="hr">Ressources Humaines</option>
                  <option value="quality">Qualité</option>
                  <option value="pilotage">Pilotage</option>
                </FormSelect>
              </div>

              {/* Documents groupés par catégorie */}
              {Object.entries(documentsByCategory).map(([category, docs]) => (
                <div key={category}>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AppIcon icon={DOCUMENT_CATEGORY_ICONS[category as DocumentCategory]} size="md" className="text-blue-600" />
                    {getDocumentCategoryLabel(category as DocumentCategory)}
                    <span className="text-sm font-normal text-gray-500">
                      ({docs.length} document{docs.length > 1 ? 's' : ''})
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(doc.status)}
                              <h4 className="text-lg font-bold text-gray-900">{doc.title}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(doc.type)}`}>
                                {getDocumentTypeLabel(doc.type)}
                              </span>
                              {doc.isCritical && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold border border-red-200 inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> CRITIQUE
                                </span>
                              )}
                            </div>
                            {doc.description && (
                              <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                            )}
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <span>Version : <strong>{doc.version}</strong></span>
                              <span>Responsable : <strong>{doc.responsibleName}</strong></span>
                              {doc.validUntil && (
                                <span>
                                  Valide jusqu'au :{' '}
                                  <strong>{new Date(doc.validUntil).toLocaleDateString('fr-FR')}</strong>
                                </span>
                              )}
                              {doc.validatedBy && (
                                <span className="text-green-600 inline-flex items-center gap-1">
                                  <Check className="w-4 h-4" /> Validé par {doc.validatedBy}
                                </span>
                              )}
                            </div>
                            {/* Liens */}
                            {doc.linkedTo && (
                              <div className="mt-3 flex items-center gap-2 text-xs">
                                <Link2 className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-600 font-medium">Lié à :</span>
                                {doc.linkedTo.stageId && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                    Étape pipeline
                                  </span>
                                )}
                                {doc.linkedTo.taskIds && doc.linkedTo.taskIds.length > 0 && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    {doc.linkedTo.taskIds.length} tâche(s)
                                  </span>
                                )}
                                {doc.linkedTo.decisionIds && doc.linkedTo.decisionIds.length > 0 && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                    {doc.linkedTo.decisionIds.length} décision(s)
                                  </span>
                                )}
                                {doc.linkedTo.riskIds && doc.linkedTo.riskIds.length > 0 && (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                                    {doc.linkedTo.riskIds.length} risque(s)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button type="button" onClick={() => openView(doc)} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Voir">
                              <Eye className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Télécharger">
                              <Download className="w-5 h-5 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Conformité ISO (inchangé) */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 text-lg mb-2 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Checklist de conformité ISO 9001
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Suivi automatique des exigences documentaires ISO 9001. POPILOT vérifie que tous
                  les documents requis existent, sont à jour et validés.
                </p>
                <div className={viewGrids.stats3}>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{complianceStats.compliant}</div>
                    <div className="text-xs text-green-700 flex items-center gap-1"><Check className="w-3 h-3" /> Conforme</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{complianceStats.incomplete}</div>
                    <div className="text-xs text-yellow-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Incomplet</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{complianceStats.missing}</div>
                    <div className="text-xs text-red-700 flex items-center gap-1"><X className="w-3 h-3" /> Manquant</div>
                  </div>
                </div>
              </div>

              {/* Liste des exigences */}
              <div className="space-y-3">
                {ISO_REQUIREMENTS.map((req, idx) => (
                  <div
                    key={idx}
                    className={`border-2 rounded-xl p-5 ${
                      req.status === 'compliant'
                        ? 'border-green-200 bg-green-50'
                        : req.status === 'incomplete'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getComplianceIcon(req.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              {req.category}
                              {req.isCritical && (
                                <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-bold">
                                  CRITIQUE
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">{req.requirement}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              req.status === 'compliant'
                                ? 'bg-green-200 text-green-800'
                                : req.status === 'incomplete'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-red-200 text-red-800'
                            }`}
                          >
                            {req.status === 'compliant'
                              ? 'Conforme'
                              : req.status === 'incomplete'
                              ? 'Incomplet'
                              : 'Manquant'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Liens automatiques */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-600 text-white rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 text-lg mb-2 flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      Traçabilité complète automatique
                    </h3>
                    <p className="text-sm text-green-800 mb-3">
                      POPILOT connecte automatiquement chaque document aux éléments du projet :
                      étapes pipeline, tâches, décisions, risques, objectifs.
                    </p>
                    <div className="text-sm text-green-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <strong>Vision → Décisions → Exécution</strong>
                      </div>
                      <p className="text-xs">
                        Exemple : Étude de faisabilité technique → liée à Étape "Cadrage" → liée à
                        Décision "Choix architecture" → liée à Tâches de développement
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exemples de liens */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Exemples de traçabilité automatique
                </h3>
                
                {/* Exemple 1 */}
                <div className="bg-white border-2 border-blue-200 rounded-xl p-5">
                  <div className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Étude de Faisabilité Technique POPY
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Link2 className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <strong className="text-blue-700">Liée à l'étape :</strong> Cadrage (stage-1)
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Link2 className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <strong className="text-green-700">Liée à la décision :</strong> Choix architecture hardware
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Link2 className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <strong className="text-purple-700">Impact :</strong> Permet le passage à l'étape "Conception"
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exemple 2 */}
                <div className="bg-white border-2 border-green-200 rounded-xl p-5">
                  <div className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Budget Détaillé POPY 2026
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Link2 className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <strong className="text-blue-700">Liée à l'étape :</strong> Cadrage (stage-1)
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Link2 className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div>
                        <strong className="text-orange-700">Document critique :</strong> Bloque le passage à la
                        prochaine étape si non validé
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exemple 3 */}
                <div className="bg-white border-2 border-purple-200 rounded-xl p-5">
                  <div className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Architecture Technique POPY
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Link2 className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <strong className="text-blue-700">Liée à l'étape :</strong> Conception (stage-2)
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Link2 className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <strong className="text-green-700">Liée aux décisions :</strong> Choix Raspberry Pi 4, Choix
                        capteurs ToF
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Link2 className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <strong className="text-blue-700">Liée aux tâches :</strong> 8 tâches de développement
                        hardware
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Automatisations info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-600 text-white rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 text-lg mb-2 flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Automatisations documentaires
            </h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 shrink-0" /> Création automatique des dossiers requis à la création du projet</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 shrink-0" /> Alertes si documents manquants ou périmés</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 shrink-0" /> Blocage du passage à l'étape suivante si document critique absent</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 shrink-0" /> Génération automatique de la checklist audit ISO</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 shrink-0" /> Liens automatiques avec pipeline, tâches, décisions, risques</li>
            </ul>
          </div>
        </div>
      </div>
    </ViewShell>
  );
}