/**
 * Configuration Extraction Utilities
 * Extracts and transforms fetched warehouse configurations into usable data structures
 */

import type { FetchedConfiguration } from './configurationApi';

export interface ExtractedInventoryGroup {
  name: string;
  storageIdentifiers: {
    category?: string;
    skuClassType?: string;
    skuClass?: string;
    uom?: string;
    bucket?: string;
    specialStorageIndicator?: string;
  };
  lineIdentifiers: {
    channel?: string;
    customer?: string;
  };
  description: string;
  source: 'lineSplit' | 'taskSequences' | 'taskStrategy';
  sourceId: string;
}

/**
 * Check if an object is empty (no properties or all properties are empty strings/null/undefined)
 */
function isEmptyObject(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return true;
  
  return Object.keys(obj).length === 0 || 
    Object.values(obj).every(value => 
      value === null || 
      value === undefined || 
      value === '' ||
      (typeof value === 'object' && isEmptyObject(value))
    );
}

/**
 * Create a unique key for an inventory group combination
 */
function createInventoryGroupKey(storageIds: any, lineIds: any): string {
  const storageKey = Object.entries(storageIds || {})
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
    
  const lineKey = Object.entries(lineIds || {})
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
    
  return `${storageKey}::${lineKey}`;
}

/**
 * Generate a descriptive name for an inventory group based on its identifiers
 */
function generateInventoryGroupName(storageIds: any, lineIds: any, source: string, index: number): string {
  const parts: string[] = [];
  
  // Add storage identifier parts
  if (storageIds?.category) parts.push(storageIds.category);
  if (storageIds?.uom) parts.push(storageIds.uom);
  if (storageIds?.bucket && storageIds.bucket !== 'Normal') parts.push(storageIds.bucket);
  
  // Add line identifier parts
  if (lineIds?.channel) parts.push(lineIds.channel);
  if (lineIds?.customer) parts.push(lineIds.customer);
  
  // If no meaningful parts, use source and index
  if (parts.length === 0) {
    return `${source} Group ${index + 1}`;
  }
  
  return parts.join(' - ');
}

/**
 * Generate a description for an inventory group
 */
function generateInventoryGroupDescription(
  storageIds: any, 
  lineIds: any, 
  source: string, 
  sourceId: string
): string {
  const parts: string[] = [];
  
  // Storage identifiers description
  const storageDesc: string[] = [];
  if (storageIds?.category) storageDesc.push(`Category: ${storageIds.category}`);
  if (storageIds?.uom) storageDesc.push(`UOM: ${storageIds.uom}`);
  if (storageIds?.bucket) storageDesc.push(`Bucket: ${storageIds.bucket}`);
  if (storageIds?.skuClassType) storageDesc.push(`SKU Class Type: ${storageIds.skuClassType}`);
  if (storageIds?.skuClass) storageDesc.push(`SKU Class: ${storageIds.skuClass}`);
  
  if (storageDesc.length > 0) {
    parts.push(`Storage: ${storageDesc.join(', ')}`);
  }
  
  // Line identifiers description
  const lineDesc: string[] = [];
  if (lineIds?.channel) lineDesc.push(`Channel: ${lineIds.channel}`);
  if (lineIds?.customer) lineDesc.push(`Customer: ${lineIds.customer}`);
  
  if (lineDesc.length > 0) {
    parts.push(`Line: ${lineDesc.join(', ')}`);
  }
  
  parts.push(`Source: ${source} (ID: ${sourceId})`);
  
  return parts.join(' | ');
}

/**
 * Extract inventory groups from a single configuration array
 */
function extractFromConfigArray(
  configArray: any[], 
  source: 'lineSplit' | 'taskSequences' | 'taskStrategy'
): ExtractedInventoryGroup[] {
  if (!Array.isArray(configArray)) return [];
  
  const groups: ExtractedInventoryGroup[] = [];
  
  configArray.forEach((config, index) => {
    if (!config || typeof config !== 'object') return;
    
    const storageIds = config.storageIdentifiers || {};
    const lineIds = config.lineIdentifiers || {};
    
    // Skip if both storage and line identifiers are empty
    if (isEmptyObject(storageIds) && isEmptyObject(lineIds)) {
      return;
    }
    
    const group: ExtractedInventoryGroup = {
      name: generateInventoryGroupName(storageIds, lineIds, source, index),
      storageIdentifiers: {
        category: storageIds.category || undefined,
        skuClassType: storageIds.skuClassType || undefined,
        skuClass: storageIds.skuClass || undefined,
        uom: storageIds.uom || undefined,
        bucket: storageIds.bucket || undefined,
        specialStorageIndicator: storageIds.specialStorageIndicator || undefined,
      },
      lineIdentifiers: {
        channel: lineIds.channel || undefined,
        customer: lineIds.customer || undefined,
      },
      description: generateInventoryGroupDescription(storageIds, lineIds, source, config.id || `${index}`),
      source,
      sourceId: config.id || `${source}_${index}`,
    };
    
    groups.push(group);
  });
  
  return groups;
}

/**
 * Extract all inventory groups from fetched configuration data
 */
export function extractInventoryGroups(fetchedConfig: FetchedConfiguration): ExtractedInventoryGroup[] {
  if (!fetchedConfig?.configurations) {
    console.warn('No configurations found in fetched data');
    return [];
  }
  
  const allGroups: ExtractedInventoryGroup[] = [];
  const seenKeys = new Set<string>();
  
  // Extract from lineSplit configurations
  if (fetchedConfig.configurations.lineSplit) {
    const lineSplitGroups = extractFromConfigArray(fetchedConfig.configurations.lineSplit, 'lineSplit');
    console.log(`Extracted ${lineSplitGroups.length} groups from lineSplit`);
    allGroups.push(...lineSplitGroups);
  }
  
  // Extract from taskSequences configurations
  if (fetchedConfig.configurations.taskSequences) {
    const taskSequenceGroups = extractFromConfigArray(fetchedConfig.configurations.taskSequences, 'taskSequences');
    console.log(`Extracted ${taskSequenceGroups.length} groups from taskSequences`);
    allGroups.push(...taskSequenceGroups);
  }
  
  // Extract from taskStrategy configurations
  if (fetchedConfig.configurations.taskStrategy) {
    const taskStrategyGroups = extractFromConfigArray(fetchedConfig.configurations.taskStrategy, 'taskStrategy');
    console.log(`Extracted ${taskStrategyGroups.length} groups from taskStrategy`);
    allGroups.push(...taskStrategyGroups);
  }
  
  // Remove duplicates based on storage and line identifier combinations
  const uniqueGroups: ExtractedInventoryGroup[] = [];
  
  allGroups.forEach(group => {
    const key = createInventoryGroupKey(group.storageIdentifiers, group.lineIdentifiers);
    
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueGroups.push(group);
    } else {
      console.log(`Skipping duplicate inventory group: ${group.name}`);
    }
  });
  
  console.log(`Total unique inventory groups extracted: ${uniqueGroups.length}`);
  return uniqueGroups;
}

/**
 * Convert extracted inventory groups to the format expected by the UI
 */
export function formatInventoryGroupsForUI(extractedGroups: ExtractedInventoryGroup[]) {
  return extractedGroups.map(group => ({
    userId: 1, // Mock user ID
    name: group.name,
    storageIdentifiers: {
      // Remove undefined values
      ...Object.fromEntries(
        Object.entries(group.storageIdentifiers)
          .filter(([_, value]) => value !== undefined)
      )
    },
    lineIdentifiers: {
      // Remove undefined values
      ...Object.fromEntries(
        Object.entries(group.lineIdentifiers)
          .filter(([_, value]) => value !== undefined)
      )
    },
    description: group.description,
  }));
}

/**
 * Get summary statistics about extracted inventory groups
 */
export function getExtractionSummary(extractedGroups: ExtractedInventoryGroup[]) {
  const summary = {
    total: extractedGroups.length,
    bySource: {
      lineSplit: extractedGroups.filter(g => g.source === 'lineSplit').length,
      taskSequences: extractedGroups.filter(g => g.source === 'taskSequences').length,
      taskStrategy: extractedGroups.filter(g => g.source === 'taskStrategy').length,
    },
    storageIdentifierTypes: new Set<string>(),
    lineIdentifierTypes: new Set<string>(),
  };
  
  extractedGroups.forEach(group => {
    Object.keys(group.storageIdentifiers).forEach(key => {
      if (group.storageIdentifiers[key as keyof typeof group.storageIdentifiers]) {
        summary.storageIdentifierTypes.add(key);
      }
    });
    
    Object.keys(group.lineIdentifiers).forEach(key => {
      if (group.lineIdentifiers[key as keyof typeof group.lineIdentifiers]) {
        summary.lineIdentifierTypes.add(key);
      }
    });
  });
  
  return {
    ...summary,
    storageIdentifierTypes: Array.from(summary.storageIdentifierTypes),
    lineIdentifierTypes: Array.from(summary.lineIdentifierTypes),
  };
}