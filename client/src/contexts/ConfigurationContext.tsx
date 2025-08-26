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
}

interface ConfigurationContextType {
  configuration: CentralConfiguration;
  saveFormChanges: (section: keyof Omit<CentralConfiguration, 'warehouseCode' | 'fetchedAt' | 'lastSaved' | 'hasUnsavedChanges'>, data: any[]) => void;
  saveJsonChanges: (jsonData: string) => boolean;
  loadFromFetchedData: (warehouseCode: string, fetchedData: any) => void;
  getApiPayload: () => any;
  hasUnsavedChanges: boolean;
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
    binSearch: []
  });

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('centralConfiguration');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfiguration(prev => ({
          ...prev,
          ...parsed,
          hasUnsavedChanges: false
        }));
      } catch (error) {
        console.error('Failed to parse saved configuration:', error);
      }
    }
  }, []);


  const saveFormChanges = (section: keyof Omit<CentralConfiguration, 'warehouseCode' | 'fetchedAt' | 'lastSaved' | 'hasUnsavedChanges'>, data: any[]) => {
    const newConfig: CentralConfiguration = {
      ...configuration,  // Preserves warehouseCode, fetchedAt, and other metadata
      [section]: data,
      lastSaved: new Date().toISOString(),
      hasUnsavedChanges: false
    };
    
    setConfiguration(newConfig);
    
    // Persist to localStorage (single source)
    localStorage.setItem('centralConfiguration', JSON.stringify(newConfig));
    
    console.log(`Form changes saved for ${section}:`, data);
  };

  const saveJsonChanges = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      
      // Extract top-level metadata and data sections
      const newConfig: CentralConfiguration = {
        // Top-level metadata
        warehouseCode: parsed.warehouseCode || configuration.warehouseCode,
        fetchedAt: parsed.fetchedAt || configuration.fetchedAt,
        lastSaved: new Date().toISOString(),
        hasUnsavedChanges: false,
        
        // Configuration sections from data property or root level
        lineSplit: parsed.data?.lineSplit || parsed.lineSplit || [],
        taskSequences: parsed.data?.taskSequences || parsed.taskSequences || [],
        taskStrategy: parsed.data?.taskStrategy || parsed.taskStrategy || [],
        binSearch: parsed.data?.binSearch || parsed.binSearch || []
      };
      
      setConfiguration(newConfig);
      
      // Persist to localStorage (single source)
      localStorage.setItem('centralConfiguration', JSON.stringify(newConfig));
      
      console.log('JSON changes saved to central store:', newConfig);
      return true;
    } catch (error) {
      console.error('Failed to save JSON changes:', error);
      return false;
    }
  };

  const loadFromFetchedData = (warehouseCode: string, fetchedData: any) => {
    const newConfig: CentralConfiguration = {
      // Top-level metadata
      warehouseCode: warehouseCode,
      fetchedAt: new Date().toISOString(),
      lastSaved: new Date().toISOString(),
      hasUnsavedChanges: false,
      
      // Configuration sections
      lineSplit: fetchedData.lineSplit || [],
      taskSequences: fetchedData.taskSequences || [],
      taskStrategy: fetchedData.taskStrategy || [],
      binSearch: fetchedData.binSearch || []
    };
    
    setConfiguration(newConfig);
    
    // Persist to localStorage (single source)
    localStorage.setItem('centralConfiguration', JSON.stringify(newConfig));
    
    console.log('Loaded configuration from fetched data:', newConfig);
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


  return (
    <ConfigurationContext.Provider value={{
      configuration,
      saveFormChanges,
      saveJsonChanges,
      loadFromFetchedData,
      getApiPayload,
      hasUnsavedChanges: configuration.hasUnsavedChanges
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