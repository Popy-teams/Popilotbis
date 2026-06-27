import { describe, expect, it } from 'vitest';
import { buildYearGanttDemo } from '../data/yearGanttDemo';
import {
  buildDetailRows,
  buildGanttGridRows,
  ganttExcelFilename,
} from './ganttExcelExport';

describe('ganttExcelExport', () => {
  const items = buildYearGanttDemo();

  it('génère des lignes de planning détaillé', () => {
    const rows = buildDetailRows(items);
    expect(rows[0]).toContain('Catégorie');
    expect(rows.length).toBeGreaterThan(10);
  });

  it('génère une grille hebdomadaire', () => {
    const rows = buildGanttGridRows(items, 2026);
    expect(rows[0][0]).toBe('Activité');
    expect(rows[0][1]).toBe('S1');
    expect(rows.length).toBeGreaterThan(5);
  });

  it('produit un nom de fichier .xlsx', () => {
    expect(ganttExcelFilename('Projet POPY', 2026)).toBe('Gantt-Projet-POPY-2026.xlsx');
  });
});
