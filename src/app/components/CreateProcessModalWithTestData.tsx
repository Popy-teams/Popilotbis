import { useState } from 'react';
import { X, Target, Package, LifeBuoy, Shield, TrendingUp, Activity, Plus, Trash2, Link2, Users, CheckSquare, Square } from 'lucide-react';
import { TEST_TASKS, TEST_TEAM_MEMBERS, getTasksByProject } from '../data/testData';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  validatedBy?: string;
  validatedAt?: string;
  taskId?: string;
}

interface CreateProcessModalWithTestDataProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onSuccess: (process: any) => void;
  processToEdit?: any;
}

export function CreateProcessModalWithTestData({ projectId, projectName, onClose, onSuccess, processToEdit }: CreateProcessModalWithTestDataProps) {
  // Utiliser les données de test partagées
  const tasks = getTasksByProject(projectId);
  const teamMembers = TEST_TEAM_MEMBERS;
  
  const [formData, setFormData] = useState({
    type: processToEdit?.type || 'pilotage' as 'pilotage' | 'realisation' | 'support' | 'qualite' | 'amelioration' | 'indicateurs',
    title: processToEdit?.title || '',
    objective: processToEdit?.objective || '',
    trigger: processToEdit?.trigger || '',
    responsible: processToEdit?.responsible || '',
    contributors: processToEdit?.contributors?.join('\n') || '',
    deliverables: processToEdit?.deliverables?.join('\n') || '',
    validationCriteria: processToEdit?.validationCriteria?.join('\n') || '',
    risks: processToEdit?.risks?.join('\n') || '',
    improvementLink: processToEdit?.improvementLink || '',
  });

  const [steps, setSteps] = useState<ProcessStep[]>(
    processToEdit?.steps || [{ id: '1', title: '', description: '', status: 'todo' }]
  );

  const [assignedMembers, setAssignedMembers] = useState<string[]>(processToEdit?.assignedTo || []);
  const [linkedTasks, setLinkedTasks] = useState<string[]>(processToEdit?.linkedTasks || []);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [currentStepForTask, setCurrentStepForTask] = useState<string | null>(null);

  const processTypes = [
    { value: 'pilotage', label: 'Processus de pilotage', subtitle: 'DÉCIDER', icon: Target, color: 'indigo' },
    { value: 'realisation', label: 'Processus de réalisation', subtitle: 'FAIRE', icon: Package, color: 'blue' },
    { value: 'support', label: 'Processus support', subtitle: 'PERMETTRE', icon: LifeBuoy, color: 'green' },
    { value: 'qualite', label: 'Processus qualité & risques', subtitle: 'SÉCURISER', icon: Shield, color: 'orange' },
    { value: 'amelioration', label: 'Processus d\'amélioration continue', subtitle: 'AMÉLIORER', icon: TrendingUp, color: 'purple' },
    { value: 'indicateurs', label: 'Indicateurs de suivi', subtitle: 'MESURER', icon: Activity, color: 'pink' },
  ];

  // Calculer automatiquement la progression basée sur les étapes validées
  const calculateProgress = () => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(s => s.status === 'done').length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  // Calculer le statut global basé sur les étapes
  const calculateStatus = (): 'todo' | 'in-progress' | 'done' => {
    const completedSteps = steps.filter(s => s.status === 'done').length;
    if (completedSteps === 0) return 'todo';
    if (completedSteps === steps.length) return 'done';
    return 'in-progress';
  };

  const addStep = () => {
    setSteps([...steps, { id: Date.now().toString(), title: '', description: '', status: 'todo' }]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  const updateStep = (id: string, field: keyof ProcessStep, value: any) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const linkTaskToStep = (stepId: string, taskId: string) => {
    const task = tasks?.find(t => t.id === taskId);
    if (task) {
      updateStep(stepId, 'taskId', taskId);
      updateStep(stepId, 'title', task.title);
      updateStep(stepId, 'description', task.description || '');
      
      // Déterminer le statut basé sur le statut de la tâche
      let stepStatus: 'todo' | 'in-progress' | 'done' = 'todo';
      if (task.status === 'done') stepStatus = 'done';
      else if (task.status === 'in-progress' || task.status === 'blocked') stepStatus = 'in-progress';
      
      updateStep(stepId, 'status', stepStatus);
      
      // Ajouter la tâche aux tâches liées si pas déjà présente
      if (!linkedTasks.includes(taskId)) {
        setLinkedTasks([...linkedTasks, taskId]);
      }
    }
    setShowTaskSelector(false);
    setCurrentStepForTask(null);
  };

  const toggleMemberAssignment = (memberId: string) => {
    if (assignedMembers.includes(memberId)) {
      setAssignedMembers(assignedMembers.filter(id => id !== memberId));
    } else {
      setAssignedMembers([...assignedMembers, memberId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProcess = {
      id: processToEdit?.id || `process-${Date.now()}`,
      projectId,
      type: formData.type,
      title: formData.title,
      objective: formData.objective,
      trigger: formData.trigger,
      responsible: formData.responsible,
      contributors: formData.contributors.split('\n').filter(c => c.trim()),
      steps: steps.filter(s => s.title.trim()),
      deliverables: formData.deliverables.split('\n').filter(d => d.trim()),
      validationCriteria: formData.validationCriteria.split('\n').filter(v => v.trim()),
      risks: formData.risks.split('\n').filter(r => r.trim()),
      improvementLink: formData.improvementLink,
      assignedTo: assignedMembers,
      linkedTasks: linkedTasks,
      status: calculateStatus(),
      progress: calculateProgress(),
      createdAt: processToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSuccess(newProcess);
  };

  const selectedType = processTypes.find(t => t.value === formData.type);
  const Icon = selectedType?.icon || Target;

  // Filtrer les tâches disponibles (celles qui ne sont pas déjà liées)
  const availableTasks = tasks?.filter(t => !linkedTasks.includes(t.id)) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full my-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {processToEdit ? 'Modifier le processus' : 'Créer un processus interactif'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Projet : {projectName} • Progression automatique : <span className="font-bold text-indigo-600">{calculateProgress()}%</span>
            </p>
            <p className="text-xs text-orange-600 mt-1 font-medium">
              🧪 MODE TEST - Données de démonstration chargées
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type de processus */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Type de processus ISO 9001
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {processTypes.map((type) => {
                const TypeIcon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TypeIcon className={`w-5 h-5 mb-2 ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`} />
                    <div className="text-xs font-semibold text-gray-900">{type.subtitle}</div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Informations de base */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Titre du processus *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Développement du prototype V0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Responsable *
              </label>
              <input
                type="text"
                required
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nom du responsable"
              />
            </div>
          </div>

          {/* Objectif */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Objectif du processus *
            </label>
            <textarea
              required
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Décrire clairement l'objectif à atteindre"
            />
          </div>

          {/* Assignation des membres d'équipe - AVEC DONNÉES TEST */}
          <div className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Membres assignés ({assignedMembers.length})
              <span className="ml-auto text-xs font-normal text-indigo-600">✨ Cliquez pour assigner</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => {
                const isAssigned = assignedMembers.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMemberAssignment(member.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                      isAssigned
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg scale-105'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    {isAssigned ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    <span className="font-medium">{member.name}</span>
                    <span className="text-xs opacity-75">({member.role})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Étapes du processus avec liaison aux tâches - AVEC DONNÉES TEST */}
          <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-green-600" />
                Étapes du processus ({steps.filter(s => s.status === 'done').length}/{steps.length} validées)
                <span className="ml-2 text-xs font-normal text-green-600">
                  ✨ Cliquez sur "Lier" pour connecter une tâche
                </span>
              </label>
              <button
                type="button"
                onClick={addStep}
                className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Ajouter une étape
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const linkedTask = tasks?.find(t => t.id === step.taskId);
                return (
                  <div key={step.id} className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="text"
                            required
                            value={step.title}
                            onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Nom de l'étape"
                          />
                          
                          <select
                            value={step.status}
                            onChange={(e) => updateStep(step.id, 'status', e.target.value)}
                            className={`px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-medium ${
                              step.status === 'done' ? 'bg-green-50 text-green-700 border-green-300' :
                              step.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                              'bg-gray-50 text-gray-700 border-gray-300'
                            }`}
                          >
                            <option value="todo">À faire</option>
                            <option value="in-progress">En cours</option>
                            <option value="done">✓ Validé</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStepForTask(step.id);
                              setShowTaskSelector(true);
                            }}
                            className={`px-3 py-2 border-2 rounded-lg transition-all text-sm font-medium flex items-center gap-1 ${
                              linkedTask 
                                ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100' 
                                : 'bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-50'
                            }`}
                            title="Lier à une tâche existante"
                          >
                            <Link2 className="w-4 h-4" />
                            {linkedTask ? '🔗 Liée' : 'Lier'}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeStep(step.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-200"
                            disabled={steps.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {linkedTask && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 bg-green-50 px-3 py-2 rounded border-2 border-green-300">
                            <Link2 className="w-3 h-3 text-green-600" />
                            <span>Liée à la tâche: <strong>{linkedTask.title}</strong></span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              linkedTask.status === 'done' ? 'bg-green-100 text-green-700' :
                              linkedTask.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              linkedTask.status === 'blocked' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {linkedTask.status === 'done' ? '✓ Terminée' :
                               linkedTask.status === 'in-progress' ? 'En cours' :
                               linkedTask.status === 'blocked' ? 'Bloquée' : 'À faire'}
                            </span>
                            <span className="text-xs">• Assignée à: {linkedTask.assignedToName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                updateStep(step.id, 'taskId', undefined);
                                setLinkedTasks(linkedTasks.filter(id => id !== step.taskId));
                              }}
                              className="ml-auto text-red-600 hover:text-red-800 font-bold"
                              title="Délier la tâche"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <textarea
                          value={step.description}
                          onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                          rows={1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder="Description (optionnelle)"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Autres champs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Livrables (un par ligne)
              </label>
              <textarea
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Prototype fonctionnel&#10;Documentation technique&#10;Rapport de tests"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Critères de validation (un par ligne)
              </label>
              <textarea
                value={formData.validationCriteria}
                onChange={(e) => setFormData({ ...formData, validationCriteria: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Performance > 95%&#10;Tests réussis&#10;Validation PO"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Risques identifiés (un par ligne)
            </label>
            <textarea
              value={formData.risks}
              onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Retard sur les livraisons&#10;Complexité sous-estimée"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
            <div className="text-sm">
              <div className="text-gray-600">
                Progression calculée automatiquement : <strong className="text-indigo-600 text-lg">{calculateProgress()}%</strong>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Statut: <strong>{calculateStatus() === 'done' ? '✓ Terminé' : calculateStatus() === 'in-progress' ? '⚡ En cours' : '⏳ À faire'}</strong>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border-2 border-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg"
              >
                {processToEdit ? 'Enregistrer les modifications' : 'Créer le processus'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de sélection de tâche - AVEC DONNÉES TEST */}
      {showTaskSelector && currentStepForTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border-4 border-indigo-500">
            <div className="p-4 border-b-2 border-gray-200 flex items-center justify-between bg-indigo-50">
              <h3 className="text-lg font-bold text-gray-900">
                🔗 Sélectionner une tâche existante ({availableTasks.length} disponibles)
              </h3>
              <button
                onClick={() => {
                  setShowTaskSelector(false);
                  setCurrentStepForTask(null);
                }}
                className="p-2 hover:bg-indigo-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {availableTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-semibold">Aucune tâche disponible</p>
                  <p className="text-sm mt-2">Toutes les tâches sont déjà liées à des étapes</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => linkTaskToStep(currentStepForTask, task.id)}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              task.status === 'done' ? 'bg-green-100 text-green-700' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              task.status === 'blocked' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status === 'done' ? '✓ Terminée' :
                               task.status === 'in-progress' ? '⚡ En cours' :
                               task.status === 'blocked' ? '🚫 Bloquée' : '⏳ À faire'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Assignée à: <strong>{task.assignedToName}</strong>
                            </span>
                          </div>
                        </div>
                        <Link2 className="w-6 h-6 text-indigo-600 ml-3" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}