import { useState } from 'react';
import { X, Target, Package, LifeBuoy, Shield, TrendingUp, Activity, Users, FileText, CheckCircle, Circle, Clock, AlertTriangle, ChevronRight, Link as LinkIcon } from 'lucide-react';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  validatedBy?: string;
  validatedAt?: string;
}

interface ProcessDetailModalProps {
  process: {
    id: string;
    projectId: string;
    type: 'pilotage' | 'realisation' | 'support' | 'qualite' | 'amelioration' | 'indicateurs';
    title: string;
    objective: string;
    trigger?: string;
    responsible: string;
    contributors: string[];
    steps: ProcessStep[];
    deliverables: string[];
    validationCriteria: string[];
    risks: string[];
    improvementLink?: string;
    status: 'todo' | 'in-progress' | 'done';
    progress: number;
  };
  onClose: () => void;
  onUpdateStep?: (stepId: string, newStatus: 'todo' | 'in-progress' | 'done') => void;
}

export function ProcessDetailModal({ process, onClose, onUpdateStep }: ProcessDetailModalProps) {
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  const getProcessConfig = (type: string) => {
    const configs: Record<string, { icon: any; color: string; label: string; subtitle: string }> = {
      pilotage: { icon: Target, color: 'indigo', label: 'Processus de pilotage', subtitle: 'DÉCIDER' },
      realisation: { icon: Package, color: 'blue', label: 'Processus de réalisation', subtitle: 'FAIRE' },
      support: { icon: LifeBuoy, color: 'green', label: 'Processus support', subtitle: 'PERMETTRE' },
      qualite: { icon: Shield, color: 'orange', label: 'Processus qualité & risques', subtitle: 'SÉCURISER' },
      amelioration: { icon: TrendingUp, color: 'purple', label: 'Processus d\'amélioration continue', subtitle: 'AMÉLIORER' },
      indicateurs: { icon: Activity, color: 'pink', label: 'Indicateurs de suivi', subtitle: 'MESURER' },
    };
    return configs[type] || configs.pilotage;
  };

  const getGlobalStatus = () => {
    const doneSteps = process.steps.filter(s => s.status === 'done').length;
    const totalSteps = process.steps.length;
    const criticalRisks = process.risks.length;
    
    if (doneSteps === totalSteps && criticalRisks === 0) {
      return { icon: '🟢', label: 'Conforme', color: 'green' };
    } else if (totalSteps - doneSteps > 2 || criticalRisks > 0) {
      return { icon: '🔴', label: 'Bloqué', color: 'red' };
    } else {
      return { icon: '🟡', label: 'À risque', color: 'yellow' };
    }
  };

  const config = getProcessConfig(process.type);
  const Icon = config.icon;
  const globalStatus = getGlobalStatus();

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
        return 'Validé';
      case 'in-progress':
        return 'En cours';
      default:
        return 'À faire';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleStepClick = (stepId: string) => {
    setActiveStepId(activeStepId === stepId ? null : stepId);
  };

  const handleToggleStepStatus = (stepId: string, currentStatus: string) => {
    let newStatus: 'todo' | 'in-progress' | 'done';
    if (currentStatus === 'todo') newStatus = 'in-progress';
    else if (currentStatus === 'in-progress') newStatus = 'done';
    else newStatus = 'todo';
    
    if (onUpdateStep) {
      onUpdateStep(stepId, newStatus);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header avec statut global */}
        <div className={`bg-${config.color}-600 p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium opacity-90 mb-1">{config.subtitle}</div>
              <h2 className="text-3xl font-bold mb-2">{process.title}</h2>
              <p className="text-lg opacity-90">🎯 {process.objective}</p>
            </div>
          </div>

          {/* Statut global */}
          <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{globalStatus.icon}</span>
              <div>
                <div className="text-sm opacity-75">Statut global</div>
                <div className="font-bold text-lg">{globalStatus.label}</div>
              </div>
            </div>
            <div className="h-10 w-px bg-white/30" />
            <div>
              <div className="text-sm opacity-75">Progression</div>
              <div className="font-bold text-lg">
                {process.steps.filter(s => s.status === 'done').length} / {process.steps.length} étapes
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full transition-all"
                  style={{ width: `${(process.steps.filter(s => s.status === 'done').length / process.steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Carte processus - Vue horizontale */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-indigo-600" />
              Carte du processus
            </h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {process.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className={`group relative flex flex-col items-center p-4 rounded-lg border-2 transition-all min-w-[140px] ${
                        activeStepId === step.id
                          ? `border-${config.color}-500 bg-${config.color}-50`
                          : step.status === 'done'
                          ? 'border-green-300 bg-green-50 hover:border-green-400'
                          : step.status === 'in-progress'
                          ? 'border-blue-300 bg-blue-50 hover:border-blue-400'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                        step.status === 'done'
                          ? 'bg-green-600 text-white'
                          : step.status === 'in-progress'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="text-xs font-semibold text-center text-gray-900 mb-1 line-clamp-2">
                        {step.title}
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${getStepStatusColor(step.status)} border`}>
                        {getStepStatusLabel(step.status)}
                      </div>
                      
                      {/* Tooltip au survol */}
                      {step.description && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs whitespace-normal">
                            {step.description}
                          </div>
                        </div>
                      )}
                    </button>
                    
                    {index < process.steps.length - 1 && (
                      <ChevronRight className="w-6 h-6 text-gray-400 mx-1 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-6">
              {/* Informations clés */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Informations clés</h3>
                <div className="space-y-3">
                  {process.trigger && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">🧩 Quand il s'applique</div>
                      <div className="text-sm text-gray-900">{process.trigger}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">👤 Responsable</div>
                    <div className="text-sm font-semibold text-gray-900">{process.responsible}</div>
                  </div>
                  {process.contributors.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">👥 Contributeurs</div>
                      <div className="flex flex-wrap gap-2">
                        {process.contributors.map((contributor, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                            {contributor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist dynamique */}
              <div className="bg-white rounded-lg border-2 border-indigo-200">
                <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-200">
                  <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Checklist dynamique
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {process.steps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3 group">
                      <button
                        onClick={() => handleToggleStepStatus(step.id, step.status)}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {getStepStatusIcon(step.status)}
                      </button>
                      <div className="flex-1">
                        <div className={`font-medium ${step.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {index + 1}. {step.title}
                        </div>
                        {step.description && (
                          <div className="text-xs text-gray-600 mt-0.5">{step.description}</div>
                        )}
                        {step.status === 'done' && step.validatedBy && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ Validé par {step.validatedBy} {step.validatedAt && `le ${new Date(step.validatedAt).toLocaleDateString()}`}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <button className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            Lier une tâche
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amélioration continue */}
              {process.improvementLink && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    🔁 Amélioration continue
                  </h3>
                  <p className="text-sm text-purple-800">{process.improvementLink}</p>
                </div>
              )}
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              {/* Livrables attendus */}
              {process.deliverables.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      📄 Livrables attendus
                    </h3>
                  </div>
                  <div className="p-5 space-y-2">
                    {process.deliverables.map((deliverable, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className={`w-6 h-6 rounded-full bg-${config.color}-100 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <span className={`text-${config.color}-700 font-semibold text-xs`}>{idx + 1}</span>
                        </div>
                        <span className="text-sm text-gray-700 flex-1">{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critères de validation */}
              {process.validationCriteria.length > 0 && (
                <div className="bg-white rounded-lg border border-green-200">
                  <div className="bg-green-50 px-5 py-3 border-b border-green-200">
                    <h3 className="font-semibold text-green-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      🔍 Critères de validation
                    </h3>
                  </div>
                  <div className="p-5 space-y-2">
                    {process.validationCriteria.map((criteria, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 flex-1">{criteria}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risques fréquents */}
              {process.risks.length > 0 && (
                <div className="bg-white rounded-lg border border-orange-200">
                  <div className="bg-orange-50 px-5 py-3 border-b border-orange-200">
                    <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      ⚠️ Risques fréquents
                    </h3>
                  </div>
                  <div className="p-5 space-y-2">
                    {process.risks.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 flex-1">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-3 pt-6 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-500">
              Créé le {new Date(process.createdAt || Date.now()).toLocaleDateString()}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
