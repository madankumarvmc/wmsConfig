import { describe, it, expect } from 'vitest';
import { extractInventoryGroups } from '../../lib/configurationExtraction';

describe('configurationExtraction', () => {
  describe('extractInventoryGroups', () => {
    it('extracts inventory groups from line split data', () => {
      const mockData = {
        lineSplit: [
          {
            id: '1',
            whId: 'TEST_WH',
            storageIdentifier: { area: 'A1' },
            lineIdentifier: { lane: 'L1' },
          },
          {
            id: '2', 
            whId: 'TEST_WH',
            storageIdentifier: { area: 'B1' },
            lineIdentifier: { lane: 'L2' },
          },
        ],
        taskSequences: [],
        taskStrategy: [],
      };

      const result = extractInventoryGroups(mockData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        name: 'A1 - L1',
        storageIdentifiers: { area: 'A1' },
        lineIdentifiers: { lane: 'L1' },
        source: 'lineSplit',
        warehouseId: 'TEST_WH',
      });
    });

    it('handles empty data gracefully', () => {
      const result = extractInventoryGroups({
        lineSplit: [],
        taskSequences: [],
        taskStrategy: [],
      });

      expect(result).toHaveLength(0);
    });

    it('extracts groups from task sequences', () => {
      const mockData = {
        lineSplit: [],
        taskSequences: [
          {
            id: 'ts1',
            whId: 'TEST_WH',
            storageIdentifier: { zone: 'Z1' },
            lineIdentifier: { line: 'LINE1' },
          },
        ],
        taskStrategy: [],
      };

      const result = extractInventoryGroups(mockData);

      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('taskSequences');
      expect(result[0].name).toBe('Z1 - LINE1');
    });

    it('extracts groups from task strategy', () => {
      const mockData = {
        lineSplit: [],
        taskSequences: [],
        taskStrategy: [
          {
            id: 'st1',
            whId: 'WAREHOUSE_1',
            storageIdentifier: { building: 'B1' },
            lineIdentifier: { dock: 'D1' },
          },
        ],
      };

      const result = extractInventoryGroups(mockData);

      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('taskStrategy');
      expect(result[0].name).toBe('B1 - D1');
    });

    it('removes duplicates based on storage and line identifiers', () => {
      const mockData = {
        lineSplit: [
          {
            id: '1',
            whId: 'TEST_WH',
            storageIdentifier: { area: 'A1' },
            lineIdentifier: { lane: 'L1' },
          },
          {
            id: '2',
            whId: 'TEST_WH', 
            storageIdentifier: { area: 'A1' }, // Duplicate
            lineIdentifier: { lane: 'L1' }, // Duplicate
          },
        ],
        taskSequences: [],
        taskStrategy: [],
      };

      const result = extractInventoryGroups(mockData);

      expect(result).toHaveLength(1);
    });

    it('generates fallback names for invalid identifiers', () => {
      const mockData = {
        lineSplit: [
          {
            id: '1',
            whId: 'TEST_WH',
            storageIdentifier: null,
            lineIdentifier: undefined,
          },
        ],
        taskSequences: [],
        taskStrategy: [],
      };

      const result = extractInventoryGroups(mockData);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Group 1');
    });
  });
});