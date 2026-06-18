import { useEffect, useMemo, useState } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { filterByActiveProject } from '../utils/projectMatch';
import { DEMO_BOM_BY_PROJECT } from '../data/multiProjectDemoFixtures';
import { mergeDemoData } from '../utils/demoDataMerge';
import {
  DollarSign,
  Package,
  FileText,
  Building2,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Link as LinkIcon,
  Edit,
  Trash2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Star,
  Briefcase,
  Video,
} from 'lucide-react';
import { PageBackHeader } from './shared/PageBackHeader';
import { ViewShell, ViewHeader, viewGrids, TableWrap, AppIcon, IconButton, ActionButton } from './shared';
import {
  BOMComponent,
  Quote,
  Supplier,
  BOMCategory,
  ComponentStatus,
  getBOMCategoryLabel,
  getComponentStatusLabel,
  getComponentStatusColor,
  getCriticalityColor,
  getSupplierTypeLabel,
  calculateBudgetTracking,
} from '../types/budget';

type BomPageMode = 'list' | 'create-component' | 'view-component' | 'edit-component';

const emptyBomForm = {
  category: 'brain-ai' as BOMCategory,
  name: '',
  functionalName: '',
  example: '',
  quantity: 1,
  unitPriceEstimated: 0,
  status: 'to-quote' as ComponentStatus,
  priceSource: '',
  criticality: 'medium' as BOMComponent['criticality'],
  supplierName: '',
  notes: '',
};

export function BudgetView() {
  const { matchesProject, activeProjectSlug } = useProjectContext();
  const [activeTab, setActiveTab] = useState<'bom' | 'quotes' | 'suppliers' | 'tracking' | 'funding'>('bom');
  const [selectedCategory, setSelectedCategory] = useState<BOMCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ComponentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bomPageMode, setBomPageMode] = useState<BomPageMode>('list');
  const [selectedComponent, setSelectedComponent] = useState<BOMComponent | null>(null);
  const [bomForm, setBomForm] = useState(emptyBomForm);

  // Données de démonstration - BOM POPY
  const DEFAULT_BOM_COMPONENTS: BOMComponent[] = [
    // Cerveau & IA
    {
      id: 'bom-1',
      category: 'brain-ai',
      name: 'Microcontrôleur principal',
      functionalName: 'Cerveau central',
      example: 'Raspberry Pi 5 8GB',
      quantity: 1,
      unitPriceEstimated: 85,
      totalEstimated: 85,
      unitPriceActual: 89,
      totalActual: 89,
      status: 'validated',
      supplierName: 'Kubii',
      priceSource: 'https://www.kubii.fr',
      criticality: 'critical',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-15',
      createdBy: 'user-1',
      lastModifiedBy: 'user-1',
    },
    {
      id: 'bom-2',
      category: 'brain-ai',
      name: 'Accélérateur IA',
      functionalName: 'Moteur ML',
      example: 'Google Coral USB Accelerator',
      quantity: 1,
      unitPriceEstimated: 60,
      totalEstimated: 60,
      status: 'quote-received',
      supplierName: 'Mouser',
      priceSource: 'https://mouser.fr',
      criticality: 'critical',
      linkedTo: {
        taskIds: ['task-12'],
        riskIds: ['risk-1'],
      },
      createdAt: '2025-01-10',
      updatedAt: '2025-01-14',
      createdBy: 'user-1',
      lastModifiedBy: 'user-2',
    },
    {
      id: 'bom-3',
      category: 'brain-ai',
      name: 'Carte microSD',
      functionalName: 'Stockage système',
      example: 'SanDisk Extreme 128GB',
      quantity: 1,
      unitPriceEstimated: 25,
      totalEstimated: 25,
      status: 'to-quote',
      priceSource: 'Amazon estimation',
      criticality: 'medium',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-10',
      createdBy: 'user-1',
      lastModifiedBy: 'user-1',
    },

    // Vision & Perception
    {
      id: 'bom-4',
      category: 'vision',
      name: 'Caméra RGB principale',
      functionalName: 'Vision couleur',
      example: 'Pi Camera Module 3',
      quantity: 1,
      unitPriceEstimated: 35,
      totalEstimated: 35,
      status: 'validated',
      supplierName: 'Kubii',
      priceSource: 'https://www.kubii.fr',
      criticality: 'critical',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-15',
      createdBy: 'user-1',
      lastModifiedBy: 'user-1',
    },
    {
      id: 'bom-5',
      category: 'vision',
      name: 'Capteurs ToF',
      functionalName: 'Détection obstacles',
      example: 'VL53L1X',
      quantity: 4,
      unitPriceEstimated: 12,
      totalEstimated: 48,
      status: 'quote-requested',
      supplierName: 'Pololu',
      priceSource: 'https://www.pololu.com',
      criticality: 'critical',
      notes: 'Délai annoncé : 8 semaines',
      linkedTo: {
        riskIds: ['risk-1'],
        taskIds: ['task-15'],
      },
      createdAt: '2025-01-10',
      updatedAt: '2025-01-16',
      createdBy: 'user-1',
      lastModifiedBy: 'user-3',
    },

    // Audio
    {
      id: 'bom-6',
      category: 'audio',
      name: 'Microphones MEMS',
      functionalName: 'Capture audio',
      example: 'INMP441',
      quantity: 2,
      unitPriceEstimated: 8,
      totalEstimated: 16,
      status: 'to-quote',
      priceSource: 'AliExpress estimation',
      criticality: 'medium',
      createdAt: '2025-01-11',
      updatedAt: '2025-01-11',
      createdBy: 'user-2',
      lastModifiedBy: 'user-2',
    },
    {
      id: 'bom-7',
      category: 'audio',
      name: 'Haut-parleur',
      functionalName: 'Synthèse vocale',
      example: 'Mini speaker 3W 8Ω',
      quantity: 1,
      unitPriceEstimated: 5,
      totalEstimated: 5,
      status: 'to-quote',
      priceSource: 'AliExpress estimation',
      criticality: 'low',
      createdAt: '2025-01-11',
      updatedAt: '2025-01-11',
      createdBy: 'user-2',
      lastModifiedBy: 'user-2',
    },

    // Mouvements
    {
      id: 'bom-8',
      category: 'movement',
      name: 'Servomoteurs yeux',
      functionalName: 'Animation regard',
      example: 'SG90 9g',
      quantity: 4,
      unitPriceEstimated: 3,
      totalEstimated: 12,
      status: 'validated',
      supplierName: 'AliExpress Pro',
      priceSource: 'https://aliexpress.com',
      criticality: 'medium',
      createdAt: '2025-01-11',
      updatedAt: '2025-01-14',
      createdBy: 'user-2',
      lastModifiedBy: 'user-2',
    },
    {
      id: 'bom-9',
      category: 'movement',
      name: 'Moteurs DC avec encodeurs',
      functionalName: 'Déplacement',
      example: 'N20 6V 100RPM',
      quantity: 2,
      unitPriceEstimated: 15,
      totalEstimated: 30,
      status: 'quote-received',
      supplierName: 'Pololu',
      priceSource: 'https://www.pololu.com',
      criticality: 'critical',
      createdAt: '2025-01-11',
      updatedAt: '2025-01-15',
      createdBy: 'user-2',
      lastModifiedBy: 'user-2',
    },

    // Interface visuelle
    {
      id: 'bom-10',
      category: 'visual-interface',
      name: 'Écran OLED yeux',
      functionalName: 'Expression émotions',
      example: 'SSD1306 128x64',
      quantity: 2,
      unitPriceEstimated: 8,
      totalEstimated: 16,
      status: 'to-quote',
      priceSource: 'AliExpress estimation',
      criticality: 'medium',
      createdAt: '2025-01-12',
      updatedAt: '2025-01-12',
      createdBy: 'user-1',
      lastModifiedBy: 'user-1',
    },
    {
      id: 'bom-11',
      category: 'visual-interface',
      name: 'LEDs RGB',
      functionalName: 'Indicateurs lumineux',
      example: 'WS2812B strip 30 LEDs',
      quantity: 1,
      unitPriceEstimated: 12,
      totalEstimated: 12,
      status: 'to-quote',
      priceSource: 'AliExpress estimation',
      criticality: 'low',
      createdAt: '2025-01-12',
      updatedAt: '2025-01-12',
      createdBy: 'user-1',
      lastModifiedBy: 'user-1',
    },

    // Alimentation
    {
      id: 'bom-12',
      category: 'power',
      name: 'Batterie LiPo',
      functionalName: 'Alimentation mobile',
      example: '7.4V 2000mAh 2S',
      quantity: 1,
      unitPriceEstimated: 25,
      totalEstimated: 25,
      status: 'quote-requested',
      supplierName: 'HobbyKing',
      priceSource: 'https://hobbyking.com',
      criticality: 'critical',
      notes: 'Vérifier compatibilité chargeur',
      createdAt: '2025-01-12',
      updatedAt: '2025-01-15',
      createdBy: 'user-1',
      lastModifiedBy: 'user-1',
    },
    {
      id: 'bom-13',
      category: 'power',
      name: 'Module régulateur',
      functionalName: 'Conversion tension',
      example: 'Buck converter 5V/3A',
      quantity: 2,
      unitPriceEstimated: 6,
      totalEstimated: 12,
      status: 'to-quote',
      priceSource: 'AliExpress estimation',
      criticality: 'medium',
      createdAt: '2025-01-12',
      updatedAt: '2025-01-12',
      createdBy: 'user-1',
      lastModifiedBy: 'user-1',
    },

    // Structure
    {
      id: 'bom-14',
      category: 'structure',
      name: 'Châssis impression 3D',
      functionalName: 'Corps principal',
      example: 'PLA/PETG custom',
      quantity: 1,
      unitPriceEstimated: 40,
      totalEstimated: 40,
      status: 'to-quote',
      priceSource: 'Estimation matériau + temps',
      criticality: 'critical',
      notes: 'Design en cours',
      linkedTo: {
        taskIds: ['task-8', 'task-9'],
      },
      createdAt: '2025-01-13',
      updatedAt: '2025-01-13',
      createdBy: 'user-3',
      lastModifiedBy: 'user-3',
    },
    {
      id: 'bom-15',
      category: 'structure',
      name: 'Roues',
      functionalName: 'Mobilité',
      example: 'Roues caoutchouc 60mm',
      quantity: 2,
      unitPriceEstimated: 5,
      totalEstimated: 10,
      status: 'to-quote',
      priceSource: 'AliExpress estimation',
      criticality: 'medium',
      createdAt: '2025-01-13',
      updatedAt: '2025-01-13',
      createdBy: 'user-3',
      lastModifiedBy: 'user-3',
    },

    // Électronique
    {
      id: 'bom-16',
      category: 'electronics',
      name: 'PCB intégration',
      functionalName: 'Carte mère custom',
      example: 'PCB 2-layers custom',
      quantity: 1,
      unitPriceEstimated: 50,
      totalEstimated: 50,
      status: 'to-quote',
      priceSource: 'JLCPCB estimation',
      criticality: 'critical',
      notes: 'Schéma en cours de validation',
      linkedTo: {
        taskIds: ['task-20'],
      },
      createdAt: '2025-01-14',
      updatedAt: '2025-01-14',
      createdBy: 'user-2',
      lastModifiedBy: 'user-2',
    },
    {
      id: 'bom-17',
      category: 'electronics',
      name: 'Connecteurs & câbles',
      functionalName: 'Interconnexion',
      example: 'JST, Dupont, etc.',
      quantity: 1,
      unitPriceEstimated: 20,
      totalEstimated: 20,
      status: 'to-quote',
      priceSource: 'Lot estimation',
      criticality: 'low',
      createdAt: '2025-01-14',
      updatedAt: '2025-01-14',
      createdBy: 'user-2',
      lastModifiedBy: 'user-2',
    },
  ];

  const [bomComponents, setBomComponents] = useState<BOMComponent[]>(DEFAULT_BOM_COMPONENTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('popilot:budget-bom-local');
      const saved = raw ? (JSON.parse(raw) as BOMComponent[]) : [];
      setBomComponents(mergeDemoData(saved, DEMO_BOM_BY_PROJECT, DEFAULT_BOM_COMPONENTS));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('popilot:budget-bom-local', JSON.stringify(bomComponents));
    } catch {}
  }, [bomComponents]);

  const scopedBomComponents = useMemo(
    () => filterByActiveProject(bomComponents, matchesProject),
    [bomComponents, matchesProject]
  );

  const toBomComponent = (base?: BOMComponent): BOMComponent => {
    const totalEstimated = bomForm.quantity * bomForm.unitPriceEstimated;
    return {
      id: base?.id ?? `bom-${Date.now()}`,
      category: bomForm.category,
      name: bomForm.name,
      functionalName: bomForm.functionalName,
      example: bomForm.example,
      quantity: bomForm.quantity,
      unitPriceEstimated: bomForm.unitPriceEstimated,
      totalEstimated,
      unitPriceActual: base?.unitPriceActual,
      totalActual: base?.totalActual,
      status: bomForm.status,
      supplierName: bomForm.supplierName || undefined,
      priceSource: bomForm.priceSource,
      criticality: bomForm.criticality,
      notes: bomForm.notes || undefined,
      linkedTo: base?.linkedTo,
      createdAt: base?.createdAt ?? new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      createdBy: base?.createdBy ?? 'user-local',
      lastModifiedBy: 'user-local',
      projectId: base?.projectId ?? activeProjectSlug ?? 'popy',
    };
  };

  const submitBomForm = (e: React.FormEvent) => {
    e.preventDefault();
    const next = toBomComponent(bomPageMode === 'edit-component' ? selectedComponent ?? undefined : undefined);
    if (bomPageMode === 'create-component') {
      setBomComponents((prev) => [...prev, next]);
    } else {
      setBomComponents((prev) => prev.map((c) => (c.id === next.id ? next : c)));
      setSelectedComponent(next);
    }
    setBomPageMode('list');
    setBomForm(emptyBomForm);
  };

  const removeComponent = (id: string) => {
    setBomComponents((prev) => prev.filter((c) => c.id !== id));
    setSelectedComponent(null);
    setBomPageMode('list');
  };

  const openCreateComponent = () => {
    setBomForm(emptyBomForm);
    setSelectedComponent(null);
    setBomPageMode('create-component');
  };

  const openViewComponent = (comp: BOMComponent) => {
    setSelectedComponent(comp);
    setBomPageMode('view-component');
  };

  const openEditComponent = (comp: BOMComponent) => {
    setSelectedComponent(comp);
    setBomForm({
      category: comp.category,
      name: comp.name,
      functionalName: comp.functionalName,
      example: comp.example,
      quantity: comp.quantity,
      unitPriceEstimated: comp.unitPriceEstimated,
      status: comp.status,
      priceSource: comp.priceSource,
      criticality: comp.criticality,
      supplierName: comp.supplierName ?? '',
      notes: comp.notes ?? '',
    });
    setBomPageMode('edit-component');
  };

  const bomFormPage = (
    <ViewShell narrow>
      <PageBackHeader
        title={bomPageMode === 'create-component' ? 'Nouveau composant' : 'Modifier le composant'}
        onBack={() => setBomPageMode(selectedComponent ? 'view-component' : 'list')}
      />
      <form onSubmit={submitBomForm} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
            <select value={bomForm.category} onChange={(e) => setBomForm({ ...bomForm, category: e.target.value as BOMCategory })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              {(['brain-ai', 'vision', 'audio', 'movement', 'visual-interface', 'power', 'structure', 'electronics'] as BOMCategory[]).map((c) => (
                <option key={c} value={c}>{getBOMCategoryLabel(c)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
            <select value={bomForm.status} onChange={(e) => setBomForm({ ...bomForm, status: e.target.value as ComponentStatus })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="to-quote">À coter</option>
              <option value="quote-requested">Devis demandé</option>
              <option value="quote-received">Devis reçu</option>
              <option value="validated">Validé</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nom *</label>
          <input required value={bomForm.name} onChange={(e) => setBomForm({ ...bomForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nom fonctionnel</label>
          <input value={bomForm.functionalName} onChange={(e) => setBomForm({ ...bomForm, functionalName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Référence / exemple</label>
          <input value={bomForm.example} onChange={(e) => setBomForm({ ...bomForm, example: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantité</label>
            <input type="number" min={1} value={bomForm.quantity} onChange={(e) => setBomForm({ ...bomForm, quantity: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prix unitaire estimé (€)</label>
            <input type="number" min={0} step={0.01} value={bomForm.unitPriceEstimated} onChange={(e) => setBomForm({ ...bomForm, unitPriceEstimated: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fournisseur</label>
            <input value={bomForm.supplierName} onChange={(e) => setBomForm({ ...bomForm, supplierName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Criticité</label>
            <select value={bomForm.criticality} onChange={(e) => setBomForm({ ...bomForm, criticality: e.target.value as BOMComponent['criticality'] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="critical">Critique</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Source prix</label>
          <input value={bomForm.priceSource} onChange={(e) => setBomForm({ ...bomForm, priceSource: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setBomPageMode(selectedComponent ? 'view-component' : 'list')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Annuler</button>
          <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{bomPageMode === 'create-component' ? 'Ajouter' : 'Enregistrer'}</button>
        </div>
      </form>
    </ViewShell>
  );

  if (bomPageMode === 'create-component' || bomPageMode === 'edit-component') {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        {bomFormPage}
      </div>
    );
  }

  if (bomPageMode === 'view-component' && selectedComponent) {
    const comp = scopedBomComponents.find((c) => c.id === selectedComponent.id) ?? selectedComponent;
    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <PageBackHeader
          title={comp.name}
          subtitle={getBOMCategoryLabel(comp.category)}
          onBack={() => { setBomPageMode('list'); setSelectedComponent(null); }}
          actions={
            <div className="flex gap-2">
              <button type="button" onClick={() => openEditComponent(comp)} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"><Edit className="w-4 h-4" /> Modifier</button>
              <button type="button" onClick={() => removeComponent(comp.id)} className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /> Supprimer</button>
            </div>
          }
        />
        <div className="bg-white rounded-xl border p-6 grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Fonction</span><p className="font-medium">{comp.functionalName}</p></div>
          <div><span className="text-gray-500">Exemple</span><p className="font-medium">{comp.example}</p></div>
          <div><span className="text-gray-500">Quantité</span><p className="font-medium">{comp.quantity}</p></div>
          <div><span className="text-gray-500">Coût estimé</span><p className="font-medium">{comp.totalEstimated.toFixed(2)} €</p></div>
          <div><span className="text-gray-500">Statut</span><p className="font-medium">{getComponentStatusLabel(comp.status)}</p></div>
          <div><span className="text-gray-500">Fournisseur</span><p className="font-medium">{comp.supplierName ?? '—'}</p></div>
          {comp.notes && <div className="col-span-2"><span className="text-gray-500">Notes</span><p className="font-medium">{comp.notes}</p></div>}
        </div>
      </div>
    );
  }

  // Devis
  const quotes: Quote[] = [
    {
      id: 'quote-1',
      reference: 'KUBII-2025-001',
      supplierId: 'sup-1',
      supplierName: 'Kubii',
      componentIds: ['bom-1', 'bom-4'],
      amountTTC: 128,
      amountHT: 106.67,
      deliveryDelay: '5 jours ouvrés',
      deliveryDelayDays: 5,
      conditions: 'Paiement CB, livraison Colissimo',
      status: 'accepted',
      receivedAt: '2025-01-14',
      acceptedAt: '2025-01-15',
      deviationFromEstimate: 6.67,
      createdAt: '2025-01-14',
      createdBy: 'user-1',
    },
    {
      id: 'quote-2',
      reference: 'MOUSER-FR-5421',
      supplierId: 'sup-2',
      supplierName: 'Mouser Electronics',
      componentIds: ['bom-2'],
      amountTTC: 64.5,
      deliveryDelay: '2 semaines',
      deliveryDelayDays: 14,
      conditions: 'Frais de port offerts >50€',
      status: 'received',
      receivedAt: '2025-01-15',
      deviationFromEstimate: 7.5,
      notes: 'Devis concurrent disponible chez DigiKey à 62€',
      createdAt: '2025-01-15',
      createdBy: 'user-2',
    },
    {
      id: 'quote-3',
      reference: 'POLOLU-2025-018',
      supplierId: 'sup-3',
      supplierName: 'Pololu',
      componentIds: ['bom-5'],
      amountTTC: 52,
      deliveryDelay: '8 semaines',
      deliveryDelayDays: 56,
      conditions: 'Stock limité, réservation recommandée',
      status: 'pending',
      receivedAt: '2025-01-16',
      deviationFromEstimate: 8.33,
      notes: 'Délai allongé - risque identifié',
      createdAt: '2025-01-16',
      createdBy: 'user-3',
    },
  ];

  // Fournisseurs
  const suppliers: Supplier[] = [
    {
      id: 'sup-1',
      name: 'Kubii',
      type: 'retail',
      country: 'France',
      website: 'https://www.kubii.fr',
      email: 'contact@kubii.fr',
      reliability: 5,
      averageDeliveryDays: 3,
      qualityRating: 5,
      totalOrders: 2,
      totalSpent: 128,
      lastOrderDate: '2025-01-15',
      componentIds: ['bom-1', 'bom-4'],
      quoteIds: ['quote-1'],
      isSoleSource: false,
      notes: 'Fournisseur français fiable, stock permanent',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-15',
    },
    {
      id: 'sup-2',
      name: 'Mouser Electronics',
      type: 'distributor',
      country: 'France',
      website: 'https://www.mouser.fr',
      reliability: 5,
      averageDeliveryDays: 7,
      qualityRating: 5,
      componentIds: ['bom-2'],
      quoteIds: ['quote-2'],
      isSoleSource: false,
      notes: 'Distributeur mondial, large catalogue',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-15',
    },
    {
      id: 'sup-3',
      name: 'Pololu',
      type: 'industrial',
      country: 'USA',
      website: 'https://www.pololu.com',
      reliability: 4,
      averageDeliveryDays: 21,
      qualityRating: 5,
      componentIds: ['bom-5', 'bom-9'],
      quoteIds: ['quote-3'],
      isSoleSource: true,
      riskIds: ['risk-1'],
      notes: 'Fournisseur unique pour capteurs ToF - délais longs',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-16',
    },
    {
      id: 'sup-4',
      name: 'AliExpress Pro',
      type: 'retail',
      country: 'Chine',
      website: 'https://www.aliexpress.com',
      reliability: 3,
      averageDeliveryDays: 30,
      qualityRating: 3,
      componentIds: ['bom-6', 'bom-7', 'bom-10', 'bom-11', 'bom-13', 'bom-15', 'bom-17'],
      quoteIds: [],
      isSoleSource: false,
      notes: 'Prix compétitifs mais délais variables',
      createdAt: '2025-01-11',
      updatedAt: '2025-01-11',
    },
    {
      id: 'sup-5',
      name: 'HobbyKing',
      type: 'retail',
      country: 'Hong Kong',
      website: 'https://hobbyking.com',
      reliability: 4,
      averageDeliveryDays: 15,
      qualityRating: 4,
      componentIds: ['bom-12'],
      quoteIds: [],
      isSoleSource: false,
      notes: 'Spécialiste batteries LiPo',
      createdAt: '2025-01-12',
      updatedAt: '2025-01-12',
    },
  ];

  const tracking = calculateBudgetTracking(scopedBomComponents, quotes);

  // Filtrage BOM
  const filteredComponents = scopedBomComponents.filter((comp) => {
    if (selectedCategory !== 'all' && comp.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && comp.status !== selectedStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        comp.name.toLowerCase().includes(query) ||
        comp.functionalName.toLowerCase().includes(query) ||
        comp.example.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const categories: BOMCategory[] = [
    'brain-ai',
    'vision',
    'audio',
    'movement',
    'visual-interface',
    'power',
    'structure',
    'electronics',
  ];

  return (
    <ViewShell>
      <ViewHeader
        title="Budget & BOM"
        subtitle="Bill of Materials, devis, fournisseurs et suivi budgétaire"
        actions={
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
            <ActionButton variant="secondary" icon={Upload}>Importer BOM</ActionButton>
            <ActionButton variant="secondary" icon={Download}>Exporter</ActionButton>
            <ActionButton icon={Plus} onClick={openCreateComponent} className="bg-green-600 hover:bg-green-700">Nouveau composant</ActionButton>
          </div>
        }
      />

      {/* Indicateurs Budget - Toujours visibles */}
      <div className={`${viewGrids.stats4} mt-2`}>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Budget Estimé</span>
              <Package className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {tracking.estimatedTotal.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {scopedBomComponents.length} composants
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Budget Validé</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {tracking.validatedTotal.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {quotes.filter((q) => q.status === 'accepted').length} devis acceptés
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Budget Engagé</span>
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {tracking.committedTotal.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Commandes en cours
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Écart Budget</span>
              {tracking.deviationPercent > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-red-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className={`text-2xl font-bold ${tracking.deviationPercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {tracking.deviationPercent > 0 ? '+' : ''}
              {tracking.deviationPercent.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {tracking.deviationAmount > 0 ? '+' : ''}
              {tracking.deviationAmount.toFixed(2)} €
          </div>
        </div>

        {/* Alertes */}
        {tracking.alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {tracking.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : alert.severity === 'warning'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 mt-0.5 ${
                    alert.severity === 'critical'
                      ? 'text-red-600'
                      : alert.severity === 'warning'
                      ? 'text-orange-600'
                      : 'text-blue-600'
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{alert.message}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Action requise : {alert.actionRequired}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('bom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'bom'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4" />
          BOM ({scopedBomComponents.length})
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'quotes'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Devis ({quotes.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'suppliers'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Fournisseurs ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'tracking'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Suivi Budgétaire
        </button>
        <button
          onClick={() => setActiveTab('funding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'funding'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Sources de financement
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'bom' && (
        <div>
          {/* Filtres et recherche */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un composant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as BOMCategory | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getBOMCategoryLabel(cat)}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ComponentStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="to-quote">À chiffrer</option>
                <option value="quote-requested">Devis demandé</option>
                <option value="quote-received">Devis reçu</option>
                <option value="validated">Validé</option>
                <option value="ordered">Commandé</option>
                <option value="received">Reçu</option>
              </select>
            </div>
          </div>

          {/* Tableau BOM par catégorie */}
          {categories.map((category) => {
            const categoryComponents = filteredComponents.filter((c) => c.category === category);
            if (categoryComponents.length === 0) return null;

            const categoryTotal = categoryComponents.reduce((sum, c) => sum + c.totalEstimated, 0);
            const categoryValidated = categoryComponents.reduce(
              (sum, c) => sum + (c.totalActual || c.totalEstimated),
              0
            );

            return (
              <div key={category} className="mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{getBOMCategoryLabel(category)}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {categoryComponents.length} composant{categoryComponents.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-900 font-medium">
                      Estimé : {categoryTotal.toFixed(2)} €
                    </span>
                    {categoryValidated > 0 && (
                      <span className="text-green-600 font-medium">
                        Validé : {categoryValidated.toFixed(2)} €
                      </span>
                    )}
                  </div>
                </div>
                <TableWrap className="bg-white border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Composant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Référence</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Qté</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">PU Estimé</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Total Est.</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Total Réel</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Fournisseur</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Criticité</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {categoryComponents.map((comp) => (
                        <tr key={comp.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{comp.functionalName}</div>
                              <div className="text-sm text-gray-500">{comp.name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{comp.example}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-gray-900">{comp.quantity}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-gray-900">{comp.unitPriceEstimated.toFixed(2)} €</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {comp.totalEstimated.toFixed(2)} €
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {comp.totalActual ? (
                              <span className="text-sm font-medium text-green-600">
                                {comp.totalActual.toFixed(2)} €
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComponentStatusColor(
                                comp.status
                              )}`}
                            >
                              {getComponentStatusLabel(comp.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {comp.supplierName ? (
                              <span className="text-sm text-gray-900">{comp.supplierName}</span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <AlertCircle className={`w-4 h-4 mx-auto ${getCriticalityColor(comp.criticality)}`} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {comp.linkedTo && Object.keys(comp.linkedTo).length > 0 && (
                                <button className="text-blue-600 hover:text-blue-700" title="Liens transversaux">
                                  <LinkIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button type="button" onClick={() => openViewComponent(comp)} className="text-gray-600 hover:text-gray-700" title="Voir détails">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => openEditComponent(comp)} className="text-gray-600 hover:text-gray-700" title="Modifier">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">{quotes.length} devis enregistrés</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="w-4 h-4" />
              Ajouter un devis
            </button>
          </div>

          {quotes.map((quote) => {
            const linkedComponents = scopedBomComponents.filter((c) => quote.componentIds.includes(c.id));
            return (
              <div key={quote.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{quote.reference}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          quote.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : quote.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : quote.status === 'received'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {quote.status === 'accepted'
                          ? 'Accepté'
                          : quote.status === 'rejected'
                          ? 'Refusé'
                          : quote.status === 'received'
                          ? 'Reçu'
                          : 'En attente'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {quote.supplierName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Délai: {quote.deliveryDelay}
                      </span>
                      <span>Reçu le {new Date(quote.receivedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{quote.amountTTC.toFixed(2)} € TTC</div>
                    {quote.amountHT && (
                      <div className="text-sm text-gray-600">{quote.amountHT.toFixed(2)} € HT</div>
                    )}
                    {quote.deviationFromEstimate !== undefined && (
                      <div
                        className={`text-sm font-medium mt-1 ${
                          quote.deviationFromEstimate > 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {quote.deviationFromEstimate > 0 ? '+' : ''}
                        {quote.deviationFromEstimate.toFixed(1)}% vs estimé
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Composants concernés :</h4>
                    <div className="flex flex-wrap gap-2">
                      {linkedComponents.map((comp) => (
                        <span
                          key={comp.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                        >
                          <Package className="w-3 h-3" />
                          {comp.functionalName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {quote.conditions && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Conditions :</h4>
                      <p className="text-sm text-gray-600">{quote.conditions}</p>
                    </div>
                  )}

                  {quote.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">{quote.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    {quote.status === 'received' && (
                      <>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          <CheckCircle className="w-4 h-4" />
                          Accepter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                          Refuser
                        </button>
                      </>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      <Eye className="w-4 h-4" />
                      Voir détails
                    </button>
                    {quote.fileUrl && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {suppliers.map((supplier) => {
            const supplierComponents = scopedBomComponents.filter((c) =>
              supplier.componentIds.includes(c.id)
            );
            return (
              <div key={supplier.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                      {supplier.isSoleSource && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Fournisseur unique
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {getSupplierTypeLabel(supplier.type)}
                      </span>
                      <span>{supplier.country}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= supplier.reliability ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-600">Fiabilité</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-600">Délai moyen</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {supplier.averageDeliveryDays || '—'} jours
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Commandes</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {supplier.totalOrders || 0}
                    </div>
                  </div>
                  {supplier.totalSpent && (
                    <>
                      <div>
                        <div className="text-sm text-gray-600">Total dépensé</div>
                        <div className="text-lg font-semibold text-green-600">
                          {supplier.totalSpent.toFixed(2)} €
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Composants fournis ({supplierComponents.length}) :
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {supplierComponents.slice(0, 5).map((comp) => (
                      <span
                        key={comp.id}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {comp.functionalName}
                      </span>
                    ))}
                    {supplierComponents.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                        +{supplierComponents.length - 5} autres
                      </span>
                    )}
                  </div>
                </div>

                {supplier.notes && (
                  <div
                    className={`p-3 rounded-lg text-sm mb-4 ${
                      supplier.isSoleSource
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-gray-50 border border-gray-200 text-gray-700'
                    }`}
                  >
                    {supplier.notes}
                  </div>
                )}

                <div className="flex gap-2">
                  {supplier.website && (
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Visiter
                    </a>
                  )}
                  <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {/* Graphique par catégorie */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget par catégorie</h3>
            <div className="space-y-4">
              {categories.map((category) => {
                const estimated = tracking.estimatedByCategory[category];
                const validated = tracking.validatedByCategory[category];
                const percentEstimated = tracking.estimatedTotal > 0 ? (estimated / tracking.estimatedTotal) * 100 : 0;
                const percentValidated = estimated > 0 ? (validated / estimated) * 100 : 0;

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {getBOMCategoryLabel(category)}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">{estimated.toFixed(2)} €</span>
                        {validated > 0 && (
                          <span className="text-green-600 font-medium">{validated.toFixed(2)} €</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-gray-400 flex items-center justify-end pr-2"
                        style={{ width: `${percentEstimated}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {percentEstimated.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {validated > 0 && (
                      <div className="w-full bg-gray-100 rounded-full h-2 mt-1 overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${percentValidated}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statuts des composants */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par statut</h3>
            <div className={viewGrids.stats3}>
              {(['to-quote', 'quote-requested', 'quote-received', 'validated', 'ordered', 'received'] as ComponentStatus[]).map(
                (status) => {
                  const count = scopedBomComponents.filter((c) => c.status === status).length;
                  const percent = scopedBomComponents.length > 0 ? (count / scopedBomComponents.length) * 100 : 0;
                  return (
                    <div key={status} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600 mt-1">{getComponentStatusLabel(status)}</div>
                      <div className="text-xs text-gray-500">{percent.toFixed(0)}%</div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Indicateurs ISO 9001 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Indicateurs ISO 9001 §7.1 - Maîtrise des ressources
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Taux de chiffrage</div>
                  <div className="text-sm text-gray-600">Composants avec prix validé</div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {(
                    (scopedBomComponents.filter((c) => c.status !== 'to-quote').length / scopedBomComponents.length) *
                    100
                  ).toFixed(0)}
                  %
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Composants critiques sécurisés</div>
                  <div className="text-sm text-gray-600">Statut validé ou supérieur</div>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {scopedBomComponents.filter((c) => c.criticality === 'critical' && c.status === 'validated').length}
                  {' / '}
                  {scopedBomComponents.filter((c) => c.criticality === 'critical').length}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Fournisseurs uniques</div>
                  <div className="text-sm text-gray-600">Risque de dépendance</div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {suppliers.filter((s) => s.isSoleSource).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'funding' && (
        <div className="space-y-6">
          {/* En-tête avec résumé */}
          <div className={viewGrids.stats4}>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="text-sm font-medium mb-2">Objectif de financement</div>
              <div className="text-3xl font-bold">3 500 €</div>
              <div className="text-sm mt-2 opacity-90">Pour prototype V1</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="text-sm font-medium mb-2">Fonds obtenus</div>
              <div className="text-3xl font-bold">0 €</div>
              <div className="text-sm mt-2 opacity-90">0% de l'objectif</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="text-sm font-medium mb-2">En cours</div>
              <div className="text-3xl font-bold">2</div>
              <div className="text-sm mt-2 opacity-90">Candidatures actives</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="text-sm font-medium mb-2">À explorer</div>
              <div className="text-3xl font-bold">5</div>
              <div className="text-sm mt-2 opacity-90">Opportunités identifiées</div>
            </div>
          </div>

          {/* BPI France - Aide à l'innovation */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">BPI France – Aide à l'innovation</h3>
                    <p className="text-sm text-gray-600">Subvention pour projets innovants</p>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                En cours
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
              <div>
                <div className="text-sm text-gray-600">Montant potentiel</div>
                <div className="text-xl font-bold text-blue-600">2 000 € - 10 000 €</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Date limite</div>
                <div className="text-lg font-semibold text-gray-900">28 février 2026</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Taux de succès estimé</div>
                <div className="text-lg font-semibold text-green-600">Moyen (40%)</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Critères d'éligibilité</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Projet innovant dans le domaine technologique</li>
                  <li>Équipe structurée avec compétences complémentaires</li>
                  <li>Business plan validé</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Documents requis</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Dossier technique
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Budget prévisionnel
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Business plan
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                  Dossier en cours de préparation. Rendez-vous prévu avec un conseiller BPI le 5 février 2026.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <a
                href="https://www.bpifrance.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                Site BPI France
              </a>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                <Edit className="w-4 h-4" />
                Modifier
              </button>
            </div>
          </div>

          {/* Subventions publiques */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Subventions publiques régionales</h3>
                    <p className="text-sm text-gray-600">Soutien aux projets innovants en région</p>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                À explorer
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Montant potentiel</div>
                <div className="text-xl font-bold text-green-600">1 000 € - 5 000 €</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Prochain appel</div>
                <div className="text-lg font-semibold text-gray-900">Mars 2026</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Taux de succès</div>
                <div className="text-lg font-semibold text-green-600">Élevé (60%)</div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                Contacter la Région pour connaître les modalités précises et dates d'ouverture des appels à projets.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                <Plus className="w-4 h-4" />
                Commencer le dossier
              </button>
            </div>
          </div>

          {/* Concours étudiants / EdTech */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Concours étudiants / EdTech</h3>
                    <p className="text-sm text-gray-600">Prix et récompenses pour projets éducatifs</p>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                En cours
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Montant potentiel</div>
                <div className="text-xl font-bold text-purple-600">500 € - 3 000 €</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Date limite</div>
                <div className="text-lg font-semibold text-gray-900">15 mars 2026</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Concours ciblés</div>
                <div className="text-lg font-semibold text-gray-900">3 identifiés</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 text-sm">Concours Innov'École</div>
                  <div className="text-xs text-gray-600">Date limite : 15 mars 2026</div>
                </div>
                <span className="text-sm font-semibold text-purple-600">1 500 €</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 text-sm">Prix EdTech Innovation</div>
                  <div className="text-xs text-gray-600">Date limite : 20 avril 2026</div>
                </div>
                <span className="text-sm font-semibold text-purple-600">3 000 €</span>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-purple-800">
                <span className="flex items-start gap-2">
                  <Video className="w-4 h-4 shrink-0 mt-0.5" />
                  Préparer une vidéo de présentation du projet (3 min max) et un pitch deck de 10 slides.
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                <Eye className="w-4 h-4" />
                Voir les concours
              </button>
            </div>
          </div>

          {/* Crowdfunding */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Crowdfunding (Ulule, Kickstarter)</h3>
                    <p className="text-sm text-gray-600">Financement participatif grand public</p>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                À explorer
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Objectif potentiel</div>
                <div className="text-xl font-bold text-orange-600">2 000 € - 5 000 €</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Durée campagne</div>
                <div className="text-lg font-semibold text-gray-900">30-45 jours</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Commission</div>
                <div className="text-lg font-semibold text-gray-900">5-8%</div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Avantages</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Validation du concept par le marché</li>
                  <li>Création d'une communauté engagée</li>
                  <li>Visibilité médiatique</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Prérequis</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Prototype fonctionnel à présenter</li>
                  <li>Vidéo de présentation professionnelle</li>
                  <li>Contreparties attractives définies</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800">
                <span className="flex items-start gap-2 text-orange-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  À lancer après validation prototype V1 (prévu Q2 2026)
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                <Plus className="w-4 h-4" />
                Planifier la campagne
              </button>
            </div>
          </div>

          {/* Partenariats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Partenariats entreprises / écoles</h3>
                    <p className="text-sm text-gray-600">Mécénat et soutien institutionnel</p>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                À explorer
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Montant potentiel</div>
                <div className="text-xl font-bold text-indigo-600">1 000 € - 10 000 €</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Partenaires ciblés</div>
                <div className="text-lg font-semibold text-gray-900">5 identifiés</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Type</div>
                <div className="text-lg font-semibold text-gray-900">Mécénat / Sponsoring</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 text-sm">Entreprises tech locales</div>
                  <div className="text-xs text-gray-600">Sponsoring matériel ou financier</div>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Potentiel</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 text-sm">Écoles et universités</div>
                  <div className="text-xs text-gray-600">Partenariat pédagogique</div>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Potentiel</span>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-indigo-800">
                <span className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 shrink-0 mt-0.5" />
                  Préparer un dossier de mécénat avec présentation du projet, impact social et contreparties.
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                <Plus className="w-4 h-4" />
                Identifier les partenaires
              </button>
            </div>
          </div>

          {/* Investisseurs privés */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Investisseurs privés (Business Angels)</h3>
                    <p className="text-sm text-gray-600">Levée de fonds early-stage</p>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                Phase ultérieure
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Ticket moyen</div>
                <div className="text-xl font-bold text-red-600">10 000 € - 50 000 €</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Timing optimal</div>
                <div className="text-lg font-semibold text-gray-900">Post-prototype</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Contrepartie</div>
                <div className="text-lg font-semibold text-gray-900">Equity</div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">
                ⏳ À envisager après validation du prototype et premières ventes/tests utilisateurs (Q3-Q4 2026)
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-700">Prérequis pour lever</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Prototype fonctionnel validé</li>
                <li>Premiers retours utilisateurs positifs</li>
                <li>Business model défini</li>
                <li>Roadmap produit claire</li>
                <li>Structure juridique (SAS recommandée)</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed text-sm">
                <Clock className="w-4 h-4" />
                Prévu pour Q3 2026
              </button>
            </div>
          </div>

          {/* Bouton d'ajout */}
          <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-green-500 hover:text-green-600 transition-colors">
            <Plus className="w-5 h-5" />
            Ajouter une nouvelle source de financement
          </button>
        </div>
      )}
    </ViewShell>
  );
}