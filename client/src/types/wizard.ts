export interface StorageIdentifiers {
  category: string;
  skuClassType: string;
  skuClass: string;
  uom: string;
  bucket: string;
  specialStorage: boolean;
}

export interface LineIdentifiers {
  channel: string;
  customer: string;
}

export interface TaskSequenceConfig {
  id?: number;
  storageIdentifiers: StorageIdentifiers;
  lineIdentifiers: LineIdentifiers;
  taskSequences: string[];
  shipmentAcknowledgment: string;
}

export interface PickStrategy {
  taskKind: string;
  taskSubKind: string;
  taskAttrs: string[];
  strategy: string;
  sortingStrategy: string;
  loadingStrategy: string;
  groupBy: string[];
  taskLabel: string;
}

export interface HUFormation {
  tripType: string;
  huKinds: string[];
  scanSourceHUKind: string;
  pickSourceHUKind: string;
  carrierHUKind: string;
  huMappingMode: string;
  dropHUQuantThreshold: number;
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
  enableEditQtyInPickOp: boolean;
  dropSlottingMode: string;
  enableManualDestBinSelection: boolean;
}

export interface WorkOrderManagement {
  mapSegregationGroupsToBins: boolean;
  dropHUInBin: boolean;
  scanDestHUInDrop: boolean;
  allowHUBreakInDrop: boolean;
  strictBatchAdherence: boolean;
  allowWorkOrderSplit: boolean;
  undoOp: boolean;
  disableWorkOrder: boolean;
  allowUnpick: boolean;
  supportPalletScan: boolean;
  loadingUnits: number;
  pickMandatoryScan: boolean;
  dropMandatoryScan: boolean;
}

export interface StockAllocation {
  mode: 'PICK' | 'PUT';
  priority: number;
  skipZoneFace: boolean;
  orderByQuantUpdatedAt: boolean;
  searchScope: string;
  statePreferenceOrder: string[];
  preferFixed: boolean;
  preferNonFixed: boolean;
  statePreferenceSeq: number;
  batchPreferenceMode: string;
  areaTypes: string[];
  areas: string[];
  orderByPickingPosition: boolean;
  useInventorySnapshotForPickSlotting: boolean;
  optimizationMode: string;
}

export interface WizardData {
  taskSequences: TaskSequenceConfig[];
  pickStrategies: PickStrategy[];
  huFormation: HUFormation;
  workOrderManagement: WorkOrderManagement;
  stockAllocation: StockAllocation;
  isComplete: boolean;
}

export interface WizardState {
  currentStep: number;
  completedSteps: number[];
  data: WizardData;
}

export type WizardAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'UPDATE_STEP_DATA'; payload: { step: string; data: any } }
  | { type: 'LOAD_WIZARD_DATA'; payload: WizardData }
  | { type: 'RESET_WIZARD' };
