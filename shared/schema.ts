import { z } from "zod";

// User types for in-memory storage
export interface User {
  id: number;
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
}

// Wizard Configuration types
export interface WizardConfiguration {
  id: number;
  userId: number;
  step: number;
  data: any;
  isComplete: boolean;
}

export interface InsertWizardConfiguration {
  userId: number;
  step: number;
  data: any;
  isComplete?: boolean;
}

// Task Sequence Configuration types
export interface TaskSequenceConfiguration {
  id: number;
  userId: number;
  inventoryGroupId: number;
  taskSequences: string[] | null;
  shipmentAcknowledgment: string | null;
}

export interface InsertTaskSequenceConfiguration {
  userId: number;
  inventoryGroupId?: number;
  taskSequences?: string[];
  shipmentAcknowledgment?: string;
}

// Inventory Group types
export interface InventoryGroup {
  id: number;
  userId: number;
  name: string;
  storageIdentifiers: any;
  lineIdentifiers: any;
  description: string | null;
}

export interface InsertInventoryGroup {
  userId: number;
  name: string;
  storageIdentifiers: any;
  lineIdentifiers: any;
  description?: string;
}

// Stock Allocation Strategy types
export interface StockAllocationStrategy {
  id: number;
  userId: number;
  inventoryGroupId: number;
  mode: string;
  priority: number;
  skipZoneFace: boolean | null;
  orderByQuantUpdatedAt: boolean;
  searchScope: string;
  preferFixed: boolean;
  preferNonFixed: boolean;
  statePreferenceSeq: string[];
  batchPreferenceMode: string;
  orderByPickingPosition: boolean;
  useInventorySnapshotForPickSlotting: boolean;
  optimizationMode: string;
}

export interface InsertStockAllocationStrategy {
  userId: number;
  inventoryGroupId: number;
  mode: string;
  priority?: number;
  skipZoneFace?: boolean;
  orderByQuantUpdatedAt?: boolean;
  searchScope?: string;
  preferFixed?: boolean;
  preferNonFixed?: boolean;
  statePreferenceSeq?: string[];
  batchPreferenceMode?: string;
  orderByPickingPosition?: boolean;
  useInventorySnapshotForPickSlotting?: boolean;
  optimizationMode?: string;
}

// Task Planning Configuration types
export interface TaskPlanningConfiguration {
  id: number;
  userId: number;
  inventoryGroupId: number;
  configurationName: string;
  description: string | null;
  taskKind: string | null;
  taskSubKind: string | null;
  strat: string | null;
  sortingStrategy: string | null;
  loadingStrategy: string | null;
  groupBy: string[] | null;
  taskLabel: string | null;
  mode: string | null;
  priority: number | null;
  skipZoneFace: string | null;
  orderByQuantUpdatedAt: boolean | null;
  searchScope: string | null;
  statePreferenceOrder: string[] | null;
  preferFixed: boolean | null;
  preferNonFixed: boolean | null;
  statePreferenceSeq: string[] | null;
  batchPreferenceMode: string | null;
  areaTypes: string[] | null;
  areas: string[] | null;
  orderByPickingPosition: boolean | null;
  useInventorySnapshotForPickSlotting: boolean | null;
  optimizationMode: string | null;
}

export interface InsertTaskPlanningConfiguration {
  userId: number;
  inventoryGroupId: number;
  configurationName: string;
  description?: string;
  taskKind?: string;
  taskSubKind?: string;
  strat?: string;
  sortingStrategy?: string;
  loadingStrategy?: string;
  groupBy?: string[];
  taskLabel?: string;
  mode?: string;
  priority?: number;
  skipZoneFace?: string;
  orderByQuantUpdatedAt?: boolean;
  searchScope?: string;
  statePreferenceOrder?: string[];
  preferFixed?: boolean;
  preferNonFixed?: boolean;
  statePreferenceSeq?: string[];
  batchPreferenceMode?: string;
  areaTypes?: string[];
  areas?: string[];
  orderByPickingPosition?: boolean;
  useInventorySnapshotForPickSlotting?: boolean;
  optimizationMode?: string;
}

// Task Execution Configuration types
export interface TaskExecutionConfiguration {
  id: number;
  userId: number;
  configurationName: string;
  taskPlanningConfigurationId: number;
  description: string | null;
  tripType: string | null;
  huKinds: string[] | null;
  scanSourceHUKind: string | null;
  pickSourceHUKind: string | null;
  carrierHUKind: string | null;
  huMappingMode: string | null;
  dropHUQuantThreshold: number | null;
  dropUOM: string | null;
  allowComplete: boolean | null;
  swapHUThreshold: number | null;
  dropInnerHU: boolean | null;
  allowInnerHUBreak: boolean | null;
  displayDropUOM: boolean | null;
  autoUOMConversion: boolean | null;
  mobileSorting: boolean | null;
  sortingParam: string | null;
  huWeightThreshold: number | null;
  qcMismatchMonthThreshold: number | null;
  quantSlottingForHUsInDrop: boolean | null;
  allowPickingMultiBatchfromHU: boolean | null;
  displayEditPickQuantity: boolean | null;
  pickBundles: boolean | null;
  enableEditQtyInPickOp: boolean | null;
  dropSlottingMode: string | null;
  enableManualDestBinSelection: boolean | null;
  mapSegregationGroupsToBins: boolean | null;
  dropHUInBin: boolean | null;
  scanDestHUInDrop: boolean | null;
  allowHUBreakInDrop: boolean | null;
  strictBatchAdherence: boolean | null;
  allowWorkOrderSplit: boolean | null;
  undoOp: boolean | null;
  disableWorkOrder: boolean | null;
  allowUnpick: boolean | null;
  supportPalletScan: boolean | null;
  loadingUnits: string[] | null;
  pickMandatoryScan: boolean | null;
  dropMandatoryScan: boolean | null;
}

export interface InsertTaskExecutionConfiguration {
  userId: number;
  configurationName: string;
  taskPlanningConfigurationId: number;
  description?: string;
  tripType?: string;
  huKinds?: string[];
  scanSourceHUKind?: string;
  pickSourceHUKind?: string;
  carrierHUKind?: string;
  huMappingMode?: string;
  dropHUQuantThreshold?: number;
  dropUOM?: string;
  allowComplete?: boolean;
  swapHUThreshold?: number;
  dropInnerHU?: boolean;
  allowInnerHUBreak?: boolean;
  displayDropUOM?: boolean;
  autoUOMConversion?: boolean;
  mobileSorting?: boolean;
  sortingParam?: string;
  huWeightThreshold?: number;
  qcMismatchMonthThreshold?: number;
  quantSlottingForHUsInDrop?: boolean;
  allowPickingMultiBatchfromHU?: boolean;
  displayEditPickQuantity?: boolean;
  pickBundles?: boolean;
  enableEditQtyInPickOp?: boolean;
  dropSlottingMode?: string;
  enableManualDestBinSelection?: boolean;
  mapSegregationGroupsToBins?: boolean;
  dropHUInBin?: boolean;
  scanDestHUInDrop?: boolean;
  allowHUBreakInDrop?: boolean;
  strictBatchAdherence?: boolean;
  allowWorkOrderSplit?: boolean;
  undoOp?: boolean;
  disableWorkOrder?: boolean;
  allowUnpick?: boolean;
  supportPalletScan?: boolean;
  loadingUnits?: string[];
  pickMandatoryScan?: boolean;
  dropMandatoryScan?: boolean;
}

// One-Click Template types
export interface OneClickTemplate {
  id: number;
  name: string;
  description: string;
  industry: string;
  complexity: string;
  isActive: boolean;
  templateData: any;
  createdAt: Date;
}

export interface InsertOneClickTemplate {
  name: string;
  description: string;
  industry: string;
  complexity: string;
  isActive?: boolean;
  templateData: any;
}

// Zod schemas for validation
export const insertWizardConfigurationSchema = z.object({
  userId: z.number(),
  step: z.number(),
  data: z.any(),
  isComplete: z.boolean().optional()
});

export const insertTaskSequenceConfigurationSchema = z.object({
  userId: z.number(),
  inventoryGroupId: z.number().optional(),
  taskSequences: z.array(z.string()).optional(),
  shipmentAcknowledgment: z.string().optional()
});

export const insertInventoryGroupSchema = z.object({
  userId: z.number(),
  name: z.string(),
  storageIdentifiers: z.any(),
  lineIdentifiers: z.any(),
  description: z.string().optional()
});

export const insertStockAllocationStrategySchema = z.object({
  userId: z.number(),
  inventoryGroupId: z.number(),
  mode: z.string(),
  priority: z.number().optional(),
  skipZoneFace: z.boolean().optional(),
  orderByQuantUpdatedAt: z.boolean().optional(),
  searchScope: z.string().optional(),
  preferFixed: z.boolean().optional(),
  preferNonFixed: z.boolean().optional(),
  statePreferenceSeq: z.array(z.string()).optional(),
  batchPreferenceMode: z.string().optional(),
  orderByPickingPosition: z.boolean().optional(),
  useInventorySnapshotForPickSlotting: z.boolean().optional(),
  optimizationMode: z.string().optional()
});

export const insertTaskPlanningConfigurationSchema = z.object({
  userId: z.number(),
  inventoryGroupId: z.number(),
  configurationName: z.string(),
  description: z.string().optional(),
  taskKind: z.string().optional(),
  taskSubKind: z.string().optional(),
  strat: z.string().optional(),
  sortingStrategy: z.string().optional(),
  loadingStrategy: z.string().optional(),
  groupBy: z.array(z.string()).optional(),
  taskLabel: z.string().optional(),
  mode: z.string().optional(),
  priority: z.number().optional(),
  skipZoneFace: z.string().optional(),
  orderByQuantUpdatedAt: z.boolean().optional(),
  searchScope: z.string().optional(),
  statePreferenceOrder: z.array(z.string()).optional(),
  preferFixed: z.boolean().optional(),
  preferNonFixed: z.boolean().optional(),
  statePreferenceSeq: z.array(z.string()).optional(),
  batchPreferenceMode: z.string().optional(),
  areaTypes: z.array(z.string()).optional(),
  areas: z.array(z.string()).optional(),
  orderByPickingPosition: z.boolean().optional(),
  useInventorySnapshotForPickSlotting: z.boolean().optional(),
  optimizationMode: z.string().optional()
});

export const insertTaskExecutionConfigurationSchema = z.object({
  userId: z.number(),
  configurationName: z.string(),
  taskPlanningConfigurationId: z.number(),
  description: z.string().optional(),
  tripType: z.string().optional(),
  huKinds: z.array(z.string()).optional(),
  scanSourceHUKind: z.string().optional(),
  pickSourceHUKind: z.string().optional(),
  carrierHUKind: z.string().optional(),
  huMappingMode: z.string().optional(),
  dropHUQuantThreshold: z.number().optional(),
  dropUOM: z.string().optional(),
  allowComplete: z.boolean().optional(),
  swapHUThreshold: z.number().optional(),
  dropInnerHU: z.boolean().optional(),
  allowInnerHUBreak: z.boolean().optional(),
  displayDropUOM: z.boolean().optional(),
  autoUOMConversion: z.boolean().optional(),
  mobileSorting: z.boolean().optional(),
  sortingParam: z.string().optional(),
  huWeightThreshold: z.number().optional(),
  qcMismatchMonthThreshold: z.number().optional(),
  quantSlottingForHUsInDrop: z.boolean().optional(),
  allowPickingMultiBatchfromHU: z.boolean().optional(),
  displayEditPickQuantity: z.boolean().optional(),
  pickBundles: z.boolean().optional(),
  enableEditQtyInPickOp: z.boolean().optional(),
  dropSlottingMode: z.string().optional(),
  enableManualDestBinSelection: z.boolean().optional(),
  mapSegregationGroupsToBins: z.boolean().optional(),
  dropHUInBin: z.boolean().optional(),
  scanDestHUInDrop: z.boolean().optional(),
  allowHUBreakInDrop: z.boolean().optional(),
  strictBatchAdherence: z.boolean().optional(),
  allowWorkOrderSplit: z.boolean().optional(),
  undoOp: z.boolean().optional(),
  disableWorkOrder: z.boolean().optional(),
  allowUnpick: z.boolean().optional(),
  supportPalletScan: z.boolean().optional(),
  loadingUnits: z.array(z.string()).optional(),
  pickMandatoryScan: z.boolean().optional(),
  dropMandatoryScan: z.boolean().optional()
});

export const insertOneClickTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  industry: z.string(),
  complexity: z.string(),
  isActive: z.boolean().optional(),
  templateData: z.any()
});