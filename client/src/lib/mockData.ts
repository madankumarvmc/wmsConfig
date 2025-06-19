export const categories = [
  { value: 'fast_moving', label: 'Fast Moving' },
  { value: 'slow_moving', label: 'Slow Moving' },
  { value: 'hazardous', label: 'Hazardous' },
  { value: 'fragile', label: 'Fragile' },
  { value: 'bulk', label: 'Bulk' },
];

export const skuClassTypes = [
  { value: 'standard', label: 'Standard' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'bulk', label: 'Bulk' },
  { value: 'special', label: 'Special' },
];

export const skuClasses = [
  { value: 'a_class', label: 'A-Class' },
  { value: 'b_class', label: 'B-Class' },
  { value: 'c_class', label: 'C-Class' },
  { value: 'd_class', label: 'D-Class' },
];

export const uoms = [
  { value: 'each', label: 'Each' },
  { value: 'case', label: 'Case' },
  { value: 'pallet', label: 'Pallet' },
  { value: 'kg', label: 'Kg' },
  { value: 'liter', label: 'Liter' },
];

export const buckets = [
  { value: 'zone_a', label: 'Zone-A' },
  { value: 'zone_b', label: 'Zone-B' },
  { value: 'zone_c', label: 'Zone-C' },
  { value: 'overflow', label: 'Overflow' },
  { value: 'special', label: 'Special' },
];

export const channels = [
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'retail', label: 'Retail' },
  { value: 'b2b', label: 'B2B' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'marketplace', label: 'Marketplace' },
];

export const customers = [
  { value: 'amazon_fulfillment', label: 'Amazon Fulfillment' },
  { value: 'walmart_stores', label: 'Walmart Stores' },
  { value: 'target_corp', label: 'Target Corp' },
  { value: 'industrial_supply_co', label: 'Industrial Supply Co.' },
  { value: 'global_retailers', label: 'Global Retailers' },
  { value: 'direct_consumer', label: 'Direct Consumer' },
];

export const taskSequenceOptions = [
  { value: 'OUTBOUND_REPLEN', label: 'OUTBOUND_REPLEN' },
  { value: 'OUTBOUND_PICK', label: 'OUTBOUND_PICK' },
  { value: 'OUTBOUND_LOAD', label: 'OUTBOUND_LOAD' },
  { value: 'OUTBOUND_PACK', label: 'OUTBOUND_PACK' },
  { value: 'OUTBOUND_SHIP', label: 'OUTBOUND_SHIP' },
  { value: 'OUTBOUND_SPECIAL', label: 'OUTBOUND_SPECIAL' },
  { value: 'HAZMAT_PROCESS', label: 'HAZMAT_PROCESS' },
  { value: 'QUALITY_CHECK', label: 'QUALITY_CHECK' },
];

export const shipmentAcknowledgmentOptions = [
  { value: 'on_pick', label: 'On Pick' },
  { value: 'on_load', label: 'On Load' },
  { value: 'on_ship', label: 'On Ship' },
  { value: 'on_pack', label: 'On Pack' },
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
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
