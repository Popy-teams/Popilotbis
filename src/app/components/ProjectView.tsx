import { useEffect, useState } from 'react';
import { Plus, Calendar, Users as UsersIcon, DollarSign, Edit2, Trash2, Archive, ArrowLeft } from 'lucide-react';
import { useApi, apiDelete, apiPost, apiPut } from '../hooks/useApi';
import { Project } from '../types';
import { PORTFOLIO_PROJECT_FIXTURES } from '../data/portfolioProjectsFixtures';
import { FormSelect } from './shared';

type ProjectPageMode = 'list' | 'create' | 'view' | 'edit';

const availableMembers = [
  { id: '1', name: 'Jean Dupont', initials: 'JD' },
  { id: '2', name: 'Marie Martin', initials: 'MM' },
  { id: '3', name: 'Pierre Dubois', initials: 'PD' },
  { id: '4', name: 'Sophie Bernard', initials: 'SB' },
  { id: '5', name: 'Luc Petit', initials: 'LP' },
  { id: '6', name: 'Emma Roux', initials: 'ER' },
  { id: '7', name: 'Meriem Zahzouh', initials: 'ME' },
  { id: '8', name: 'Fabio Garcia', initials: 'FG' },
  { id: '9', name: 'Sonia Laurent', initials: 'SL' },
];

export function ProjectView() {
  const { data: projects, loading, refetch } = useApi<Project[]>('/projects');
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const [pageMode, setPageMode] = useState<ProjectPageMode>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'on-track' as Project['status'],
    priority: 'medium' as Project['priority'],
    startDate: '',
    deadline: '',
    budgetTotal: '',
    selectedMembers: [] as string[],
  });

  useEffect(() => {
    const ensurePortfolioFixtures = async () => {
      try {
        await apiPost('/init-sample-data', {});
        refetch();
      } catch (error) {
        console.error('Error initializing portfolio fixtures:', error);
      }
    };
    ensurePortfolioFixtures();
  }, []);

  useEffect(() => {
    if (projects && projects.length > 0) {
      setLocalProjects(projects as Project[]);
      return;
    }
    setLocalProjects(PORTFOLIO_PROJECT_FIXTURES as Project[]);
  }, [projects]);

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    const previous = localProjects;
    const updated = previous.filter(project => project.id !== projectId);
    setLocalProjects(updated);

    try {
      await apiDelete(`/projects/${projectId}`);
      refetch();
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setPageMode('list');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      const isFixtureProject = previous.some(p => p.id === projectId) && !String(projectId).startsWith('project:1') && !String(projectId).startsWith('project:2');
      if (!isFixtureProject) {
        setLocalProjects(previous);
        alert(`Erreur lors de la suppression du projet "${projectName}"`);
      }
    }
  };

  const handleArchiveProject = async (project: Project) => {
    const archivedProject = { ...project, status: 'archived' as Project['status'] };
    setLocalProjects(prev => prev.map(p => (p.id === project.id ? archivedProject : p)));

    try {
      await apiPut(`/projects/${project.id}`, {
        ...project,
        status: 'archived',
      });
      refetch();
      if (selectedProject?.id === project.id) {
        setSelectedProject(archivedProject);
      }
    } catch (error) {
      console.error('Error archiving project:', error);
      const isFixtureProject = !String(project.id).startsWith('project:1') && !String(project.id).startsWith('project:2');
      if (!isFixtureProject) {
        setLocalProjects(prev => prev.map(p => (p.id === project.id ? project : p)));
        alert('Erreur lors de l\'archivage du projet');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'archived':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'Dans les temps';
      case 'at-risk':
        return 'À risque';
      case 'delayed':
        return 'En retard';
      case 'archived':
        return 'Archive';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return 'Haute';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Basse';
      default:
        return priority;
    }
  };

  const portfolioProjects = localProjects;

  // Filtrage des projets
  const filteredProjects = portfolioProjects.filter(project => {
    if (statusFilter === 'all') return true;
    return project.status === statusFilter;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'on-track',
      priority: 'medium',
      startDate: '',
      deadline: '',
      budgetTotal: '',
      selectedMembers: [],
    });
  };

  const openCreatePage = () => {
    resetForm();
    setPageMode('create');
  };

  const openEditPage = (project: Project) => {
    const initialMemberIds = availableMembers
      .filter(m => project.team?.includes(m.initials))
      .map(m => m.id);

    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      startDate: project.startDate || '',
      deadline: project.deadline,
      budgetTotal: String(project.budget.total),
      selectedMembers: initialMemberIds,
    });
    setSelectedProject(project);
    setPageMode('edit');
  };

  const openViewPage = (project: Project) => {
    setSelectedProject(project);
    setPageMode('view');
  };

  const toggleMember = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(memberId)
        ? prev.selectedMembers.filter(id => id !== memberId)
        : [...prev.selectedMembers, memberId],
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedMemberInitials = availableMembers
        .filter(m => formData.selectedMembers.includes(m.id))
        .map(m => m.initials);

      const newProject: Project = {
        id: `project:local-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        progress: 0,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate,
        deadline: formData.deadline,
        budget: {
          used: 0,
          total: parseInt(formData.budgetTotal || '0', 10),
        },
        team: selectedMemberInitials,
        objectives: [],
      };

      setLocalProjects(prev => [newProject, ...prev]);

      await apiPost<Project>('/projects', {
        ...newProject,
      });
      await refetch();
      setPageMode('list');
      resetForm();
    } catch (error) {
      console.error('Error creating project:', error);
      // Keep local create for fixture/offline workflow
      setPageMode('list');
      resetForm();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const selectedMemberInitials = availableMembers
        .filter(m => formData.selectedMembers.includes(m.id))
        .map(m => m.initials);

      const updatedProject: Project = {
        ...selectedProject,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate,
        deadline: formData.deadline,
        budget: {
          ...selectedProject.budget,
          total: parseInt(formData.budgetTotal || '0', 10),
        },
        team: selectedMemberInitials,
      };

      const previousProjects = localProjects;
      setLocalProjects(prev => prev.map(p => (p.id === selectedProject.id ? updatedProject : p)));

      await apiPut<Project>(`/projects/${selectedProject.id}`, {
        ...updatedProject,
      });

      await refetch();
      setPageMode('list');
      setSelectedProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      const isFixtureProject = !String(selectedProject.id).startsWith('project:1') && !String(selectedProject.id).startsWith('project:2');
      if (isFixtureProject) {
        setPageMode('list');
        setSelectedProject(null);
        return;
      }
      alert('Erreur lors de la modification du projet');
    }
  };

  if (pageMode === 'create' || pageMode === 'edit') {
    const isEdit = pageMode === 'edit';
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isEdit ? 'Modifier le projet' : 'Creer un projet'}
            </h1>
            <p className="text-gray-600 mt-1">Page CRUD Portfolio Projet</p>
          </div>
          <button
            onClick={() => {
              setPageMode('list');
              if (!isEdit) resetForm();
            }}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={isEdit ? handleEditSubmit : handleCreateSubmit} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du projet *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 pr-10 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 pr-10 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="on-track">Dans les temps</option>
                <option value="at-risk">A risque</option>
                <option value="delayed">En retard</option>
                <option value="archived">Archive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorite *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Project['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de debut</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'echeance *</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget total (EUR) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.budgetTotal}
                onChange={(e) => setFormData({ ...formData, budgetTotal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Membres de l'equipe</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableMembers.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={`px-3 py-2 rounded-lg border text-sm text-left ${
                    formData.selectedMembers.includes(member.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {member.name} ({member.initials})
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPageMode('list')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {isEdit ? 'Enregistrer' : 'Creer'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (pageMode === 'view' && selectedProject) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-start sm:items-center justify-between gap-3 min-w-0 w-full">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{selectedProject.name}</h1>
              <p className="text-gray-600 mt-1">Consultation projet</p>
            </div>
            <button
              onClick={() => {
                setPageMode('list');
                setSelectedProject(null);
              }}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
            <button onClick={() => openEditPage(selectedProject)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <Edit2 className="w-4 h-4" /> Modifier
            </button>
            <button onClick={() => handleArchiveProject(selectedProject)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <Archive className="w-4 h-4" /> Archiver
            </button>
            <button
              onClick={() => handleDeleteProject(selectedProject.id, selectedProject.name)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-5">
          <p className="text-gray-700 break-words">{selectedProject.description || 'Aucune description'}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Statut</div>
              <div className="font-semibold mt-1">{getStatusLabel(selectedProject.status)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Priorite</div>
              <div className="font-semibold mt-1">{getPriorityLabel(selectedProject.priority)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Echeance</div>
              <div className="font-semibold mt-1">{new Date(selectedProject.deadline).toLocaleDateString('fr-FR')}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Avancement</div>
              <div className="font-semibold mt-1">{selectedProject.progress}%</div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">Budget</div>
            <div className="font-semibold mt-1">
              {selectedProject.budget.used.toLocaleString('fr-FR')} EUR / {selectedProject.budget.total.toLocaleString('fr-FR')} EUR
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-2">Equipe</div>
            <div className="flex flex-wrap gap-2">
              {selectedProject.team?.map((member) => (
                <span key={member} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  {member}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600 mt-1">Gérez et suivez l'avancement de vos projets</p>
        </div>
        <button className="w-full sm:w-auto justify-center flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" onClick={openCreatePage}>
          <Plus className="w-5 h-5 shrink-0" />
          Nouveau projet
        </button>
      </div>

      {/* Filters */}
      <div className="filter-toolbar">
        <FormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} wrapperClassName="w-full sm:w-auto sm:min-w-[12rem]">
          <option value="all">Tous les statuts</option>
          <option value="on-track">Dans les temps</option>
          <option value="at-risk">À risque</option>
          <option value="delayed">En retard</option>
          <option value="archived">Archive</option>
        </FormSelect>
        {statusFilter !== 'all' && (
          <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <span className="text-blue-700 font-medium">{filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''}</span>
            <button
              onClick={() => setStatusFilter('all')}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-gray-500">Chargement...</div>
        ) : portfolioProjects.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">Aucun projet créé</p>
            <button
              onClick={openCreatePage}
              className="text-blue-600 hover:underline"
            >
              Créer votre premier projet
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative"
              onClick={() => openViewPage(project)}
            >
              {/* Project Header */}
              <div className="p-6 pr-4 sm:pr-6 border-b border-gray-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 break-words">{project.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 break-words">{project.description}</p>
                  </div>
                  <div className="relative shrink-0 pr-1 sm:pr-2">
                    <div className="flex flex-col sm:flex-row gap-1">
                      <button
                        className="w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPage(project);
                        }}
                      >
                        <Edit2 className="w-4 h-4 text-gray-500 shrink-0" />
                      </button>
                      <button
                        className="w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveProject(project);
                        }}
                      >
                        <Archive className="w-4 h-4 text-gray-500 shrink-0" />
                      </button>
                      <button
                        className="w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center hover:bg-red-50 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id, project.name);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Avancement global</span>
                  <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Meta */}
              <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <div className="text-gray-500 text-xs">Échéance</div>
                    <div className="font-medium text-gray-900">
                      {new Date(project.deadline).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <div className="text-gray-500 text-xs">Budget</div>
                    <div className="font-medium text-gray-900">
                      {((project.budget.used / project.budget.total) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <UsersIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <div className="text-gray-500 text-xs">Équipe</div>
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center border-2 border-white font-medium"
                        >
                          {member}
                        </div>
                      ))}
                      {project.team.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center border-2 border-white font-medium">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}