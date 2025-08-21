import { useEffect, useCallback } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { useFetchedConfigurations } from '@/contexts/FetchedConfigurationsContext';

interface UseFieldStatusProps {
  configType: 'lineSplit' | 'taskSequences' | 'taskStrategy' | 'binSearch';
  configIndex: number;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export function useFieldStatus({ configType, configIndex, watch, setValue }: UseFieldStatusProps) {
  const { data, getFieldSource, updateFieldSource } = useFetchedConfigurations();

  // Auto-populate form fields from fetched data
  useEffect(() => {
    const configData = data[configType];
    if (configData && configData[configIndex]) {
      const fetchedConfig = configData[configIndex];
      
      // Populate all fields from fetched data
      Object.entries(fetchedConfig).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const fieldPath = `${configType}.${configIndex}.${key}`;
          const currentValue = watch(key);
          
          // Only set if current field is empty/default
          if (currentValue === null || currentValue === undefined || 
              currentValue === '' || 
              (Array.isArray(currentValue) && currentValue.length === 0) ||
              (typeof currentValue === 'object' && Object.keys(currentValue).length === 0)) {
            
            setValue(key, value);
            updateFieldSource(fieldPath, { source: 'api', fetchedValue: value });
          }
        }
      });
    }
  }, [data, configType, configIndex, setValue, updateFieldSource]);

  // Track field modifications
  const trackFieldModification = (fieldName: string, originalValue: any, newValue: any) => {
    const fieldPath = `${configType}.${configIndex}.${fieldName}`;
    const fieldSource = getFieldSource(fieldPath);
    
    if (fieldSource.source === 'api' && fieldSource.fetchedValue !== newValue) {
      updateFieldSource(fieldPath, { 
        source: 'modified', 
        fetchedValue: fieldSource.fetchedValue 
      });
    } else if (fieldSource.source === 'empty' && newValue !== null && newValue !== undefined && newValue !== '') {
      updateFieldSource(fieldPath, { 
        source: 'modified', 
        fetchedValue: newValue 
      });
    }
  };

  // Get field path for status indicator
  const getFieldPath = (fieldName: string, nestedField?: string) => {
    const basePath = `${configType}.${configIndex}.${fieldName}`;
    return nestedField ? `${basePath}.${nestedField}` : basePath;
  };

  // Check if field has API data
  const hasApiData = (fieldName: string, nestedField?: string) => {
    const fieldPath = getFieldPath(fieldName, nestedField);
    const fieldSource = getFieldSource(fieldPath);
    return fieldSource.source === 'api';
  };

  // Get field value from fetched data
  const getFetchedValue = (fieldName: string, nestedField?: string) => {
    const configData = data[configType];
    if (configData && configData[configIndex]) {
      const fetchedConfig = configData[configIndex] as any;
      if (nestedField) {
        return fetchedConfig[fieldName]?.[nestedField];
      }
      return fetchedConfig[fieldName];
    }
    return null;
  };

  return {
    trackFieldModification,
    getFieldPath,
    hasApiData,
    getFetchedValue,
    data: data[configType]
  };
}