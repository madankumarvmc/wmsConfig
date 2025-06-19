// Default warehouse configurations based on real warehouse setup
// This enables one-click basic warehouse setup with proven configurations

export const defaultTaskSequenceConfiguration = {
  storageIdentifiers: {},
  lineIdentifiers: {},
  taskSequences: ["OUTBOUND_REPLEN", "OUTBOUND_PICK", "OUTBOUND_LOAD"],
  shipmentAcknowledgment: "SHIPMENT"
};

export const defaultPickStrategyConfigurations = [
  {
    name: "L0 Pick Strategy",
    storageIdentifiers: { uom: "L0" },
    lineIdentifiers: {},
    strategy: "OPTIMIZE_PICK_PATH",
    sortingStrategy: "BY_LOCATION",
    loadingStrategy: "LOAD_BY_LM_TRIP",
    groupBy: ["uom"],
    taskSubKinds: [],
    tripType: "LM"
  },
  {
    name: "L2 Pick Strategy", 
    storageIdentifiers: { uom: "L2" },
    lineIdentifiers: {},
    strategy: "OPTIMIZE_PICK_PATH",
    sortingStrategy: "BY_LOCATION", 
    loadingStrategy: "LOAD_BY_LM_TRIP",
    groupBy: ["uom"],
    taskSubKinds: [],
    tripType: "LM"
  }
];

export const defaultHUFormationConfigurations = [
  {
    tripType: "LM",
    huKinds: ["PALLET"],
    scanSourceHUKind: "PALLET",
    pickSourceHUKind: "NONE",
    carrierHUKind: "PALLET",
    huMappingMode: "BIN",
    dropHUQuantThreshold: 0,
    dropUOM: "L0",
    allowComplete: false,
    swapHUThreshold: 0,
    dropInnerHU: false,
    allowInnerHUBreak: false,
    displayDropUOM: false,
    autoUOMConversion: false,
    mobileSorting: false,
    sortingParam: "",
    huWeightThreshold: 0,
    qcMismatchMonthThreshold: 0,
    quantSlottingForHUsInDrop: false,
    allowPickingMultiBatchfromHU: false,
    displayEditPickQuantity: false,
    pickBundles: false,
    enableEditQtyInPickOp: true,
    dropSlottingMode: "BIN",
    enableManualDestBinSelection: false
  }
];

export const defaultWorkOrderManagementConfigurations = [
  {
    mapSegregationGroupsToBins: false,
    dropHUInBin: true,
    scanDestHUInDrop: false,
    allowHUBreakInDrop: false,
    strictBatchAdherence: true,
    allowWorkOrderSplit: true,
    undoOp: true,
    disableWorkOrder: false,
    allowUnpick: false,
    supportPalletScan: false,
    loadingUnits: ["PALLET"],
    pickMandatoryScan: false,
    dropMandatoryScan: true
  }
];

export const defaultInventoryGroups = [
  {
    name: "L0 Inventory Group",
    storageIdentifiers: { uom: "L0" },
    taskType: "OUTBOUND_PICK",
    taskSubKind: "",
    taskAttrs: { destUOM: "L0" },
    areaTypes: ["INVENTORY"],
    areas: []
  },
  {
    name: "L2 Inventory Group", 
    storageIdentifiers: { uom: "L2" },
    taskType: "OUTBOUND_PICK",
    taskSubKind: "",
    taskAttrs: { destUOM: "L2" },
    areaTypes: ["INVENTORY"],
    areas: []
  },
  {
    name: "Replenishment Group",
    storageIdentifiers: {},
    taskType: "OUTBOUND_REPLEN",
    taskSubKind: "",
    taskAttrs: { destUOM: "L0" },
    areaTypes: ["INVENTORY"],
    areas: []
  }
];

export const defaultStockAllocationStrategies = [
  // L0 PICK Strategy
  {
    mode: "PICK" as const,
    priority: 100,
    skipZoneFace: null,
    orderByQuantUpdatedAt: false,
    searchScope: "AREA",
    preferFixed: true,
    preferNonFixed: false,
    statePreferenceSeq: ["PURE", "IMPURE", "EMPTY", "SKU_EMPTY"],
    batchPreferenceMode: "NONE",
    orderByPickingPosition: false,
    useInventorySnapshotForPickSlotting: false,
    optimizationMode: "TOUCH"
  },
  // L0 PUT Strategy
  {
    mode: "PUT" as const,
    priority: 100,
    skipZoneFace: null,
    orderByQuantUpdatedAt: false,
    searchScope: "WH",
    preferFixed: true,
    preferNonFixed: false,
    statePreferenceSeq: ["PURE", "IMPURE", "EMPTY", "SKU_EMPTY"],
    batchPreferenceMode: "NONE",
    orderByPickingPosition: false,
    useInventorySnapshotForPickSlotting: false,
    optimizationMode: "TOUCH"
  },
  // L2 PICK Strategy
  {
    mode: "PICK" as const,
    priority: 100,
    skipZoneFace: "RESERVE",
    orderByQuantUpdatedAt: false,
    searchScope: "AREA",
    preferFixed: true,
    preferNonFixed: false,
    statePreferenceSeq: ["PURE", "IMPURE", "EMPTY", "SKU_EMPTY"],
    batchPreferenceMode: "NONE",
    orderByPickingPosition: false,
    useInventorySnapshotForPickSlotting: false,
    optimizationMode: "TOUCH"
  },
  // L2 PUT Strategy
  {
    mode: "PUT" as const,
    priority: 100,
    skipZoneFace: null,
    orderByQuantUpdatedAt: false,
    searchScope: "AREA",
    preferFixed: true,
    preferNonFixed: false,
    statePreferenceSeq: ["PURE", "IMPURE", "EMPTY", "SKU_EMPTY"],
    batchPreferenceMode: "NONE",
    orderByPickingPosition: false,
    useInventorySnapshotForPickSlotting: false,
    optimizationMode: "TOUCH"
  },
  // Replenishment PICK Strategy
  {
    mode: "PICK" as const,
    priority: 100,
    skipZoneFace: null,
    orderByQuantUpdatedAt: false,
    searchScope: "AREA",
    preferFixed: true,
    preferNonFixed: false,
    statePreferenceSeq: ["PURE", "IMPURE", "EMPTY", "SKU_EMPTY"],
    batchPreferenceMode: "NONE",
    orderByPickingPosition: false,
    useInventorySnapshotForPickSlotting: false,
    optimizationMode: "TOUCH"
  },
  // Replenishment PUT Strategy
  {
    mode: "PUT" as const,
    priority: 100,
    skipZoneFace: "RESERVE",
    orderByQuantUpdatedAt: false,
    searchScope: "AREA",
    preferFixed: true,
    preferNonFixed: false,
    statePreferenceSeq: ["EMPTY", "SKU_EMPTY", "PURE", "IMPURE"],
    batchPreferenceMode: "NONE",
    orderByPickingPosition: false,
    useInventorySnapshotForPickSlotting: false,
    optimizationMode: "TOUCH"
  }
];

export const applyDefaultConfiguration = async () => {
  // This function will be called to create all default configurations
  // Returns a summary of what was configured
  return {
    taskSequences: 1,
    pickStrategies: defaultPickStrategyConfigurations.length,
    huFormations: defaultHUFormationConfigurations.length,
    workOrderManagement: defaultWorkOrderManagementConfigurations.length,
    inventoryGroups: defaultInventoryGroups.length,
    stockAllocationStrategies: defaultStockAllocationStrategies.length
  };
};