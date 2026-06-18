import { useState } from 'react';
import { Plus, Filter, MoreVertical, Calendar, User, AlertCircle } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { Task } from '../types';
import { CreateTaskModal } from './CreateTaskModal';

export function TasksView() {
  const { data: tasks, loading, refetch } = useApi<Task[]>('/tasks');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'todo':
        return { label: 'À faire', color: 'bg-gray-100 text-gray-800 border-gray-200' };
      case 'in-progress':
        return { label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'in-review':
        return { label: 'En revue', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'blocked':
        return { label: 'Bloquée', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'done':
        return { label: 'Terminée', color: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { label: 'Haute', color: 'text-red-600' };
      case 'medium':
        return { label: 'Moyenne', color: 'text-yellow-600' };
      case 'low':
        return { label: 'Basse', color: 'text-green-600' };
      default:
        return { label: priority, color: 'text-gray-600' };
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tâches</h1>
          <p className="text-gray-600 mt-1">Gérez et suivez toutes les tâches en cours</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5" />
          Nouvelle tâche
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Tous les statuts</option>
          <option>À faire</option>
          <option>En cours</option>
          <option>En revue</option>
          <option>Bloquée</option>
          <option>Terminée</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Toutes les priorités</option>
          <option>Haute</option>
          <option>Moyenne</option>
          <option>Basse</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Tous les projets</option>
          <option>Refonte plateforme digitale</option>
          <option>Migration infrastructure cloud</option>
          <option>Certification ISO 27001</option>
          <option>Application mobile interne</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {tasks?.filter((t) => t.status === 'todo').length || 0}
          </div>
          <div className="text-sm text-gray-600">À faire</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-200 bg-blue-50">
          <div className="text-2xl font-bold text-blue-900">
            {tasks?.filter((t) => t.status === 'in-progress').length || 0}
          </div>
          <div className="text-sm text-blue-700">En cours</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-purple-200 bg-purple-50">
          <div className="text-2xl font-bold text-purple-900">
            {tasks?.filter((t) => t.status === 'in-review').length || 0}
          </div>
          <div className="text-sm text-purple-700">En revue</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50">
          <div className="text-2xl font-bold text-red-900">
            {tasks?.filter((t) => t.status === 'blocked').length || 0}
          </div>
          <div className="text-sm text-red-700">Bloquées</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-green-200 bg-green-50">
          <div className="text-2xl font-bold text-green-900">
            {tasks?.filter((t) => t.status === 'done').length || 0}
          </div>
          <div className="text-sm text-green-700">Terminées</div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tâche
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigné à
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avancement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks?.map((task) => {
                const statusConfig = getStatusConfig(task.status);
                const priorityConfig = getPriorityConfig(task.priority);
                const overdue = isOverdue(task.dueDate) && task.status !== 'done';

                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{task.title}</div>
                        {task.blockers.length > 0 && (
                          <div className="flex items-start gap-1 mt-1">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-red-600">
                              {task.blockers.map((blocker, idx) => (
                                <div key={idx}>{blocker}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {task.project}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                          {task.assignee.initials}
                        </div>
                        <span className="text-sm text-gray-900">{task.assignee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
                          <div
                            className={`h-2 rounded-full ${
                              task.progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 font-medium min-w-[40px]">
                          {task.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}