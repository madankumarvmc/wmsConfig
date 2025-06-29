export const categories = [
  'Fast Moving',
  'Slow Moving', 
  'Hazardous',
  'Fragile',
  'Bulk'
];

export const skuClassTypes = [
  'Standard',
  'Promotional',
  'Seasonal',
  'Bulk',
  'Special'
];

export const skuClasses = [
  'A-Class',
  'B-Class', 
  'C-Class',
  'D-Class'
];

export const uoms = [
  'Each',
  'Case',
  'Pallet',
  'Kg',
  'Liter'
];

export const buckets = [
  'Good',
  'Damaged',
  'Expired',
  'Hold',
  'Quarantine'
];

export const channels = [
  'E-Commerce',
  'Retail',
  'B2B',
  'Wholesale',
  'Marketplace'
];

export const customers = [
  'Amazon Fulfillment',
  'Walmart Stores',
  'Target Corp',
  'Industrial Supply Co.',
  'Global Retailers',
  'Direct Consumer'
];

export const taskSequenceOptions = [
  'OUTBOUND_REPLEN',
  'OUTBOUND_PICK',
  'OUTBOUND_LOAD',
  'OUTBOUND_PACK',
  'OUTBOUND_SHIP',
  'OUTBOUND_SPECIAL',
  'HAZMAT_PROCESS',
  'QUALITY_CHECK'
];

export const shipmentAcknowledgmentOptions = [
  'On Pick',
  'On Load',
  'On Ship',
  'On Pack',
  'Manual',
  'Automatic'
];

export const taskKinds = [
  { value: 'PICK', label: 'Pick' },
  { value: 'REPLEN', label: 'Replenishment' },
  { value: 'LOAD', label: 'Loading' },
  { value: 'PACK', label: 'Packing' },
  { value: 'SHIP', label: 'Shipping' },
];

export const strategies = [
  { value: 'cluster', label: 'Cluster' },
  { value: 'zone', label: 'Zone' },
  { value: 'batch', label: 'Batch' },
  { value: 'wave', label: 'Wave' },
  { value: 'discrete', label: 'Discrete' },
];

export const sortingStrategies = [
  { value: 'fifo', label: 'FIFO (First In, First Out)' },
  { value: 'fefo', label: 'FEFO (First Expired, First Out)' },
  { value: 'lifo', label: 'LIFO (Last In, First Out)' },
  { value: 'priority', label: 'Priority Based' },
  { value: 'location', label: 'Location Based' },
];

export const loadingStrategies = [
  { value: 'sequence', label: 'Sequential Loading' },
  { value: 'priority', label: 'Priority Loading' },
  { value: 'weight', label: 'Weight Based' },
  { value: 'volume', label: 'Volume Based' },
  { value: 'mixed', label: 'Mixed Loading' },
];

export const groupByOptions = [
  { value: 'sku', label: 'SKU' },
  { value: 'order', label: 'Order' },
  { value: 'destination', label: 'Destination' },
  { value: 'customer', label: 'Customer' },
  { value: 'priority', label: 'Priority' },
  { value: 'batch', label: 'Batch' },
  { value: 'category', label: 'Category' },
];

export const taskSubKinds = [
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'bulk', label: 'Bulk' },
  { value: 'fragile', label: 'Fragile' },
  { value: 'hazmat', label: 'Hazmat' },
];

export const pickStrategies = [
  { value: 'PICK_ALL_TRIPS', label: 'PICK_ALL_TRIPS' },
  { value: 'PICK_BY_ZONE', label: 'PICK_BY_ZONE' },
  { value: 'PICK_BY_BATCH', label: 'PICK_BY_BATCH' },
  { value: 'PICK_SEQUENTIAL', label: 'PICK_SEQUENTIAL' },
  { value: 'PICK_PRIORITY', label: 'PICK_PRIORITY' },
];

export const specificSortingStrategies = [
  { value: 'SORT_BY_INVOICE', label: 'SORT_BY_INVOICE' },
  { value: 'SORT_BY_LOCATION', label: 'SORT_BY_LOCATION' },
  { value: 'SORT_BY_PRIORITY', label: 'SORT_BY_PRIORITY' },
  { value: 'SORT_BY_SKU', label: 'SORT_BY_SKU' },
  { value: 'SORT_BY_CUSTOMER', label: 'SORT_BY_CUSTOMER' },
];

export const specificLoadingStrategies = [
  { value: 'LOAD_BY_CUSTOMER', label: 'LOAD_BY_CUSTOMER' },
  { value: 'LOAD_BY_ROUTE', label: 'LOAD_BY_ROUTE' },
  { value: 'LOAD_BY_PRIORITY', label: 'LOAD_BY_PRIORITY' },
  { value: 'LOAD_SEQUENTIAL', label: 'LOAD_SEQUENTIAL' },
  { value: 'LOAD_BY_WEIGHT', label: 'LOAD_BY_WEIGHT' },
];

export const tripTypes = [
  { value: 'LM', label: 'LM (Last Mile)' },
  { value: 'DIRECT', label: 'Direct' },
  { value: 'CROSS_DOCK', label: 'Cross Dock' },
  { value: 'BULK', label: 'Bulk' },
  { value: 'EXPRESS', label: 'Express' },
];

export const huKindOptions = [
  { value: 'PALLET', label: 'Pallet' },
  { value: 'CARTON', label: 'Carton' },
  { value: 'TOTE', label: 'Tote' },
  { value: 'BAG', label: 'Bag' },
  { value: 'ROLL', label: 'Roll' },
  { value: 'CONTAINER', label: 'Container' },
];

export const scanSourceHUKindOptions = [
  { value: 'NONE', label: 'None' },
  { value: 'PALLET', label: 'Pallet' },
  { value: 'CARTON', label: 'Carton' },
  { value: 'TOTE', label: 'Tote' },
  { value: 'AUTO', label: 'Auto Detect' },
];

export const huMappingModes = [
  { value: 'BIN', label: 'Bin' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTO', label: 'Auto' },
  { value: 'FIXED', label: 'Fixed' },
];

export const dropSlottingModes = [
  { value: 'BIN', label: 'Bin' },
  { value: 'ZONE', label: 'Zone' },
  { value: 'LOCATION', label: 'Location' },
  { value: 'MANUAL', label: 'Manual' },
];

export const loadingUnitOptions = [
  { value: 'CRATE', label: 'Crate' },
  { value: 'PALLET', label: 'Pallet' },
  { value: 'BOX', label: 'Box' },
  { value: 'TOTE', label: 'Tote' },
  { value: 'CONTAINER', label: 'Container' },
  { value: 'CART', label: 'Cart' },
];

export const taskTypes = [
  { value: 'OUTBOUND_REPLEN', label: 'Outbound Replenishment' },
  { value: 'INBOUND_PUT', label: 'Inbound Put' },
  { value: 'CYCLE_COUNT', label: 'Cycle Count' },
  { value: 'TRANSFER', label: 'Transfer' },
];

export const areaTypes = [
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'STAGING', label: 'Staging' },
  { value: 'RECEIVING', label: 'Receiving' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'RETURNS', label: 'Returns' },
];

export const searchScopes = [
  { value: 'AREA', label: 'Area' },
  { value: 'ZONE', label: 'Zone' },
  { value: 'BIN', label: 'Bin' },
  { value: 'LOCATION', label: 'Location' },
];

export const statePreferenceOptions = [
  { value: 'PURE', label: 'Pure' },
  { value: 'IMPURE', label: 'Impure' },
  { value: 'EMPTY', label: 'Empty' },
  { value: 'SKU_EMPTY', label: 'SKU Empty' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'BLOCKED', label: 'Blocked' },
];

export const batchPreferenceModes = [
  { value: 'NONE', label: 'None' },
  { value: 'FIFO', label: 'FIFO (First In, First Out)' },
  { value: 'LIFO', label: 'LIFO (Last In, First Out)' },
  { value: 'EXPIRY', label: 'By Expiry Date' },
  { value: 'BATCH_NUMBER', label: 'By Batch Number' },
];

export const optimizationModes = [
  { value: 'TOUCH', label: 'Touch' },
  { value: 'DISTANCE', label: 'Distance' },
  { value: 'TIME', label: 'Time' },
  { value: 'COST', label: 'Cost' },
  { value: 'EFFICIENCY', label: 'Efficiency' },
];
