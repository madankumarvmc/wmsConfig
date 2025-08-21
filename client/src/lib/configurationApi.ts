/**
 * Configuration API Service
 * Handles fetching configurations from external APIs using warehouse codes
 */

export interface FetchedConfiguration {
  warehouseCode: string;
  fetchedAt: string;
  configurations: {
    inventoryGroups?: any[];
    taskSequences?: any[];
    taskPlanning?: any[];
    taskExecution?: any[];
    stockAllocation?: any[];
    [key: string]: any;
  };
}

export class ConfigurationApiService {
  private static instance: ConfigurationApiService;
  
  private constructor() {}
  
  static getInstance(): ConfigurationApiService {
    if (!ConfigurationApiService.instance) {
      ConfigurationApiService.instance = new ConfigurationApiService();
    }
    return ConfigurationApiService.instance;
  }

  /**
   * Fetch configurations from external API using warehouse code
   * @param warehouseCode Warehouse code
   * @param apiEndpoints Object containing API endpoint configurations
   */
  async fetchConfigurations(
    warehouseCode: string, 
    apiEndpoints: Record<string, string>
  ): Promise<FetchedConfiguration> {
    if (!warehouseCode || !warehouseCode.trim()) {
      throw new Error('Invalid warehouse code. Warehouse code is required.');
    }

    const configurations: any = {};
    const fetchPromises: Promise<any>[] = [];

    // Create fetch promises for each API endpoint
    Object.entries(apiEndpoints).forEach(([configType, endpoint]) => {
      const fetchPromise = this.fetchFromEndpoint(endpoint, warehouseCode)
        .then(data => {
          configurations[configType] = data;
        })
        .catch(error => {
          console.error(`Failed to fetch ${configType} configurations:`, error);
          configurations[configType] = null;
        });
      
      fetchPromises.push(fetchPromise);
    });

    // Wait for all fetches to complete
    await Promise.allSettled(fetchPromises);

    const result: FetchedConfiguration = {
      warehouseCode,
      fetchedAt: new Date().toISOString(),
      configurations
    };

    // Return result without storing to file (in-memory only)
    return result;
  }

  /**
   * Fetch data from a specific endpoint
   */
  private async fetchFromEndpoint(endpoint: string, warehouseCode: string): Promise<any> {
    const url = endpoint.replace('{warehouseCode}', warehouseCode);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any additional headers as needed (e.g., Authorization)
      },
      // Add empty body for POST request
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // File-based storage methods removed - using in-memory state management instead
  // Keeping stub methods for backward compatibility during migration
  async getStoredConfigurations(warehouseCode: string): Promise<FetchedConfiguration | null> {
    console.warn('getStoredConfigurations is deprecated - use FetchedConfigurationsContext instead');
    return null;
  }
}

export const configurationApi = ConfigurationApiService.getInstance();