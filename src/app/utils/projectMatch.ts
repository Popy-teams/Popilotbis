import type { Project } from '../types';

export function getProjectSlug(project: Project): string {
  if (project.slug) return project.slug.toLowerCase();
  const id = project.id.toLowerCase();
  if (id.includes('popy')) return 'popy';
  return id.replace(/^project:/, '').replace(/^portfolio-/, '');
}

/** Vérifie si une référence projet (id, slug, nom) correspond au projet actif */
export function entityMatchesProject(
  entityProjectRef: string | undefined,
  activeProject: Project | null
): boolean {
  if (!activeProject) return true;
  if (!entityProjectRef) return false;

  const ref = entityProjectRef.toLowerCase().trim();
  const activeId = activeProject.id.toLowerCase();
  const slug = getProjectSlug(activeProject);
  const name = activeProject.name.toLowerCase();

  if (ref === activeId || ref === slug) return true;
  if (name.includes(ref) || ref.includes(slug)) return true;
  if (ref.includes('popy') && (slug.includes('popy') || name.includes('popy'))) return true;
  return false;
}

export type WithOptionalProjectId = { projectId?: string };

export function filterByActiveProject<T extends WithOptionalProjectId>(
  items: T[],
  matchesProject: (ref?: string) => boolean,
  legacyDefault = 'popy'
): T[] {
  return items.filter((item) => matchesProject(item.projectId ?? legacyDefault));
}
