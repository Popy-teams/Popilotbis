import { useState } from 'react';
import {
  Rocket,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Zap,
  Shield,
  Package,
} from 'lucide-react';

export function POPYProjectView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'roadmap' | 'kpis'>(
    'overview'
  );

  // Données du projet POPY
  const popyProject = {
    name: 'POPY',
    fullName: 'Projet POPY - Robot Éducatif Intelligent ISO 9001',
    status: 'in-progress',
    phase: 'Conception & Développement',
    progress: 45,
    startDate: '2025-10-01',
    targetDate: '2026-06-30',
    budget: {
      total: 180000,
      spent: 89000,
      committed: 45000,
      remaining: 46000,
    },
    team: {
      total: 8,
      available: 6,
      overloaded: 1,
    },
    kpis: [
      {
        name: 'Avancement global',
        current: 45,
        target: 100,
        unit: '%',
        status: 'on-track',
      },
      {
        name: 'Respect planning',
        current: 92,
        target: 95,
        unit: '%',
        status: 'at-risk',
      },
      {
        name: 'Budget consommé',
        current: 74,
        target: 50,
        unit: '%',
        status: 'at-risk',
      },
      {
        name: 'Tests réussis',
        current: 87,
        target: 95,
        unit: '%',
        status: 'on-track',
      },
      {
        name: 'Satisfaction équipe',
        current: 4.2,
        target: 4.0,
        unit: '/5',
        status: 'on-track',
      },
      {
        name: 'Risques ouverts',
        current: 3,
        target: 0,
        unit: '',
        status: 'at-risk',
      },
    ],
  };

  // Processus ISO 9001 du projet POPY
  const processes = [
    {
      id: 'pilotage',
      name: 'Pilotage & Gouvernance',
      icon: Settings,
      phase: 'pilotage',
      responsible: 'Jean Dupont',
      status: 'active',
      progress: 75,
      objectives: [
        'Garantir l\'alignement stratégique du projet',
        'Piloter les décisions clés',
        'Assurer la conformité ISO 9001',
      ],
      kpis: [
        { name: 'Réunions comité pilotage', current: 12, target: 15, unit: '' },
        { name: 'Décisions tracées', current: 48, target: 50, unit: '' },
      ],
      risks: ['Retard validation décisions stratégiques'],
    },
    {
      id: 'conception-hard',
      name: 'Conception Hardware',
      icon: Zap,
      phase: 'conception',
      responsible: 'Thomas Serrano',
      status: 'active',
      progress: 60,
      objectives: [
        'Concevoir l\'architecture électronique',
        'Sélectionner les composants (capteurs, actionneurs)',
        'Valider les prototypes hardware',
      ],
      kpis: [
        { name: 'Prototypes validés', current: 2, target: 3, unit: '' },
        { name: 'Composants sourcés', current: 15, target: 20, unit: '' },
      ],
      risks: ['Délai de livraison capteurs de mouvement', 'Coût des composants en hausse'],
    },
    {
      id: 'conception-soft',
      name: 'Conception Software & IA',
      icon: Package,
      phase: 'conception',
      responsible: 'Paul Leblanc',
      status: 'active',
      progress: 50,
      objectives: [
        'Développer le firmware embarqué',
        'Intégrer l\'IA de reconnaissance émotionnelle',
        'Créer l\'application mobile compagnon',
      ],
      kpis: [
        { name: 'Modules IA développés', current: 3, target: 5, unit: '' },
        { name: 'Taux reconnaissance émotions', current: 78, target: 90, unit: '%' },
      ],
      risks: ['Complexité algorithme IA', 'Performance temps réel insuffisante'],
    },
    {
      id: 'dev-integration',
      name: 'Développement & Intégration',
      icon: Rocket,
      phase: 'development',
      responsible: 'Marie Laurent',
      status: 'active',
      progress: 40,
      objectives: [
        'Intégrer hardware + software',
        'Assembler les prototypes complets',
        'Synchroniser firmware et IA',
      ],
      kpis: [
        { name: 'Intégrations réussies', current: 4, target: 10, unit: '' },
        { name: 'Bugs critiques résolus', current: 12, target: 15, unit: '' },
      ],
      risks: ['Incompatibilités hardware/software', 'Délai assemblage prototypes'],
    },
    {
      id: 'tests-validation',
      name: 'Tests & Validation',
      icon: CheckCircle,
      phase: 'tests',
      responsible: 'Alice Chevalier',
      status: 'active',
      progress: 35,
      objectives: [
        'Réaliser les tests fonctionnels',
        'Valider la sécurité enfants (norme EN71)',
        'Tests utilisateurs avec enfants',
      ],
      kpis: [
        { name: 'Tests automatisés exécutés', current: 145, target: 200, unit: '' },
        { name: 'Conformité sécurité', current: 85, target: 100, unit: '%' },
      ],
      risks: ['Non-conformité norme EN71', 'Résultats tests enfants < attentes'],
    },
    {
      id: 'qualite',
      name: 'Qualité & Conformité ISO',
      icon: Shield,
      phase: 'support',
      responsible: 'Aline Moreau',
      status: 'active',
      progress: 82,
      objectives: [
        'Garantir la conformité ISO 9001',
        'Documenter tous les processus',
        'Auditer régulièrement le projet',
      ],
      kpis: [
        { name: 'Documents qualité créés', current: 28, target: 35, unit: '' },
        { name: 'Audits réalisés', current: 4, target: 6, unit: '' },
      ],
      risks: ['Documentation incomplète'],
    },
  ];

  const milestones = [
    {
      id: 1,
      name: 'Prototype V1 (hardware)',
      date: '2026-01-30',
      status: 'in-progress',
      progress: 75,
      dependencies: ['Réception composants', 'Validation schémas électroniques'],
    },
    {
      id: 2,
      name: 'IA reconnaissance émotions opérationnelle',
      date: '2026-02-15',
      status: 'at-risk',
      progress: 60,
      dependencies: ['Collecte données émotionnelles', 'Entraînement modèle'],
    },
    {
      id: 3,
      name: 'Prototype intégré complet V1',
      date: '2026-03-15',
      status: 'pending',
      progress: 0,
      dependencies: ['Prototype V1 hardware', 'Firmware V1', 'IA opérationnelle'],
    },
    {
      id: 4,
      name: 'Tests enfants (20 enfants)',
      date: '2026-04-10',
      status: 'pending',
      progress: 0,
      dependencies: ['Prototype intégré V1', 'Validation sécurité'],
    },
    {
      id: 5,
      name: 'Certification sécurité EN71',
      date: '2026-05-20',
      status: 'pending',
      progress: 0,
      dependencies: ['Tests sécurité complets', 'Ajustements conformité'],
    },
    {
      id: 6,
      name: 'Prototype final validé',
      date: '2026-06-30',
      status: 'pending',
      progress: 0,
      dependencies: ['Tests enfants validés', 'Certification EN71 obtenue'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKPIStatus = (status: string) => {
    switch (status) {
      case 'on-track':
        return { color: 'text-green-600', bg: 'bg-green-100', label: '✓ Conforme' };
      case 'at-risk':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: '⚠ À surveiller' };
      case 'critical':
        return { color: 'text-red-600', bg: 'bg-red-100', label: '✗ Critique' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'N/A' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header du projet POPY */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="w-8 h-8" />
              <h1 className="text-3xl font-bold">{popyProject.fullName}</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Phase actuelle: <strong>{popyProject.phase}</strong>
            </p>
            <p className="text-purple-100 mt-1">
              Approche processus ISO 9001 - Amélioration continue
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{popyProject.progress}%</div>
            <div className="text-purple-100">Avancement</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-6">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${popyProject.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-purple-100 mt-2">
            <span>Début: {new Date(popyProject.startDate).toLocaleDateString('fr-FR')}</span>
            <span>Cible: {new Date(popyProject.targetDate).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Budget restant</p>
              <p className="text-2xl font-bold text-blue-600">
                {(popyProject.budget.remaining / 1000).toFixed(0)}k€
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-600 bg-blue-100 p-2 rounded-lg" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Membres actifs</p>
              <p className="text-2xl font-bold text-green-600">{popyProject.team.total}</p>
            </div>
            <Users className="w-10 h-10 text-green-600 bg-green-100 p-2 rounded-lg" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processus actifs</p>
              <p className="text-2xl font-bold text-purple-600">{processes.length}</p>
            </div>
            <Settings className="w-10 h-10 text-purple-600 bg-purple-100 p-2 rounded-lg" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jours restants</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.ceil(
                  (new Date(popyProject.targetDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </p>
            </div>
            <Clock className="w-10 h-10 text-orange-600 bg-orange-100 p-2 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
              { id: 'processes', label: 'Processus ISO', icon: Settings },
              { id: 'roadmap', label: 'Jalons & Roadmap', icon: Calendar },
              { id: 'kpis', label: 'Indicateurs', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Tab: Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">Vision du projet POPY</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>POPY</strong> est un robot éducatif intelligent intégrant de l'IA
                    pour reconnaître et répondre aux émotions des enfants. Le projet suit une
                    approche processus conforme ISO 9001, garantissant la maîtrise de chaque étape,
                    la traçabilité totale et l'amélioration continue.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Objectifs stratégiques</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>
                      Livrer un prototype fonctionnel validé par des tests utilisateurs avant le
                      30/06/2026
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Obtenir la certification sécurité EN71 pour les jouets enfants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>Respecter le budget de 180k€ avec une marge de ±5%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>
                      Garantir la conformité ISO 9001 sur tout le cycle de développement
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Risques actuels</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <strong className="text-red-900">
                        Retard livraison capteurs de mouvement
                      </strong>
                      <p className="text-sm text-red-700 mt-1">
                        Impact: Retard 2 semaines sur prototype V1 • Mitigation: Identifier
                        fournisseur alternatif
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <strong className="text-yellow-900">
                        Performance IA temps réel insuffisante
                      </strong>
                      <p className="text-sm text-yellow-700 mt-1">
                        Impact: Expérience utilisateur dégradée • Mitigation: Optimisation
                        algorithme + tests hardware plus puissant
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <strong className="text-yellow-900">Budget consommé à 74%</strong>
                      <p className="text-sm text-yellow-700 mt-1">
                        Impact: Risque dépassement si dérive continue • Mitigation: Revue
                        hebdomadaire des dépenses
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Processus ISO */}
          {activeTab === 'processes' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Approche processus ISO 9001 (§4.4)
                </h3>
                <p className="text-sm text-blue-800">
                  Le projet POPY est structuré en 6 processus maîtrisés, chacun avec des
                  responsables, objectifs mesurables, indicateurs et risques associés. Cette
                  approche garantit la cohérence et la traçabilité.
                </p>
              </div>

              {processes.map((process) => {
                const Icon = process.icon;
                return (
                  <div
                    key={process.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{process.name}</h3>
                          <p className="text-sm text-gray-600">
                            Responsable: <strong>{process.responsible}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {process.progress}%
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(process.status)}`}
                        >
                          {process.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${process.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Objectifs */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Objectifs</h4>
                      <ul className="space-y-1">
                        {process.objectives.map((obj, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* KPIs */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Indicateurs (KPIs)
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {process.kpis.map((kpi, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">{kpi.name}</div>
                            <div className="text-lg font-bold text-gray-900">
                              {kpi.current} / {kpi.target} {kpi.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risques */}
                    {process.risks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Risques identifiés
                        </h4>
                        <div className="space-y-1">
                          {process.risks.map((risk, idx) => (
                            <div
                              key={idx}
                              className="text-sm text-red-600 flex items-start gap-2"
                            >
                              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {risk}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab: Roadmap */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">Planification maîtrisée</h3>
                <p className="text-sm text-green-800">
                  Les jalons du projet POPY sont définis avec leurs dépendances critiques. Chaque
                  jalon est suivi et toute dérive est immédiatement signalée.
                </p>
              </div>

              {milestones.map((milestone) => {
                const daysUntil = Math.ceil(
                  (new Date(milestone.date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const isOverdue = daysUntil < 0;
                const isUpcoming = daysUntil <= 14 && daysUntil >= 0;

                return (
                  <div
                    key={milestone.id}
                    className={`border-2 rounded-xl p-6 ${
                      milestone.status === 'in-progress'
                        ? 'border-blue-300 bg-blue-50'
                        : milestone.status === 'at-risk'
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <h3 className="text-lg font-bold text-gray-900">{milestone.name}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            Date cible:{' '}
                            <strong>{new Date(milestone.date).toLocaleDateString('fr-FR')}</strong>
                          </span>
                          {isOverdue && (
                            <span className="text-red-600 font-semibold">
                              ⚠️ En retard de {Math.abs(daysUntil)} jours
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="text-orange-600 font-semibold">
                              ⏰ Dans {daysUntil} jours
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {milestone.progress}%
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(milestone.status)}`}>
                          {milestone.status === 'in-progress'
                            ? 'En cours'
                            : milestone.status === 'at-risk'
                            ? 'À risque'
                            : 'Planifié'}
                        </span>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Dépendances */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Dépendances</h4>
                      <div className="flex flex-wrap gap-2">
                        {milestone.dependencies.map((dep, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-300"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab: KPIs */}
          {activeTab === 'kpis' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-purple-900 mb-2">Pilotage par la donnée</h3>
                <p className="text-sm text-purple-800">
                  Les indicateurs clés du projet POPY permettent de piloter objectivement et de
                  détecter rapidement les dérives. Conforme ISO 9001 §9 (Évaluation de la
                  performance).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popyProject.kpis.map((kpi, idx) => {
                  const statusInfo = getKPIStatus(kpi.status);
                  const percentage = (kpi.current / kpi.target) * 100;

                  return (
                    <div
                      key={idx}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{kpi.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Cible: {kpi.target} {kpi.unit}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-bold text-gray-900">{kpi.current}</span>
                        <span className="text-gray-600">
                          / {kpi.target} {kpi.unit}
                        </span>
                      </div>

                      {/* Barre de progression */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            kpi.status === 'on-track'
                              ? 'bg-green-500'
                              : kpi.status === 'at-risk'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}