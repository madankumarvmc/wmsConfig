import { warehouseEnvironmentManager, type Environment, type ConfigurationType } from './environmentUtils';
import { type CentralConfiguration } from '@/contexts/ConfigurationContext';
import { LineSplitConfig, TaskSequenceConfig, TaskStrategyConfig, BinSearchConfig } from '@/types/outbound-v05';

export interface CopyResult {
  success: number;
  failed: number;
  errors: string[];
  total: number;
}

export interface CopyResults {
  lineSplit: CopyResult;
  taskSequences: CopyResult;
  taskStrategy: CopyResult;
  binSearch: CopyResult;
  totalSuccess: number;
  totalFailed: number;
  totalItems: number;
}

export class CopyConfigurationService {
  
  // Transform TaskStrategy data to remove problematic fields for create API
  private transformTaskStrategyForCreate(config: TaskStrategyConfig): TaskStrategyConfig {
    const { id, ...configWithoutId } = config;
    
    // Create a clean copy
    const transformed = { ...configWithoutId };
    
    // Remove null/empty strategy fields that might cause validation errors
    if (transformed.strat === null || transformed.strat === undefined || transformed.strat === "" || transformed.strat === " ") {
      delete (transformed as any).strat;
    }
    
    if (transformed.sortingStrategy === null || transformed.sortingStrategy === undefined || transformed.sortingStrategy === "") {
      delete (transformed as any).sortingStrategy;
    }
    
    if (transformed.loadingStrategy === null || transformed.loadingStrategy === undefined || transformed.loadingStrategy === "") {
      delete (transformed as any).loadingStrategy;
    }

    if (transformed.loadingUnits === null || transformed.loadingUnits === undefined) {
      delete (transformed as any).loadingUnits;
    }

    
    return transformed;
  }
  
  async copyConfiguration(
    sourceConfig: CentralConfiguration,
    targetWarehouseCode: string,
    targetEnvironment: Environment
  ): Promise<CopyResults> {
    const endpoints = warehouseEnvironmentManager.getApiEndpoints(targetEnvironment);
    
    if (!endpoints?.create) {
      throw new Error('Unable to build create API endpoints');
    }

    // Initialize results
    const copyResults: CopyResults = {
      lineSplit: { success: 0, failed: 0, errors: [], total: 0 },
      taskSequences: { success: 0, failed: 0, errors: [], total: 0 },
      taskStrategy: { success: 0, failed: 0, errors: [], total: 0 },
      binSearch: { success: 0, failed: 0, errors: [], total: 0 },
      totalSuccess: 0,
      totalFailed: 0,
      totalItems: 0
    };

    // Count total items
    copyResults.lineSplit.total = sourceConfig.lineSplit.length;
    copyResults.taskSequences.total = sourceConfig.taskSequences.length;
    copyResults.taskStrategy.total = sourceConfig.taskStrategy.length;
    copyResults.binSearch.total = sourceConfig.binSearch.length;
    copyResults.totalItems = copyResults.lineSplit.total + copyResults.taskSequences.total + 
                             copyResults.taskStrategy.total + copyResults.binSearch.total;

    console.log(`🚀 Starting copy operation: ${copyResults.totalItems} total items to copy`);
    console.log(`📍 Source: ${sourceConfig.warehouseCode} → Target: ${targetWarehouseCode} (${targetEnvironment})`);
    console.log(`🔍 DEBUG - Source config warehouse details:`, {
      sourceWarehouseCode: sourceConfig.warehouseCode,
      sourceConfigKeys: Object.keys(sourceConfig),
      targetWarehouseCode,
      targetEnvironment
    });
    console.log(`   • LineSplit: ${copyResults.lineSplit.total} items`);
    console.log(`   • TaskSequences: ${copyResults.taskSequences.total} items`);
    console.log(`   • TaskStrategy: ${copyResults.taskStrategy.total} items`);
    console.log(`   • BinSearch: ${copyResults.binSearch.total} items`);
    
    // Log sample payload for debugging
    if (copyResults.totalItems > 0) {
      const sampleConfig = sourceConfig.lineSplit[0] || sourceConfig.taskSequences[0] || 
                          sourceConfig.taskStrategy[0] || sourceConfig.binSearch[0];
      if (sampleConfig) {
        console.log(`📄 Sample payload structure:`, {
          ...sampleConfig,
          id: '***removed***', // Hide actual IDs
          whId: '***target***'  // Will be replaced with target warehouse
        });
      }
    }

    // Copy each configuration type concurrently
    await Promise.allSettled([
      this.copyLineSplit(sourceConfig.lineSplit, targetEnvironment, targetWarehouseCode, copyResults.lineSplit),
      this.copyTaskSequences(sourceConfig.taskSequences, targetEnvironment, targetWarehouseCode, copyResults.taskSequences),
      this.copyTaskStrategy(sourceConfig.taskStrategy, targetEnvironment, targetWarehouseCode, copyResults.taskStrategy),
      this.copyBinSearch(sourceConfig.binSearch, targetEnvironment, targetWarehouseCode, copyResults.binSearch)
    ]);

    // Calculate totals
    copyResults.totalSuccess = copyResults.lineSplit.success + copyResults.taskSequences.success + 
                              copyResults.taskStrategy.success + copyResults.binSearch.success;
    copyResults.totalFailed = copyResults.lineSplit.failed + copyResults.taskSequences.failed + 
                             copyResults.taskStrategy.failed + copyResults.binSearch.failed;

    // Log detailed completion summary
    console.log(`\n🏁 Copy operation completed for ${targetWarehouseCode}:`);
    console.log(`   ✅ Success: ${copyResults.totalSuccess}/${copyResults.totalItems} total items`);
    console.log(`   ❌ Failed: ${copyResults.totalFailed}/${copyResults.totalItems} total items`);
    console.log(`   📊 Breakdown:`);
    console.log(`      • LineSplit: ${copyResults.lineSplit.success}/${copyResults.lineSplit.total} (${copyResults.lineSplit.failed} failed)`);
    console.log(`      • TaskSequences: ${copyResults.taskSequences.success}/${copyResults.taskSequences.total} (${copyResults.taskSequences.failed} failed)`);
    console.log(`      • TaskStrategy: ${copyResults.taskStrategy.success}/${copyResults.taskStrategy.total} (${copyResults.taskStrategy.failed} failed)`);
    console.log(`      • BinSearch: ${copyResults.binSearch.success}/${copyResults.binSearch.total} (${copyResults.binSearch.failed} failed)`);

    // Log first few errors for debugging
    if (copyResults.totalFailed > 0) {
      console.log(`\n🔍 Sample errors for debugging:`);
      const allErrors = [
        ...copyResults.lineSplit.errors.map(e => `LineSplit: ${e}`),
        ...copyResults.taskSequences.errors.map(e => `TaskSeq: ${e}`),
        ...copyResults.taskStrategy.errors.map(e => `TaskStrat: ${e}`),
        ...copyResults.binSearch.errors.map(e => `BinSearch: ${e}`)
      ];
      allErrors.slice(0, 3).forEach(error => console.log(`      ❌ ${error}`));
      if (allErrors.length > 3) {
        console.log(`      ... and ${allErrors.length - 3} more errors`);
      }
    }

    return copyResults;
  }

  private async copyLineSplit(configs: LineSplitConfig[], environment: Environment, warehouseCode: string, results: CopyResult): Promise<void> {
    console.log(`📋 Starting LineSplit copy: ${configs.length} items`);
    
    for (let index = 0; index < configs.length; index++) {
      const config = configs[index];
      try {
        const { id, ...configWithoutId } = config;
        const createPayload = {
          ...configWithoutId,
          whId: warehouseCode // Update warehouse ID
        };

        console.log(`🔍 DEBUG - LineSplit ${index + 1} payload:`, {
          originalWhId: config.whId,
          originalId: config.id,
          newWhId: createPayload.whId,
          hasId: 'id' in createPayload,
          targetWarehouseCode: warehouseCode
        });
        console.log("logging line split configurations", createPayload)

        // Use proxy endpoint to avoid CORS issues
        const response = await fetch('/api/proxy/copy-configuration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            warehouseCode,
            environment,
            configType: 'lineSplit',
            configData: createPayload
          })
        });

        // Validate response before parsing JSON
        let responseData;
        try {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}`);
          }
          responseData = await response.json();
        } catch (jsonError) {
          results.failed++;
          const errorMsg = `LineSplit ${index + 1} JSON parse error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`;
          results.errors.push(errorMsg);
          console.error(`   ❌ ${errorMsg}`);
          continue;
        }

        // Check for success/failure from our proxy
        if (response.ok && responseData.success) {
          results.success++;
          console.log(`   ✅ LineSplit ${index + 1}/${configs.length} succeeded`);
          if (responseData.warning) {
            console.warn(`   ⚠️  LineSplit ${index + 1} warning: ${responseData.warning}`);
          }
        } else {
          results.failed++;
          const errorDetails = responseData.details ? ` - ${responseData.details.substring(0, 100)}` : '';
          const errorMsg = `LineSplit ${index + 1} failed: ${responseData.error || `HTTP ${responseData.httpStatus || response.status}`}${errorDetails}`;
          results.errors.push(errorMsg);
          console.error(`   ❌ ${errorMsg}`);
        }
      } catch (error) {
        results.failed++;
        const errorMsg = `LineSplit ${index + 1} error: ${error instanceof Error ? error.message : String(error)}`;
        results.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
  }

  private async copyTaskSequences(configs: TaskSequenceConfig[], environment: Environment, warehouseCode: string, results: CopyResult): Promise<void> {
    console.log(`📋 Starting TaskSequences copy: ${configs.length} items`);
    
    for (let index = 0; index < configs.length; index++) {
      const config = configs[index];
      try {
        const { id, ...configWithoutId } = config;
        const createPayload = {
          ...configWithoutId,
          whId: warehouseCode // Update warehouse ID
        };

        // Use proxy endpoint to avoid CORS issues
        const response = await fetch('/api/proxy/copy-configuration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            warehouseCode,
            environment,
            configType: 'taskSequences',
            configData: createPayload
          })
        });

        // Validate response before parsing JSON
        let responseData;
        try {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}`);
          }
          responseData = await response.json();
        } catch (jsonError) {
          results.failed++;
          const errorMsg = `TaskSequence ${index + 1} JSON parse error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`;
          results.errors.push(errorMsg);
          console.error(`   ❌ ${errorMsg}`);
          continue;
        }

        // Check for success/failure from our proxy
        if (response.ok && responseData.success) {
          results.success++;
          console.log(`   ✅ TaskSequence ${index + 1}/${configs.length} succeeded`);
          if (responseData.warning) {
            console.warn(`   ⚠️  TaskSequence ${index + 1} warning: ${responseData.warning}`);
          }
        } else {
          results.failed++;
          const errorDetails = responseData.details ? ` - ${responseData.details.substring(0, 100)}` : '';
          const errorMsg = `TaskSequence ${index + 1} failed: ${responseData.error || `HTTP ${responseData.httpStatus || response.status}`}${errorDetails}`;
          results.errors.push(errorMsg);
          console.error(`   ❌ ${errorMsg}`);
        }
      } catch (error) {
        results.failed++;
        const errorMsg = `TaskSequence ${index + 1} error: ${error instanceof Error ? error.message : String(error)}`;
        results.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
  }

  private async copyTaskStrategy(configs: TaskStrategyConfig[], environment: Environment, warehouseCode: string, results: CopyResult): Promise<void> {
    console.log(`📋 Starting TaskStrategy copy: ${configs.length} items`);
    
    for (let index = 0; index < configs.length; index++) {
      const config = configs[index];
      try {
        // Transform the config to remove problematic fields
        const cleanedConfig = this.transformTaskStrategyForCreate(config);
        const createPayload = {
          ...cleanedConfig,
          whId: warehouseCode // Update warehouse ID
        };
        
        // Debug logging to show transformation
        console.log(`🔍 DEBUG - TaskStrategy ${index + 1} transformation:`, {
          originalFields: Object.keys(config),
          cleanedFields: Object.keys(cleanedConfig),
          removedFields: Object.keys(config).filter(key => !(key in cleanedConfig)),
          originalTaskAttrs: config.taskAttrs,
          cleanedTaskAttrs: cleanedConfig.taskAttrs,
          originalStrat: config.strat,
          cleanedStrat: cleanedConfig.strat,
          stratType: typeof config.strat,
          stratValue: JSON.stringify(config.strat),
          targetWarehouseCode: warehouseCode
        });

        // Use proxy endpoint to avoid CORS issues
        const response = await fetch('/api/proxy/copy-configuration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            warehouseCode,
            environment,
            configType: 'taskStrategy',
            configData: createPayload
          })
        });

        // Validate response before parsing JSON
        let responseData;
        try {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}`);
          }
          responseData = await response.json();
        } catch (jsonError) {
          results.failed++;
          const errorMsg = `TaskStrategy ${index + 1} JSON parse error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`;
          results.errors.push(errorMsg);
          console.error(`   ❌ ${errorMsg}`);
          continue;
        }

        // Check for success/failure from our proxy
        if (response.ok && responseData.success) {
          results.success++;
          console.log(`   ✅ TaskStrategy ${index + 1}/${configs.length} succeeded`);
          if (responseData.warning) {
            console.warn(`   ⚠️  TaskStrategy ${index + 1} warning: ${responseData.warning}`);
          }
        } else {
          results.failed++;
          const errorDetails = responseData.details ? ` - ${responseData.details.substring(0, 100)}` : '';
          const errorMsg = `TaskStrategy ${index + 1} failed: ${responseData.error || `HTTP ${responseData.httpStatus || response.status}`}${errorDetails}`;
          results.errors.push(errorMsg);
          console.error(`   ❌ ${errorMsg}`);
        }
      } catch (error) {
        results.failed++;
        const errorMsg = `TaskStrategy ${index + 1} error: ${error instanceof Error ? error.message : String(error)}`;
        results.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
  }

  private async copyBinSearch(configs: BinSearchConfig[], environment: Environment, warehouseCode: string, results: CopyResult): Promise<void> {
    console.log(`📋 Starting BinSearch copy: ${configs.length} items`);
    
    for (let index = 0; index < configs.length; index++) {
      const config = configs[index];
      try {
        const { id, ...configWithoutId } = config;
        const createPayload = {
          ...configWithoutId,
          whId: warehouseCode // Update warehouse ID
        };

        // Use proxy endpoint to avoid CORS issues
        const response = await fetch('/api/proxy/copy-configuration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            warehouseCode,
            environment,
            configType: 'binSearch',
            configData: createPayload
          })
        });

        // Validate response before parsing JSON
        let responseData;
        try {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}`);
          }
          responseData = await response.json();
        } catch (jsonError) {
          results.failed++;
          const errorMsg = `BinSearch ${index + 1} JSON parse error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`;
          results.errors.push(errorMsg);
          console.error(`   ❌ ${errorMsg}`);
          continue;
        }

        // Check for success/failure from our proxy
        if (response.ok && responseData.success) {
          results.success++;
          console.log(`   ✅ BinSearch ${index + 1}/${configs.length} succeeded`);
          if (responseData.warning) {
            console.warn(`   ⚠️  BinSearch ${index + 1} warning: ${responseData.warning}`);
          }
        } else {
          results.failed++;
          const errorDetails = responseData.details ? ` - ${responseData.details.substring(0, 100)}` : '';
          const errorMsg = `BinSearch ${index + 1} failed: ${responseData.error || `HTTP ${responseData.httpStatus || response.status}`}${errorDetails}`;
          results.errors.push(errorMsg);
          console.error(`   ❌ ${errorMsg}`);
        }
      } catch (error) {
        results.failed++;
        const errorMsg = `BinSearch ${index + 1} error: ${error instanceof Error ? error.message : String(error)}`;
        results.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
  }
}

export const copyConfigurationService = new CopyConfigurationService();