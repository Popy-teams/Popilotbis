import { describe, it, expect } from 'vitest';
import {
  getProjectSlug,
  entityMatchesProject,
  filterByActiveProject,
} from './projectMatch';
import type { Project } from '../types';

const popyProject: Project = {
  id: 'project:popy',
  name: 'Popy - Assistant vocal',
  slug: 'popy',
  status: 'on-track',
  priority: 'high',
  progress: 65,
  startDate: '2025-01-01',
  deadline: '2026-12-31',
  team: [],
  budget: { total: 120000, used: 45000 },
  description: 'Assistant vocal',
};

const iaProject: Project = {
  id: 'portfolio-ia-emotions',
  name: 'IA Émotions',
  slug: 'ia-emotions',
  status: 'on-track',
  priority: 'medium',
  progress: 40,
  startDate: '2025-03-01',
  deadline: '2026-06-30',
  team: [],
  budget: { total: 80000, used: 20000 },
  description: 'Analyse émotionnelle',
};

describe('getProjectSlug', () => {
  it('retourne le slug explicite en minuscules', () => {
    expect(getProjectSlug(popyProject)).toBe('popy');
  });

  it('déduit popy depuis un id contenant popy', () => {
    expect(getProjectSlug({ ...popyProject, slug: undefined })).toBe('popy');
  });

  it('normalise un id portfolio', () => {
    expect(getProjectSlug(iaProject)).toBe('ia-emotions');
  });
});

describe('entityMatchesProject', () => {
  it('accepte tout si aucun projet actif', () => {
    expect(entityMatchesProject('popy', null)).toBe(true);
  });

  it('rejette une référence vide', () => {
    expect(entityMatchesProject(undefined, popyProject)).toBe(false);
  });

  it('matche par slug', () => {
    expect(entityMatchesProject('popy', popyProject)).toBe(true);
    expect(entityMatchesProject('ia-emotions', iaProject)).toBe(true);
  });

  it('ne matche pas un projet différent', () => {
    expect(entityMatchesProject('ia-emotions', popyProject)).toBe(false);
  });
});

describe('filterByActiveProject', () => {
  const items = [
    { id: '1', projectId: 'popy' },
    { id: '2', projectId: 'ia-emotions' },
    { id: '3' },
  ];

  it('filtre selon matchesProject', () => {
    const matches = (ref?: string) => ref === 'popy';
    expect(filterByActiveProject(items, matches)).toHaveLength(2);
    expect(filterByActiveProject(items, matches).map((i) => i.id)).toEqual(['1', '3']);
  });
});
