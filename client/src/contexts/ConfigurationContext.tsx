import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFetchedConfigurations } from './FetchedConfigurationsContext';

export interface CentralConfiguration {
  // Top-level metadata
  warehouseCode?: string;        // Warehouse identifier
  fetchedAt?: string;            // When originally fetched from API
  lastSaved?: string;            // When user last saved changes
  hasUnsavedChanges: boolean;
  
  // Configuration sections
  lineSplit: any[];
  taskSequences: any[];
  taskStrategy: any[];
  binSearch: any[];
  
  // Baseline data for change detection
  baseline?: {
    lineSplit: any[];
    taskSequences: any[];
    taskStrategy: any[];
    binSearch: any[];
  };
}

interface ConfigurationContextType {
  configuration: CentralConfiguration;
  saveFormChanges: (section: keyof Omit<CentralConfiguration, 'warehouseCode' | 'fetchedAt' | 'lastSaved' | 'hasUnsavedChanges' | 'baseline'>, data: any[]) => void;
  saveJsonChanges: (jsonData: string) => boolean;
  loadFromFetchedData: (warehouseCode: string, fetchedData: any) => void;
  getApiPayload: () => any;
  hasUnsavedChanges: boolean;
  // New helper functions
  resetToBaseline: () => void;
  getChangedSections: () => string[];
  isDataEmpty: () => boolean;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const fetchedConfigs = useFetchedConfigurations();
  
  const [configuration, setConfiguration] = useState<CentralConfiguration>({
    // Top-level metadata
    warehouseCode: undefined,
    fetchedAt: undefined,
    lastSaved: undefined,
    hasUnsavedChanges: false,
    
    // Configuration sections
    lineSplit: [],
    taskSequences: [],
    taskStrategy: [],
    binSearch: [],
    
    // Baseline for change detection
    baseline: {
      lineSplit: [],
      taskSequences: [],
      taskStrategy: [],
      binSearch: []
    }
  });

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('centralConfiguration');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        
        // Ensure baseline exists for legacy configurations
        if (!parsed.baseline) {
          parsed.baseline = {
            lineSplit: parsed.lineSplit || [],
            taskSequences: parsed.taskSequences || [],
            taskStrategy: parsed.taskStrategy || [],
            binSearch: parsed.binSearch || []
          };
          // If no baseline existed, assume no changes (legacy behavior)
          parsed.hasUnsavedChanges = false;
        }
        
        setConfiguration(prev => ({
          ...prev,
          ...parsed
        }));
        
        console.log('🔍 DEBUG - Loaded configuration from localStorage:', {
          warehouseCode: parsed.warehouseCode,
          fetchedAt: parsed.fetchedAt,
          configKeys: Object.keys(parsed),
          lineSplitSample: parsed.lineSplit?.[0]
        });
      } catch (error) {
        console.error('Failed to parse saved configuration:', error);
      }
    }
  }, []);


  const saveFormChanges = (section: keyof Omit<CentralConfiguration, 'warehouseCode' | 'fetchedAt' | 'lastSaved' | 'hasUnsavedChanges' | 'baseline'>, data: any[]) => {
    // Check if data has actually changed from baseline
    const baseline = configuration.baseline;
    const hasChanges = !baseline || JSON.stringify(baseline[section]) !== JSON.stringify(data);
    
    const newConfig: CentralConfiguration = {
      ...configuration,  // Preserves warehouseCode, fetchedAt, baseline, and other metadata
      [section]: data,
      lastSaved: new Date().toISOString(),
      hasUnsavedChanges: hasChanges
    };
    
    setConfiguration(newConfig);
    
    // Persist to localStorage (single source)
    localStorage.setItem('centralConfiguration', JSON.stringify(newConfig));
    
    console.log(`Form changes saved for ${section}:`, { data, hasChanges, baseline: baseline?.[section] });
  };

  const saveJsonChanges = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      
      // Extract configuration sections from data property or root level
      const newSections = {
        lineSplit: parsed.data?.lineSplit || parsed.lineSplit || [],
        taskSequences: parsed.data?.taskSequences || parsed.taskSequences || [],
        taskStrategy: parsed.data?.taskStrategy || parsed.taskStrategy || [],
        binSearch: parsed.data?.binSearch || parsed.binSearch || []
      };
      
      // Check if any section has changed from baseline
      const baseline = configuration.baseline;
      const hasChanges = !baseline || Object.keys(newSections).some(section => 
        JSON.stringify(baseline[section as keyof typeof baseline]) !== JSON.stringify(newSections[section as keyof typeof newSections])
      );
      
      const newConfig: CentralConfiguration = {
        // Preserve existing metadata and baseline
        ...configuration,
        // Update from parsed JSON
        warehouseCode: parsed.warehouseCode || configuration.warehouseCode,
        fetchedAt: parsed.fetchedAt || configuration.fetchedAt,
        lastSaved: new Date().toISOString(),
        hasUnsavedChanges: hasChanges,
        // Update configuration sections
        ...newSections
      };
      
      setConfiguration(newConfig);
      
      // Persist to localStorage (single source)
      localStorage.setItem('centralConfiguration', JSON.stringify(newConfig));
      
      console.log('JSON changes saved to central store:', { newConfig, hasChanges, baseline });
      return true;
    } catch (error) {
      console.error('Failed to save JSON changes:', error);
      return false;
    }
  };

  const loadFromFetchedData = (warehouseCode: string, fetchedData: any) => {
    console.log('🔍 DEBUG - loadFromFetchedData called:', {
      inputWarehouseCode: warehouseCode,
      fetchedDataKeys: Object.keys(fetchedData || {}),
      lineSplitSample: fetchedData?.lineSplit?.[0]
    });
    // Create baseline from fetched data
    const baselineData = {
      lineSplit: fetchedData.lineSplit || [],
      taskSequences: fetchedData.taskSequences || [],
      taskStrategy: fetchedData.taskStrategy || [],
      binSearch: fetchedData.binSearch || []
    };
    
    const newConfig: CentralConfiguration = {
      // Top-level metadata
      warehouseCode: warehouseCode,
      fetchedAt: new Date().toISOString(),
      lastSaved: new Date().toISOString(),
      hasUnsavedChanges: false,  // No changes yet since we just loaded fresh data
      
      // Configuration sections (same as baseline initially)
      ...baselineData,
      
      // Set baseline for future change detection
      baseline: baselineData
    };
    
    setConfiguration(newConfig);
    
    // Persist to localStorage (single source)
    localStorage.setItem('centralConfiguration', JSON.stringify(newConfig));
    
    console.log('Loaded configuration from fetched data with baseline:', newConfig);
  };

  const getApiPayload = () => {
    return {
      warehouseCode: configuration.warehouseCode,
      fetchedAt: configuration.fetchedAt,
      lastModified: configuration.lastSaved,
      data: {
        lineSplit: configuration.lineSplit,
        taskSequences: configuration.taskSequences,
        taskStrategy: configuration.taskStrategy,
        binSearch: configuration.binSearch
      }
    };
  };


  const resetToBaseline = () => {
    if (!configuration.baseline) {
      console.warn('No baseline data available to reset to');
      return;
    }
    
    const resetConfig: CentralConfiguration = {
      ...configuration,
      ...configuration.baseline,
      hasUnsavedChanges: false,
      lastSaved: new Date().toISOString()
    };
    
    setConfiguration(resetConfig);
    localStorage.setItem('centralConfiguration', JSON.stringify(resetConfig));
    console.log('Configuration reset to baseline:', resetConfig);
  };
  
  const getChangedSections = (): string[] => {
    if (!configuration.baseline) return [];
    
    const sections = ['lineSplit', 'taskSequences', 'taskStrategy', 'binSearch'] as const;
    return sections.filter(section => 
      JSON.stringify(configuration.baseline![section]) !== JSON.stringify(configuration[section])
    );
  };
  
  const isDataEmpty = (): boolean => {
    return configuration.lineSplit.length === 0 &&
           configuration.taskSequences.length === 0 &&
           configuration.taskStrategy.length === 0 &&
           configuration.binSearch.length === 0;
  };

  return (
    <ConfigurationContext.Provider value={{
      configuration,
      saveFormChanges,
      saveJsonChanges,
      loadFromFetchedData,
      getApiPayload,
      hasUnsavedChanges: configuration.hasUnsavedChanges,
      resetToBaseline,
      getChangedSections,
      isDataEmpty
    }}>
      {children}
    </ConfigurationContext.Provider>
  );
}

export function useConfiguration() {
  const context = useContext(ConfigurationContext);
  if (context === undefined) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
}