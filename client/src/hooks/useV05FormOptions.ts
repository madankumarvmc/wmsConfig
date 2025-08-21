import { useState, useEffect } from 'react';
import formOptionsData from '@/config/v05FormOptions.json';

interface V05FormOptions {
  categories: string[];
  skuClassTypes: string[];
  skuClasses: string[];
  uoms: string[];
  qualityBuckets: string[];
  huKinds: string[];
  channels: string[];
  customers: string[];
  asnTypes: string[];
  taskKinds: string[];
  taskSubKinds: string[];
  strategies: string[];
  sortingStrategies: string[];
  loadingStrategies: string[];
  groupByOptions: string[];
  tripTypes: string[];
  huMappingModes: string[];
  dropSlottingModes: string[];
  ginAckLevels: string[];
  searchScopes: string[];
  optimizationModes: string[];
  sortingModes: string[];
  batchPreferenceModes: string[];
  statePreferences: string[];
  areaTypes: string[];
  areas: string[];
  binTypes: string[];
  modes: {
    lineSplit: string[];
    binSearch: string[];
  };
  scanSourceHUKinds: string[];
}

export function useV05FormOptions(): V05FormOptions {
  const [options, setOptions] = useState<V05FormOptions>(formOptionsData);

  useEffect(() => {
    // Load options from JSON file
    setOptions(formOptionsData);
  }, []);

  return options;
}