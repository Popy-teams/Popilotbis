import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_PROJECT_FIXTURES } from '../../../data/portfolioProjectsFixtures';
import type { Project } from '../../../types';
import { ProjectsListPage } from './ProjectsListPage';

describe('ProjectsListPage', () => {
  it('affiche le portfolio sans erreur', () => {
    const projects = PORTFOLIO_PROJECT_FIXTURES as Project[];
    render(
      <ProjectsListPage
        loading={false}
        projects={projects}
        viewMode="cards"
        sortKey="deadline"
        sortDirection="asc"
        statusFilter="all"
        onViewModeChange={vi.fn()}
        onSortChange={vi.fn()}
        onStatusFilterChange={vi.fn()}
        onCreate={vi.fn()}
        onOpen={vi.fn()}
        onEdit={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Portfolio Projets')).toBeInTheDocument();
  });

  it('tolère un projet sans budget en mode tableau', () => {
    const broken = {
      ...(PORTFOLIO_PROJECT_FIXTURES[0] as Project),
      budget: undefined,
    } as unknown as Project;

    expect(() =>
      render(
        <ProjectsListPage
          loading={false}
          projects={[broken]}
          viewMode="table"
          sortKey="deadline"
          sortDirection="asc"
          statusFilter="all"
          onViewModeChange={vi.fn()}
          onSortChange={vi.fn()}
          onStatusFilterChange={vi.fn()}
          onCreate={vi.fn()}
          onOpen={vi.fn()}
          onEdit={vi.fn()}
          onArchive={vi.fn()}
          onDelete={vi.fn()}
        />
      )
    ).not.toThrow();
  });
});
