// Types pour le système budgétaire POPILOT - Conforme ISO 9001 §7.1

/** Identifiant de catégorie BOM (built-in ou personnalisé) */
export type BOMCategoryId = string;

/** @deprecated Alias — préférer BOMCategoryId */
export type BOMCategory = BOMCategoryId;

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
  category: BOMCategoryId;
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

export interface BudgetLink {
  id: string;
  label: string;
  url: string;
}

export interface BudgetDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

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
  links?: BudgetLink[];
  documents?: BudgetDocument[];
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
  links?: BudgetLink[];
  documents?: BudgetDocument[];
  createdAt: string;
  updatedAt: string;
}

export type FundingStatus = 'explore' | 'in-progress' | 'won' | 'lost' | 'later';

export interface FundingSource {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  amountLabel: string;
  amountMin?: number;
  amountMax?: number;
  status: FundingStatus;
  deadline?: string;
  successRate?: string;
  links?: BudgetLink[];
  documents?: BudgetDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetTracking {
  // Estimations initiales
  estimatedTotal: number;
  estimatedByCategory: Record<string, number>;
  
  // Budget validé (devis acceptés)
  validatedTotal: number;
  validatedByCategory: Record<string, number>;
  
  // Budget engagé (commandes passées)
  committedTotal: number;
  committedByCategory: Record<string, number>;
  
  // Budget réel (reçu)
  actualTotal: number;
  actualByCategory: Record<string, number>;
  
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
  category?: BOMCategoryId;
  componentId?: string;
  supplierId?: string;
  message: string;
  actionRequired: string;
  createdAt: string;
  resolvedAt?: string;
}

// Helpers
export function getBOMCategoryLabel(category: BOMCategoryId): string {
  const labels: Record<string, string> = {
    'brain-ai': 'Cerveau & IA',
    'vision': 'Vision & Perception',
    'audio': 'Audio (Micros + HP)',
    'movement': 'Mouvements (Servos + Roues)',
    'visual-interface': 'Interface Visuelle & LEDs',
    'power': 'Alimentation & Batterie',
    'structure': 'Structure & Mécanique',
    'electronics': "Électronique d'Intégration",
  };
  return labels[category] ?? category;
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

export function getFundingStatusLabel(status: FundingStatus): string {
  const labels: Record<FundingStatus, string> = {
    explore: 'À explorer',
    'in-progress': 'En cours',
    won: 'Obtenu',
    lost: 'Refusé',
    later: 'Phase ultérieure',
  };
  return labels[status];
}

export function getFundingStatusColor(status: FundingStatus): string {
  const colors: Record<FundingStatus, string> = {
    explore: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    won: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-red-100 text-red-800',
    later: 'bg-slate-100 text-slate-700',
  };
  return colors[status];
}

export function getQuoteStatusLabel(status: QuoteStatus): string {
  const labels: Record<QuoteStatus, string> = {
    accepted: 'Accepté',
    rejected: 'Refusé',
    received: 'Reçu',
    pending: 'En attente',
  };
  return labels[status];
}

export function calculateBudgetTracking(
  components: BOMComponent[],
  _quotes: Quote[],
  categoryIds?: string[]
): BudgetTracking {
  const ids =
    categoryIds ??
    [...new Set(components.map((c) => c.category))].sort();

  const estimatedByCategory = Object.fromEntries(ids.map((id) => [id, 0])) as Record<string, number>;
  const validatedByCategory = { ...estimatedByCategory };
  const committedByCategory = { ...estimatedByCategory };
  const actualByCategory = { ...estimatedByCategory };

  let estimatedTotal = 0;
  let validatedTotal = 0;
  let committedTotal = 0;
  let actualTotal = 0;

  components.forEach((comp) => {
    if (!(comp.category in estimatedByCategory)) {
      estimatedByCategory[comp.category] = 0;
      validatedByCategory[comp.category] = 0;
      committedByCategory[comp.category] = 0;
      actualByCategory[comp.category] = 0;
    }

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
