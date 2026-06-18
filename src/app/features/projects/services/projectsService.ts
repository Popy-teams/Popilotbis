import { apiDelete, apiPost, apiPut } from '../../../hooks/useApi';
import { Project } from '../../../types';

export async function initProjectsFixtures(): Promise<void> {
  await apiPost('/init-sample-data', {});
}

export async function createProject(project: Project): Promise<void> {
  await apiPost<Project>('/projects', project);
}

export async function updateProject(project: Project): Promise<void> {
  await apiPut<Project>(`/projects/${project.id}`, project);
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiDelete(`/projects/${projectId}`);
}
