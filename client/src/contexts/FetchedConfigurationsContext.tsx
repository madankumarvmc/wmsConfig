import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LineSplitConfig, TaskSequenceConfig, TaskStrategyConfig, BinSearchConfig } from '@/types/outbound-v05';

export interface FetchedConfigurationsData {
  lineSplit: LineSplitConfig[];
  taskSequences: TaskSequenceConfig[];
  taskStrategy: TaskStrategyConfig[];
  binSearch: BinSearchConfig[];
}

export interface FieldSource {
  source: 'api' | 'empty' | 'modified';
  fetchedValue?: any;
}

export interface FetchedConfigurationsContextType {
  data: FetchedConfigurationsData;
  isLoading: boolean;
  fetchedAt: string | null;
  warehouseCode: string | null;
  fieldSources: Record<string, FieldSource>;
  fetchConfigurations: (warehouseCode: string, apiEndpoints: Record<string, string>) => Promise<void>;
  clearFetchedData: () => void;
  updateFieldSource: (fieldPath: string, source: FieldSource) => void;
  getFieldSource: (fieldPath: string) => FieldSource;
  trackFieldValue: (fieldPath: string, value: any) => void;
}

const FetchedConfigurationsContext = createContext<FetchedConfigurationsContextType | undefined>(undefined);

const STORAGE_KEY = 'fetchedConfigurations';

export function FetchedConfigurationsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FetchedConfigurationsData>({
    lineSplit: [],
    taskSequences: [],
    taskStrategy: [],
    binSearch: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [warehouseCode, setWarehouseCode] = useState<string | null>(null);
  const [fieldSources, setFieldSources] = useState<Record<string, FieldSource>>({});

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed.data || { lineSplit: [], taskSequences: [], taskStrategy: [], binSearch: [] });
        setFetchedAt(parsed.fetchedAt || null);
        setWarehouseCode(parsed.warehouseCode || null);
        setFieldSources(parsed.fieldSources || {});
      }
    } catch (error) {
      console.error('Error loading fetched configurations from sessionStorage:', error);
    }
  }, []);

  // Save to sessionStorage when data changes
  useEffect(() => {
    try {
      const dataToStore = {
        data,
        fetchedAt,
        warehouseCode,
        fieldSources
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving fetched configurations to sessionStorage:', error);
    }
  }, [data, fetchedAt, warehouseCode, fieldSources]);

  const fetchConfigurations = async (whCode: string, apiEndpoints: Record<string, string>) => {
    setIsLoading(true);
    try {
      // Use proxy to avoid CORS issues
      const response = await fetch('/api/proxy/fetch-configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          warehouseCode: whCode,
          apiEndpoints
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const fetchedConfig = await response.json();
      
      // Transform the raw API data into our typed structures
      const transformedData: FetchedConfigurationsData = {
        lineSplit: transformLineSplitData(fetchedConfig.configurations.lineSplit || []),
        taskSequences: transformTaskSequenceData(fetchedConfig.configurations.taskSequences || []),
        taskStrategy: transformTaskStrategyData(fetchedConfig.configurations.taskStrategy || []),
        binSearch: transformBinSearchData(fetchedConfig.configurations.binSearch || [])
      };

      // Create field sources mapping for all fetched fields
      const newFieldSources = createFieldSourcesMapping(transformedData);

      setData(transformedData);
      setFetchedAt(fetchedConfig.fetchedAt);
      setWarehouseCode(whCode);
      setFieldSources(newFieldSources);

    } catch (error) {
      console.error('Error fetching configurations:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearFetchedData = () => {
    setData({
      lineSplit: [],
      taskSequences: [],
      taskStrategy: [],
      binSearch: []
    });
    setFetchedAt(null);
    setWarehouseCode(null);
    setFieldSources({});
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const updateFieldSource = (fieldPath: string, source: FieldSource) => {
    setFieldSources(prev => ({
      ...prev,
      [fieldPath]: source
    }));
  };

  const getFieldSource = (fieldPath: string): FieldSource => {
    return fieldSources[fieldPath] || { source: 'empty' };
  };

  const trackFieldValue = (fieldPath: string, value: any) => {
    const currentSource = fieldSources[fieldPath];
    
    // If field has API data, check if it's been modified
    if (currentSource?.source === 'api') {
      const isModified = JSON.stringify(currentSource.fetchedValue) !== JSON.stringify(value);
      if (isModified && value !== null && value !== undefined && value !== '') {
        updateFieldSource(fieldPath, { source: 'modified', fetchedValue: currentSource.fetchedValue });
      }
    } 
    // If field was empty and now has a value, mark as modified
    else if (!currentSource || currentSource.source === 'empty') {
      if (value !== null && value !== undefined && value !== '' && 
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === 'object' && Object.keys(value).length === 0)) {
        updateFieldSource(fieldPath, { source: 'modified', fetchedValue: value });
      }
    }
  };

  const value: FetchedConfigurationsContextType = {
    data,
    isLoading,
    fetchedAt,
    warehouseCode,
    fieldSources,
    fetchConfigurations,
    clearFetchedData,
    updateFieldSource,
    getFieldSource,
    trackFieldValue
  };

  return (
    <FetchedConfigurationsContext.Provider value={value}>
      {children}
    </FetchedConfigurationsContext.Provider>
  );
}

export function useFetchedConfigurations() {
  const context = useContext(FetchedConfigurationsContext);
  if (context === undefined) {
    throw new Error('useFetchedConfigurations must be used within a FetchedConfigurationsProvider');
  }
  return context;
}

// Helper functions to transform API data into typed structures
function transformLineSplitData(apiData: any[]): LineSplitConfig[] {
  return apiData.map((item: any) => ({
    id: item.id || crypto.randomUUID(),
    whId: item.whId,
    storageIdentifiers: item.storageIdentifiers || {},
    lineIdentifiers: item.lineIdentifiers || {},
    sequence: item.sequence || 0,
    mode: item.mode || 'nosplit',
    allowedUOMs: item.allowedUOMs || ['L0']
  }));
}

function transformTaskSequenceData(apiData: any[]): TaskSequenceConfig[] {
  return apiData.map((item: any) => ({
    id: item.id || crypto.randomUUID(),
    whId: item.whId,
    storageIdentifiers: item.storageIdentifiers || {},
    lineIdentifiers: item.lineIdentifiers || {},
    sequence: item.sequence || 0,
    taskSequence: item.taskSequence || [{ taskKind: 'OUTBOUND_PICK', taskSubKind: 'SINGLE' }],
    ginAckByApi: item.ginAckByApi || false,
    ginAckLevel: item.ginAckLevel || 'LINE',
    grnTriggerTask: item.grnTriggerTask || ''
  }));
}

function transformTaskStrategyData(apiData: any[]): TaskStrategyConfig[] {
  return apiData.map((item: any) => ({
    id: item.id || crypto.randomUUID(),
    whId: item.whId,
    taskKind: item.taskKind || 'OUTBOUND_PICK',
    taskSubKind: item.taskSubKind || 'SINGLE',
    taskAttrs: item.taskAttrs || {},
    storageIdentifiers: item.storageIdentifiers || {},
    lineIdentifiers: item.lineIdentifiers || {},
    locationIdentifiers: item.locationIdentifiers || {},
    strat: item.strat || 'FIFO',
    sortingStrategy: item.sortingStrategy || 'BATCH',
    loadingStrategy: item.loadingStrategy || 'SEQUENTIAL',
    groupBy: item.groupBy || [],
    sequence: item.sequence || 0,
    taskLabel: item.taskLabel || 'Pick Task',
    tripType: item.tripType || 'SINGLE',
    huKinds: item.huKinds || ['TOTE'],
    mapSegregationGroupsToBins: item.mapSegregationGroupsToBins || false,
    dropHUInBin: item.dropHUInBin || false,
    scanDestHUInDrop: item.scanDestHUInDrop || false,
    allowHUBreakInDrop: item.allowHUBreakInDrop || false,
    scanSourceHUKind: item.scanSourceHUKind || 'TOTE',
    pickSourceHUKind: item.pickSourceHUKind || 'TOTE',
    carrierHUKind: item.carrierHUKind || 'TOTE',
    huMappingMode: item.huMappingMode || 'AUTO',
    useDockdoorAssignment: item.useDockdoorAssignment || false,
    params: item.params || {},
    dropHUQuantThreshold: item.dropHUQuantThreshold || 0,
    strictBatchAdherence: item.strictBatchAdherence || false,
    allowWorkOrderSplit: item.allowWorkOrderSplit || false,
    undoOp: item.undoOp || false,
    disableWorkOrder: item.disableWorkOrder || false,
    allowUnpick: item.allowUnpick || false,
    supportPalletScan: item.supportPalletScan || false,
    loadingUnits: item.loadingUnits || [],
    pickMandatoryScan: item.pickMandatoryScan || false,
    dropMandatoryScan: item.dropMandatoryScan || false,
    dropUOM: item.dropUOM || 'L0',
    allowComplete: item.allowComplete || true,
    swapHUThreshold: item.swapHUThreshold || 0,
    dropInnerHU: item.dropInnerHU || false,
    allowInnerHUBreak: item.allowInnerHUBreak || false,
    displayDropUOM: item.displayDropUOM || false,
    autoUOMConversion: item.autoUOMConversion || false,
    mobileSorting: item.mobileSorting || false,
    sortingParam: item.sortingParam || 'SEQUENCE',
    huWeightThreshold: item.huWeightThreshold || 0,
    qcMismatchMonthThreshold: item.qcMismatchMonthThreshold || 3,
    quantSlottingForHUsInDrop: item.quantSlottingForHUsInDrop || false,
    allowPickingMultiBatchfromHU: item.allowPickingMultiBatchfromHU || false,
    displayEditPickQuantity: item.displayEditPickQuantity || false,
    pickBundles: item.pickBundles || false,
    groupByValues: item.groupByValues || {},
    enableEditQtyInPickOp: item.enableEditQtyInPickOp || false,
    dropSlottingMode: item.dropSlottingMode || 'AUTO',
    enableManualDestBinSelection: item.enableManualDestBinSelection || false,
    interimStrat: item.interimStrat || 'FIFO',
    enableLabelPrint: item.enableLabelPrint || false,
    ignorePreferredHUKind: item.ignorePreferredHUKind || false,
    recordExcessAsQuality: item.recordExcessAsQuality || false
  }));
}

function transformBinSearchData(apiData: any[]): BinSearchConfig[] {
  return apiData.map((item: any) => ({
    id: item.id || crypto.randomUUID(),
    whId: item.whId,
    storageIdentifiers: item.storageIdentifiers || {},
    lineIdentifiers: item.lineIdentifiers || {},
    taskType: item.taskType || 'OUTBOUND_PICK',
    taskSubKind: item.taskSubKind || 'SINGLE',
    taskAttrs: item.taskAttrs || {},
    mode: item.mode || 'PICK',
    priority: item.priority || 1,
    skipZoneFace: item.skipZoneFace || '',
    orderByQuantUpdatedAt: item.orderByQuantUpdatedAt || false,
    searchScope: item.searchScope || 'WH',
    preferFixed: item.preferFixed || false,
    preferNonFixed: item.preferNonFixed || false,
    statePreferenceSeq: item.statePreferenceSeq || [],
    batchPreferenceMode: item.batchPreferenceMode || 'FIFO',
    areaTypes: item.areaTypes || [],
    areas: item.areas || [],
    orderByPickingPosition: item.orderByPickingPosition || false,
    useInventorySnapshotForPickSlotting: item.useInventorySnapshotForPickSlotting || false,
    optimizationMode: item.optimizationMode || 'TOUCH',
    disallowedBinTypes: item.disallowedBinTypes || [],
    sortingMode: item.sortingMode || 'SEQUENCE'
  }));
}

function createFieldSourcesMapping(data: FetchedConfigurationsData): Record<string, FieldSource> {
  const sources: Record<string, FieldSource> = {};
  
  // Helper to mark fields that have API data
  const markFieldsWithData = (configArray: any[], configType: string) => {
    configArray.forEach((config, configIndex) => {
      Object.entries(config).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && 
            (typeof value !== 'object' || (Array.isArray(value) && value.length > 0) || 
             (typeof value === 'object' && Object.keys(value).length > 0))) {
          const fieldPath = `${configType}.${configIndex}.${key}`;
          sources[fieldPath] = { source: 'api', fetchedValue: value };
          
          // For nested objects, mark individual fields
          if (typeof value === 'object' && !Array.isArray(value)) {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== null && nestedValue !== undefined && nestedValue !== '') {
                sources[`${fieldPath}.${nestedKey}`] = { source: 'api', fetchedValue: nestedValue };
              }
            });
          }
        }
      });
    });
  };

  markFieldsWithData(data.lineSplit, 'lineSplit');
  markFieldsWithData(data.taskSequences, 'taskSequences');
  markFieldsWithData(data.taskStrategy, 'taskStrategy');
  markFieldsWithData(data.binSearch, 'binSearch');

  return sources;
}