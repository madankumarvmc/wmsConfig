// Environment management utilities

export const ENVIRONMENTS = [
  'sbx-uat',
  'sbx-stag', 
  'sbx-sea-uat',
  'sbx-envistacorp-uat',
  'png-india-uat',
  'hul-dc-uat'
] as const;

export type Environment = typeof ENVIRONMENTS[number];

interface WarehouseEnvironmentMapping {
  [warehouseCode: string]: Environment;
}

const STORAGE_KEY = 'warehouseEnvironments';

export class WarehouseEnvironmentManager {
  private static instance: WarehouseEnvironmentManager;
  
  static getInstance(): WarehouseEnvironmentManager {
    if (!WarehouseEnvironmentManager.instance) {
      WarehouseEnvironmentManager.instance = new WarehouseEnvironmentManager();
    }
    return WarehouseEnvironmentManager.instance;
  }
  
  // Get saved environment for a warehouse code
  getEnvironment(warehouseCode: string): Environment | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const mappings: WarehouseEnvironmentMapping = JSON.parse(saved);
        return mappings[warehouseCode] || null;
      }
    } catch (error) {
      console.error('Failed to load warehouse environments:', error);
    }
    return null;
  }
  
  // Save environment for a warehouse code
  setEnvironment(warehouseCode: string, environment: Environment): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const mappings: WarehouseEnvironmentMapping = saved ? JSON.parse(saved) : {};
      
      mappings[warehouseCode] = environment;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
      
      console.log(`Environment mapping saved: ${warehouseCode} → ${environment}`);
    } catch (error) {
      console.error('Failed to save warehouse environment:', error);
    }
  }
  
  // Get all mappings
  getAllMappings(): WarehouseEnvironmentMapping {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load warehouse environments:', error);
      return {};
    }
  }
  
  // Build API URL with dynamic environment
  buildApiUrl(baseEndpoint: string, environment: Environment | null, warehouseCode: string): string | null {
    if (!environment) {
      return null; // Cannot build URL without environment
    }
    
    // Replace the environment placeholder in the URL template
    const url = baseEndpoint.replace('{environment}', environment).replace('{warehouseCode}', warehouseCode);
    return url;
  }
  
  // Get API endpoints with dynamic environment
  getApiEndpoints(environment: Environment | null) {
    if (!environment) return null;
    
    const baseUrl = `http://cincout.${environment}.api.staging.stackbox.internal`;
    
    return {
      query: {
        lineSplit: `${baseUrl}/strategy/outbound/line-split/query?whId={warehouseCode}`,
        taskSequences: `${baseUrl}/strategy/outbound/task-sequence/query?whId={warehouseCode}`,
        taskStrategy: `${baseUrl}/task_strategy/query?whId={warehouseCode}`,
        binSearch: `${baseUrl}/task-strategy/bin-search/query?whId={warehouseCode}`,
      },
      create: {
        lineSplit: `${baseUrl}/strategy/outbound/line-split/create?whId={warehouseCode}`,
        taskSequences: `${baseUrl}/strategy/outbound/task-sequence/create?whId={warehouseCode}`,
        taskStrategy: `${baseUrl}/task_strategy/create?whId={warehouseCode}`,
        binSearch: `${baseUrl}/task-strategy/bin-search/create?whId={warehouseCode}`,
      }
    };
  }
  
  // Get create endpoint for specific configuration type
  getCreateEndpoint(environment: Environment | null, configType: 'lineSplit' | 'taskSequences' | 'taskStrategy' | 'binSearch'): string | null {
    const endpoints = this.getApiEndpoints(environment);
    return endpoints?.create[configType] || null;
  }
}

// Configuration type enum for type safety
export type ConfigurationType = 'lineSplit' | 'taskSequences' | 'taskStrategy' | 'binSearch';

// Export singleton instance
export const warehouseEnvironmentManager = WarehouseEnvironmentManager.getInstance();