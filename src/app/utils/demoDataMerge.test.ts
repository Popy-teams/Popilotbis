import { describe, it, expect } from 'vitest';
import { mergeDemoData } from './demoDataMerge';

describe('mergeDemoData', () => {
  it('conserve les entrées existantes', () => {
    const saved = [{ id: 'a', value: 1 }];
    const pool = [{ id: 'a', value: 99 }, { id: 'b', value: 2 }];
    const result = mergeDemoData(saved, pool);
    expect(result).toEqual([
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
    ]);
  });

  it('fusionne plusieurs pools sans doublons', () => {
    const saved = [{ id: 1, label: 'x' }];
    const result = mergeDemoData(
      saved,
      [{ id: 2, label: 'y' }],
      [{ id: 2, label: 'dup' }, { id: 3, label: 'z' }]
    );
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it('retourne une copie si pools vides', () => {
    const saved = [{ id: 'only', value: true }];
    expect(mergeDemoData(saved)).toEqual(saved);
    expect(mergeDemoData(saved)).not.toBe(saved);
  });
});
