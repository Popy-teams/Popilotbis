// Types pour la gestion des risques et opportunités ISO 9001

export interface Risk {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  category: RiskCategory;
  type: 'risk' | 'opportunity';
  status: 'open' | 'in-treatment' | 'closed' | 'accepted';
  
  // Analyse du risque
  probability: 1 | 2 | 3 | 4 | 5;
  impacts: {
    cost: 1 | 2 | 3 | 4 | 5;
    delay: 1 | 2 | 3 | 4 | 5;
    quality: 1 | 2 | 3 | 4 | 5;
    security: 1 | 2 | 3 | 4 | 5;
    image: 1 | 2 | 3 | 4 | 5;
  };
  criticality: 'low' | 'medium' | 'high' | 'critical';
  criticalityScore: number;
  
  // Traitement
  strategy: 'avoid' | 'reduce' | 'transfer' | 'accept';
  actions: RiskAction[];
  
  // Métadonnées
  origin: RiskOrigin;
  detectedBy: string;
  detectedByName?: string;
  detectedAt: string;
  owner: string;
  ownerName?: string;
  visibility: 'team' | 'steering' | 'management';
  
  // Traçabilité
  history: RiskHistoryEntry[];
  
  // Liens transversaux
  linkedTo?: {
    taskIds?: string[];
    documentIds?: string[];
    stageId?: string;
    meetingIds?: string[];
    decisionIds?: string[];
    competenceIds?: string[];
  };
  
  // Dates
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  
  // Tags
  tags?: string[];
  
  // Si détecté automatiquement
  autoDetected?: boolean;
  autoDetectionSource?: string;
}

export type RiskCategory =
  | 'technical'
  | 'quality'
  | 'planning'
  | 'financial'
  | 'hr'
  | 'security'
  | 'legal'
  | 'supply-chain'
  | 'communication';

export type RiskOrigin =
  | 'meeting'
  | 'study'
  | 'field-feedback'
  | 'auto-detection'
  | 'audit'
  | 'brainstorming'
  | 'review';

export interface RiskAction {
  id: string;
  title: string;
  type: 'preventive' | 'corrective' | 'monitoring';
  responsible: string;
  responsibleName?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'done';
  linkedTaskId?: string; // Lien vers une tâche POPILOT
  createdAt: string;
  completedAt?: string;
}

export interface RiskHistoryEntry {
  date: string;
  author: string;
  authorName?: string;
  action: 'created' | 'updated' | 'closed' | 'reopened' | 'strategy-changed' | 'criticality-changed';
  description: string;
  oldValue?: any;
  newValue?: any;
}

// Calcul automatique de la criticité
export function calculateCriticality(
  probability: number,
  impacts: Risk['impacts']
): { criticality: Risk['criticality']; score: number } {
  const maxImpact = Math.max(
    impacts.cost,
    impacts.delay,
    impacts.quality,
    impacts.security,
    impacts.image
  );
  
  const score = probability * maxImpact;
  
  let criticality: Risk['criticality'];
  if (score <= 5) {
    criticality = 'low';
  } else if (score <= 10) {
    criticality = 'medium';
  } else if (score <= 15) {
    criticality = 'high';
  } else {
    criticality = 'critical';
  }
  
  return { criticality, score };
}

// Labels
export function getRiskCategoryLabel(category: RiskCategory): string {
  const labels: Record<RiskCategory, string> = {
    'technical': '🔧 Technique',
    'quality': '✅ Qualité',
    'planning': '📅 Planning',
    'financial': '💰 Financier',
    'hr': '👥 RH',
    'security': '🔒 Sécurité',
    'legal': '⚖️ Juridique',
    'supply-chain': '📦 Supply Chain',
    'communication': '📣 Communication',
  };
  return labels[category];
}

export function getRiskStrategyLabel(strategy: Risk['strategy']): string {
  const labels: Record<Risk['strategy'], string> = {
    'avoid': '🚫 Éviter',
    'reduce': '📉 Réduire',
    'transfer': '↗️ Transférer',
    'accept': '✓ Accepter',
  };
  return labels[strategy];
}

export function getCriticalityColor(criticality: Risk['criticality']): string {
  const colors: Record<Risk['criticality'], string> = {
    'low': 'bg-green-100 text-green-800 border-green-200',
    'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'high': 'bg-orange-100 text-orange-800 border-orange-200',
    'critical': 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[criticality];
}

export function getCriticalityIcon(criticality: Risk['criticality']): string {
  const icons: Record<Risk['criticality'], string> = {
    'low': '🟢',
    'medium': '🟡',
    'high': '🟠',
    'critical': '🔴',
  };
  return icons[criticality];
}

// Suggestions de risques automatiques
export interface AutoRiskSuggestion {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  source: string;
  sourceDetails: string;
  suggestedProbability: number;
  suggestedImpacts: Risk['impacts'];
  detectedAt: string;
  dismissed?: boolean;
}

// Générer des suggestions de risques automatiques
export function generateAutoRiskSuggestions(context: {
  lateTasks?: any[];
  budgetStatus?: any;
  missingDocs?: any[];
  missingCompetences?: any[];
  singleSuppliers?: any[];
}): AutoRiskSuggestion[] {
  const suggestions: AutoRiskSuggestion[] = [];
  
  // Tâches critiques en retard
  if (context.lateTasks && context.lateTasks.length > 0) {
    suggestions.push({
      id: `auto-risk-${Date.now()}-1`,
      title: `${context.lateTasks.length} tâche(s) critique(s) en retard`,
      description: `Des tâches critiques accusent un retard qui pourrait impacter le planning global du projet.`,
      category: 'planning',
      source: 'auto-detection',
      sourceDetails: `Tâches: ${context.lateTasks.map(t => t.title).join(', ')}`,
      suggestedProbability: 4,
      suggestedImpacts: { cost: 2, delay: 5, quality: 3, security: 1, image: 2 },
      detectedAt: new Date().toISOString(),
    });
  }
  
  // Dépassement budget
  if (context.budgetStatus && context.budgetStatus.overrun > 10) {
    suggestions.push({
      id: `auto-risk-${Date.now()}-2`,
      title: 'Dépassement budgétaire détecté',
      description: `Le budget montre un dépassement de ${context.budgetStatus.overrun}% qui pourrait compromettre la viabilité financière.`,
      category: 'financial',
      source: 'auto-detection',
      sourceDetails: `Dépassement: ${context.budgetStatus.overrun}%`,
      suggestedProbability: 4,
      suggestedImpacts: { cost: 5, delay: 2, quality: 1, security: 1, image: 3 },
      detectedAt: new Date().toISOString(),
    });
  }
  
  // Documents obligatoires manquants
  if (context.missingDocs && context.missingDocs.length > 0) {
    suggestions.push({
      id: `auto-risk-${Date.now()}-3`,
      title: 'Documents ISO obligatoires manquants',
      description: `${context.missingDocs.length} document(s) obligatoire(s) manquant(s) pour la conformité ISO.`,
      category: 'legal',
      source: 'auto-detection',
      sourceDetails: `Documents: ${context.missingDocs.join(', ')}`,
      suggestedProbability: 3,
      suggestedImpacts: { cost: 1, delay: 3, quality: 4, security: 1, image: 4 },
      detectedAt: new Date().toISOString(),
    });
  }
  
  // Compétences manquantes
  if (context.missingCompetences && context.missingCompetences.length > 0) {
    suggestions.push({
      id: `auto-risk-${Date.now()}-4`,
      title: 'Compétences critiques manquantes',
      description: `L'équipe ne dispose pas de toutes les compétences nécessaires au projet.`,
      category: 'hr',
      source: 'auto-detection',
      sourceDetails: `Compétences: ${context.missingCompetences.join(', ')}`,
      suggestedProbability: 3,
      suggestedImpacts: { cost: 2, delay: 4, quality: 4, security: 2, image: 1 },
      detectedAt: new Date().toISOString(),
    });
  }
  
  return suggestions;
}
