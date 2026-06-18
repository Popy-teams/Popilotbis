import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  computeProjectStatus,
  getDaysUntilDeadline,
  getStatusLabel,
} from './projectPresentation';

describe('computeProjectStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('conserve le statut archivé', () => {
    expect(
      computeProjectStatus({ deadline: '2099-01-01', progress: 0, status: 'archived' })
    ).toBe('archived');
  });

  it('retourne completed à 100 %', () => {
    expect(computeProjectStatus({ deadline: '2099-01-01', progress: 100 })).toBe('completed');
  });

  it('retourne delayed après échéance', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-18'));
    expect(computeProjectStatus({ deadline: '2026-06-01', progress: 50 })).toBe('delayed');
  });

  it('retourne at-risk dans les 14 jours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-18'));
    expect(computeProjectStatus({ deadline: '2026-06-25', progress: 30 })).toBe('at-risk');
  });

  it('retourne on-track au-delà de 14 jours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-18'));
    expect(computeProjectStatus({ deadline: '2026-08-01', progress: 10 })).toBe('on-track');
  });
});

describe('getDaysUntilDeadline', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('calcule les jours restants', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-18'));
    expect(getDaysUntilDeadline('2026-06-25')).toBe(7);
  });
});

describe('getStatusLabel', () => {
  it('traduit completed', () => {
    expect(getStatusLabel('completed')).toBe('Terminé');
  });
});
