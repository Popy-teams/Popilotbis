// Types pour le système budgétaire POPILOT - Conforme ISO 9001 §7.1

export type BOMCategory =
  | 'brain-ai'
  | 'vision'
  | 'audio'
  | 'movement'
  | 'visual-interface'
  | 'power'
  | 'structure'
  | 'electronics';

export type ComponentStatus =
  | 'to-quote'
  | 'quote-requested'
  | 'quote-received'
  | 'validated'
  | 'ordered'
  | 'received'
  | 'cancelled';

export type ComponentCriticality = 'low' | 'medium' | 'critical';

export interface BOMComponent {
  id: string;
  projectId?: string;
  category: BOMCategory;
  name: string;
  functionalName: string;
  example: string; // Référence précise du modèle
  quantity: number;
  unitPriceEstimated: number; // Prix unitaire TTC estimé
  totalEstimated: number; // Coût total estimé
  unitPriceActual?: number; // Prix réel après devis
  totalActual?: number; // Coût réel
  status: ComponentStatus;
  supplier?: string; // ID du fournisseur pressenti
  supplierName?: string;
  priceSource: string; // URL ou référence
  criticality: ComponentCriticality;
  
  // Liens transversaux
  linkedTo?: {
    taskIds?: string[];
    stageId?: string;
    riskIds?: string[];
    quoteIds?: string[];
  };
  
  // Métadonnées
  notes?: string;
  technicalSpecs?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export type QuoteStatus = 'received' | 'accepted' | 'rejected' | 'pending';

export interface Quote {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  componentIds: string[]; // Peut couvrir plusieurs composants
  
  // Détails du devis
  amountTTC: number;
  amountHT?: number;
  deliveryDelay: string; // "2 semaines", "30 jours"
  deliveryDelayDays?: number;
  conditions: string;
  validUntil?: string;
  
  // Fichier
  fileUrl?: string;
  fileName?: string;
  
  status: QuoteStatus;
  receivedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  
  // Comparaison
  deviationFromEstimate?: number; // %
  competitorQuotes?: string[]; // IDs des devis concurrents
  
  // Métadonnées
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export type SupplierType = 'retail' | 'industrial' | 'prototype' | 'distributor';
export type SupplierReliability = 1 | 2 | 3 | 4 | 5;

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  country: string;
  
  // Contact
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  
  // Évaluation
  reliability: SupplierReliability;
  averageDeliveryDays?: number;
  qualityRating?: number; // 1-5
  
  // Historique
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  
  // Composants fournis
  componentIds: string[];
  quoteIds: string[];
  
  // Risques
  isSoleSource: boolean; // Fournisseur unique
  riskIds?: string[];
  
  // Métadonnées
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetTracking {
  // Estimations initiales
  estimatedTotal: number;
  estimatedByCategory: Record<BOMCategory, number>;
  
  // Budget validé (devis acceptés)
  validatedTotal: number;
  validatedByCategory: Record<BOMCategory, number>;
  
  // Budget engagé (commandes passées)
  committedTotal: number;
  committedByCategory: Record<BOMCategory, number>;
  
  // Budget réel (reçu)
  actualTotal: number;
  actualByCategory: Record<BOMCategory, number>;
  
  // Écarts
  deviationAmount: number;
  deviationPercent: number;
  
  // Alertes
  alerts: BudgetAlert[];
}

export interface BudgetAlert {
  id: string;
  type: 'overspend' | 'critical-missing' | 'sole-source' | 'delay-risk' | 'price-increase';
  severity: 'info' | 'warning' | 'critical';
  category?: BOMCategory;
  componentId?: string;
  supplierId?: string;
  message: string;
  actionRequired: string;
  createdAt: string;
  resolvedAt?: string;
}

// Helpers
export function getBOMCategoryLabel(category: BOMCategory): string {
  const labels: Record<BOMCategory, string> = {
    'brain-ai': 'Cerveau & IA',
    'vision': 'Vision & Perception',
    'audio': 'Audio (Micros + HP)',
    'movement': 'Mouvements (Servos + Roues)',
    'visual-interface': 'Interface Visuelle & LEDs',
    'power': 'Alimentation & Batterie',
    'structure': 'Structure & Mécanique',
    'electronics': 'Électronique d\'Intégration',
  };
  return labels[category];
}

export function getComponentStatusLabel(status: ComponentStatus): string {
  const labels: Record<ComponentStatus, string> = {
    'to-quote': 'À chiffrer',
    'quote-requested': 'Devis demandé',
    'quote-received': 'Devis reçu',
    'validated': 'Validé',
    'ordered': 'Commandé',
    'received': 'Reçu',
    'cancelled': 'Annulé',
  };
  return labels[status];
}

export function getComponentStatusColor(status: ComponentStatus): string {
  const colors: Record<ComponentStatus, string> = {
    'to-quote': 'bg-gray-100 text-gray-700',
    'quote-requested': 'bg-blue-100 text-blue-700',
    'quote-received': 'bg-purple-100 text-purple-700',
    'validated': 'bg-green-100 text-green-700',
    'ordered': 'bg-orange-100 text-orange-700',
    'received': 'bg-emerald-100 text-emerald-700',
    'cancelled': 'bg-red-100 text-red-700',
  };
  return colors[status];
}

export function getCriticalityColor(criticality: ComponentCriticality): string {
  const colors: Record<ComponentCriticality, string> = {
    'low': 'text-gray-600',
    'medium': 'text-orange-600',
    'critical': 'text-red-600',
  };
  return colors[criticality];
}

export function getSupplierTypeLabel(type: SupplierType): string {
  const labels: Record<SupplierType, string> = {
    'retail': 'Retail',
    'industrial': 'Industriel',
    'prototype': 'Prototypage',
    'distributor': 'Distributeur',
  };
  return labels[type];
}

export function calculateBudgetTracking(
  components: BOMComponent[],
  quotes: Quote[]
): BudgetTracking {
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

  const estimatedByCategory = {} as Record<BOMCategory, number>;
  const validatedByCategory = {} as Record<BOMCategory, number>;
  const committedByCategory = {} as Record<BOMCategory, number>;
  const actualByCategory = {} as Record<BOMCategory, number>;

  categories.forEach((cat) => {
    estimatedByCategory[cat] = 0;
    validatedByCategory[cat] = 0;
    committedByCategory[cat] = 0;
    actualByCategory[cat] = 0;
  });

  let estimatedTotal = 0;
  let validatedTotal = 0;
  let committedTotal = 0;
  let actualTotal = 0;

  components.forEach((comp) => {
    estimatedTotal += comp.totalEstimated;
    estimatedByCategory[comp.category] += comp.totalEstimated;

    if (comp.status === 'validated' || comp.status === 'ordered' || comp.status === 'received') {
      const amount = comp.totalActual || comp.totalEstimated;
      validatedTotal += amount;
      validatedByCategory[comp.category] += amount;
    }

    if (comp.status === 'ordered' || comp.status === 'received') {
      const amount = comp.totalActual || comp.totalEstimated;
      committedTotal += amount;
      committedByCategory[comp.category] += amount;
    }

    if (comp.status === 'received' && comp.totalActual) {
      actualTotal += comp.totalActual;
      actualByCategory[comp.category] += comp.totalActual;
    }
  });

  const deviationAmount = validatedTotal - estimatedTotal;
  const deviationPercent = estimatedTotal > 0 ? (deviationAmount / estimatedTotal) * 100 : 0;

  // Génération des alertes
  const alerts: BudgetAlert[] = [];

  // Alerte dépassement global
  if (deviationPercent > 10) {
    alerts.push({
      id: `alert-global-${Date.now()}`,
      type: 'overspend',
      severity: 'critical',
      message: `Dépassement budgétaire de ${deviationPercent.toFixed(1)}%`,
      actionRequired: 'Réviser le budget ou réduire les coûts',
      createdAt: new Date().toISOString(),
    });
  }

  // Composants critiques non chiffrés
  const criticalMissing = components.filter(
    (c) => c.criticality === 'critical' && c.status === 'to-quote'
  );
  if (criticalMissing.length > 0) {
    alerts.push({
      id: `alert-critical-${Date.now()}`,
      type: 'critical-missing',
      severity: 'warning',
      message: `${criticalMissing.length} composant(s) critique(s) sans devis`,
      actionRequired: 'Demander les devis en urgence',
      createdAt: new Date().toISOString(),
    });
  }

  return {
    estimatedTotal,
    estimatedByCategory,
    validatedTotal,
    validatedByCategory,
    committedTotal,
    committedByCategory,
    actualTotal,
    actualByCategory,
    deviationAmount,
    deviationPercent,
    alerts,
  };
}
