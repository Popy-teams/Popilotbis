import { describe, it, expect } from 'vitest';
import { Target } from 'lucide-react';
import {
  rehydrateAuditBlocks,
  serializeAuditBlocks,
  mergeAuditBlocks,
  AUDIT_BLOCK_ICONS,
  type AuditBlockData,
} from './auditHelpers';

describe('auditHelpers', () => {
  const storedBlock = {
    id: 'context' as const,
    projectId: 'popy',
    title: 'Contexte',
    subtitle: 'Sous-titre',
    color: 'purple',
    isoRef: 'ISO §4',
    score: 80,
    criteria: [],
    keyQuestion: 'Pourquoi ?',
  };

  it('rehydrate les icônes Lucide depuis le stockage', () => {
    const blocks = rehydrateAuditBlocks([storedBlock]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].icon).toBe(AUDIT_BLOCK_ICONS.context);
    expect(blocks[0].projectId).toBe('popy');
  });

  it('ignore les blocs invalides', () => {
    expect(rehydrateAuditBlocks([{ ...storedBlock, id: 'invalid' as 'context' }])).toHaveLength(0);
    expect(rehydrateAuditBlocks(null as unknown as [])).toEqual([]);
  });

  it('serialize retire les icônes non sérialisables', () => {
    const block: AuditBlockData = {
      ...storedBlock,
      icon: Target,
      criteria: [],
    };
    const serialized = serializeAuditBlocks([block]);
    expect(serialized[0]).not.toHaveProperty('icon');
    expect(serialized[0].title).toBe('Contexte');
  });

  it('mergeAuditBlocks fusionne par projet et bloc sans écraser', () => {
    const popy = { ...storedBlock, projectId: 'popy', title: 'POPY contexte' };
    const other = { ...storedBlock, projectId: 'firmware-v2', title: 'Firmware contexte' };
    const merged = mergeAuditBlocks([popy], [other]);
    expect(merged).toHaveLength(2);
    expect(merged.map((b) => b.projectId).sort()).toEqual(['firmware-v2', 'popy']);
  });
});
