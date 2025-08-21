/**
 * TypeScript interfaces for Outbound Configuration V0.5
 * Based on the fetched configuration data structures and specification
 */

// Base identifiers that are common across configurations
export interface StorageIdentifiers {
  category?: string;
  skuClassType?: string;
  skuClass?: string;
  uom?: string;
  bucket?: string;
  specialStorageIndicator?: string;
  preferredHUKind?: string;
}

export interface LineIdentifiers {
  channel?: string;
  vendor?: string;
  asnType?: string;
  customer?: string;
}

export interface LocationIdentifiers {
  area?: string;
  zone?: string;
  aisle?: string;
  bin?: string;
}

// Line Split Configuration (corresponds to lineSplit in fetched data)
export interface LineSplitConfig {
  id?: string;
  whId?: number;
  storageIdentifiers: StorageIdentifiers;
  lineIdentifiers: LineIdentifiers;
  sequence: number;
  mode: 'nosplit' | 'split-by-uom' | 'split-by-weight' | 'mod';
  allowedUOMs: string[];
}

// Task Sequence Configuration (corresponds to taskSequences in fetched data)
export interface TaskSequenceConfig {
  id?: string;
  whId?: number;
  storageIdentifiers: StorageIdentifiers;
  lineIdentifiers: LineIdentifiers;
  sequence: number;
  taskSequence: Array<{
    taskKind: string;
    taskSubKind: string;
  }>;
  ginAckByApi?: boolean;
  ginAckLevel?: string;
  grnTriggerTask?: string;
}

// Task Strategy Configuration (corresponds to taskStrategy in fetched data)
export interface TaskStrategyConfig {
  id?: string;
  whId?: number;
  taskKind: string;
  taskSubKind: string;
  taskAttrs: Record<string, any>;
  storageIdentifiers: StorageIdentifiers;
  lineIdentifiers: LineIdentifiers;
  locationIdentifiers: LocationIdentifiers;
  strat?: string;
  sortingStrategy?: string;
  loadingStrategy?: string;
  groupBy: string[];
  sequence: number;
  taskLabel: string;
  tripType?: string;
  huKinds: string[];
  mapSegregationGroupsToBins: boolean;
  dropHUInBin: boolean;
  scanDestHUInDrop: boolean;
  allowHUBreakInDrop: boolean;
  scanSourceHUKind: string;
  pickSourceHUKind: string;
  carrierHUKind: string;
  huMappingMode?: string;
  useDockdoorAssignment: boolean;
  params: Record<string, any>;
  dropHUQuantThreshold?: number;
  strictBatchAdherence: boolean;
  allowWorkOrderSplit: boolean;
  undoOp: boolean;
  disableWorkOrder: boolean;
  allowUnpick: boolean;
  supportPalletScan: boolean;
  loadingUnits?: any[];
  pickMandatoryScan: boolean;
  dropMandatoryScan: boolean;
  dropUOM?: string;
  allowComplete: boolean;
  swapHUThreshold?: number;
  dropInnerHU: boolean;
  allowInnerHUBreak: boolean;
  displayDropUOM: boolean;
  autoUOMConversion: boolean;
  mobileSorting: boolean;
  sortingParam: string;
  huWeightThreshold?: number;
  qcMismatchMonthThreshold?: number;
  quantSlottingForHUsInDrop: boolean;
  allowPickingMultiBatchfromHU: boolean;
  displayEditPickQuantity: boolean;
  pickBundles: boolean;
  groupByValues: Record<string, any>;
  enableEditQtyInPickOp: boolean;
  dropSlottingMode: string;
  enableManualDestBinSelection: boolean;
  interimStrat?: string;
  enableLabelPrint: boolean;
  ignorePreferredHUKind: boolean;
  recordExcessAsQuality: boolean;
}

// Bin Search Configuration (new - not in fetched data)
export interface BinSearchConfig {
  id?: string;
  whId?: number;
  storageIdentifiers: StorageIdentifiers;
  lineIdentifiers: LineIdentifiers;
  taskType: string;
  taskSubKind: string;
  taskAttrs: Record<string, any>;
  mode: 'PICK' | 'PUTAWAY' | 'REPLENISHMENT';
  priority: number;
  skipZoneFace?: string;
  orderByQuantUpdatedAt: boolean;
  searchScope: 'WH' | 'AREA' | 'ZONE';
  preferFixed: boolean;
  preferNonFixed: boolean;
  statePreferenceSeq: string[];
  batchPreferenceMode: string;
  areaTypes: string[];
  areas: string[];
  orderByPickingPosition: boolean;
  useInventorySnapshotForPickSlotting: boolean;
  optimizationMode: 'TOUCH' | 'DISTANCE';
  disallowedBinTypes: string[];
  sortingMode: string;
}

// Combined V0.5 Configuration State
export interface OutboundV05Config {
  lineSplit: LineSplitConfig[];
  taskSequence: TaskSequenceConfig[];
  taskStrategy: TaskStrategyConfig[];
  binSearch: BinSearchConfig[];
}

// Form data interfaces for React Hook Form
export interface LineSplitFormData {
  storageIdentifiers: StorageIdentifiers;
  lineIdentifiers: LineIdentifiers;
  sequence: number;
  mode: string;
  allowedUOMs: string[];
}

export interface TaskSequenceFormData {
  storageIdentifiers: StorageIdentifiers;
  lineIdentifiers: LineIdentifiers;
  sequence: number;
  taskSequence: Array<{ taskKind: string; taskSubKind: string }>;
  ginAckByApi: boolean;
  ginAckLevel: string;
  grnTriggerTask: string;
}

export interface TaskStrategyFormData {
  // Identifiers
  storageIdentifiers: StorageIdentifiers;
  lineIdentifiers: LineIdentifiers;
  locationIdentifiers: LocationIdentifiers;
  
  // Planning
  taskKind: string;
  taskSubKind: string;
  taskAttrs: Record<string, any>;
  strat: string;
  sortingStrategy: string;
  loadingStrategy: string;
  groupBy: string[];
  
  // Execution & HU
  sequence: number;
  taskLabel: string;
  tripType: string;
  huKinds: string[];
  mapSegregationGroupsToBins: boolean;
  dropHUInBin: boolean;
  scanDestHUInDrop: boolean;
  allowHUBreakInDrop: boolean;
  scanSourceHUKind: string;
  pickSourceHUKind: string;
  carrierHUKind: string;
  huMappingMode: string;
  useDockdoorAssignment: boolean;
  params: Record<string, any>;
  dropHUQuantThreshold: number;
  strictBatchAdherence: boolean;
  allowWorkOrderSplit: boolean;
  undoOp: boolean;
  disableWorkOrder: boolean;
  allowUnpick: boolean;
  supportPalletScan: boolean;
  loadingUnits: any[];
  pickMandatoryScan: boolean;
  dropMandatoryScan: boolean;
  dropUOM: string;
  allowComplete: boolean;
  swapHUThreshold: number;
  dropInnerHU: boolean;
  allowInnerHUBreak: boolean;
  displayDropUOM: boolean;
  autoUOMConversion: boolean;
  mobileSorting: boolean;
  sortingParam: string;
  huWeightThreshold: number;
  qcMismatchMonthThreshold: number;
  quantSlottingForHUsInDrop: boolean;
  allowPickingMultiBatchfromHU: boolean;
  displayEditPickQuantity: boolean;
  pickBundles: boolean;
  groupByValues: Record<string, any>;
  enableEditQtyInPickOp: boolean;
  dropSlottingMode: string;
  enableManualDestBinSelection: boolean;
  interimStrat: string;
  enableLabelPrint: boolean;
  ignorePreferredHUKind: boolean;
  recordExcessAsQuality: boolean;
}

export interface BinSearchFormData {
  storageIdentifiers: StorageIdentifiers;
  lineIdentifiers: LineIdentifiers;
  taskType: string;
  taskSubKind: string;
  taskAttrs: Record<string, any>;
  mode: string;
  priority: number;
  skipZoneFace: string;
  orderByQuantUpdatedAt: boolean;
  searchScope: string;
  preferFixed: boolean;
  preferNonFixed: boolean;
  statePreferenceSeq: string[];
  batchPreferenceMode: string;
  areaTypes: string[];
  areas: string[];
  orderByPickingPosition: boolean;
  useInventorySnapshotForPickSlotting: boolean;
  optimizationMode: string;
  disallowedBinTypes: string[];
  sortingMode: string;
}

// Option interfaces for dropdowns and selects
export interface SelectOption {
  value: string;
  label: string;
}

// Constants for dropdown options
export const TASK_KINDS = [
  'INBOUND_RECEIVE',
  'INBOUND_PUTAWAY', 
  'OUTBOUND_REPLEN',
  'OUTBOUND_PICK',
  'OUTBOUND_LOAD',
  'AUTO_REPLEN',
  'INTERNAL_MOVEMENT'
];

export const UOM_LEVELS = ['L0', 'L1', 'L2', 'L3', 'L4'];

export const HU_KINDS = ['PALLET', 'TOTE', 'CARTON', 'CASE', 'NONE'];

export const SEARCH_SCOPES = ['WH', 'AREA', 'ZONE'];

export const OPTIMIZATION_MODES = ['TOUCH', 'DISTANCE'];

export const SPLIT_MODES = ['nosplit', 'split-by-uom', 'split-by-weight', 'mod'];

export const QUALITY_BUCKETS = ['Good', 'Damaged', 'Quarantine', 'Expired'];