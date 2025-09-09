# Copy Configuration - Create API Implementation Plan

## Overview

Implement **CREATE API calls** for the "Copy Configuration" functionality. When a user copies configuration to another warehouse, the current configuration from the central store (fetched data + user modifications) should be sent via POST requests to create new configurations in the target environment.

## Current State Analysis

### ✅ What Exists:
1. **Copy Configuration Dialog** - UI with environment and warehouse selection
2. **Central Configuration Store** - Complete configuration data in `ConfigurationContext`
3. **Environment Utils** - Dynamic API endpoint construction
4. **Query API Endpoints** - Read-only endpoints for fetching data

### ❌ What's Missing:
1. **Create API Endpoints** - POST endpoints for creating configurations
2. **Copy Logic** - Sending central store data to target warehouse
3. **Bulk Creation** - Creating multiple configurations at once
4. **Error Handling** - Proper feedback for copy operations

## Implementation Plan

### **Step 1: Extend Environment Utils for Create Operations**

**File: `client/src/lib/environmentUtils.ts`**

```typescript
// Add create endpoints alongside existing query endpoints
getApiEndpoints(environment: Environment | null) {
  if (!environment) return null;
  
  const baseUrl = `http://cincout.${environment}.api.staging.stackbox.internal`;
  
  return {
    // Query endpoints (existing)
    query: {
      lineSplit: `${baseUrl}/strategy/outbound/line-split/query?whId={warehouseCode}`,
      taskSequences: `${baseUrl}/strategy/outbound/task-sequence/query?whId={warehouseCode}`,
      taskStrategy: `${baseUrl}/task_strategy/query?whId={warehouseCode}`,
      binSearch: `${baseUrl}/task-strategy/bin-search/query?whId={warehouseCode}`,
    },
    // Create endpoints (new)
    create: {
      lineSplit: `${baseUrl}/strategy/outbound/line-split?whId={warehouseCode}`,
      taskSequences: `${baseUrl}/strategy/outbound/task-sequence?whId={warehouseCode}`,
      taskStrategy: `${baseUrl}/task_strategy?whId={warehouseCode}`,
      binSearch: `${baseUrl}/task-strategy/bin-search?whId={warehouseCode}`,
    }
  };
}
```

### **Step 2: Create Copy Configuration Service**

**File: `client/src/lib/copyConfigurationService.ts`**

```typescript
import { warehouseEnvironmentManager, type Environment } from './environmentUtils';
import { type CentralConfiguration } from '@/contexts/ConfigurationContext';

export class CopyConfigurationService {
  
  async copyConfiguration(
    sourceConfig: CentralConfiguration,
    targetWarehouseCode: string,
    targetEnvironment: Environment
  ): Promise<void> {
    const endpoints = warehouseEnvironmentManager.getApiEndpoints(targetEnvironment);
    
    if (!endpoints?.create) {
      throw new Error('Unable to build create API endpoints');
    }

    const copyResults = {
      lineSplit: { success: 0, failed: 0, errors: [] as string[] },
      taskSequences: { success: 0, failed: 0, errors: [] as string[] },
      taskStrategy: { success: 0, failed: 0, errors: [] as string[] },
      binSearch: { success: 0, failed: 0, errors: [] as string[] }
    };

    // Copy each configuration type
    await Promise.allSettled([
      this.copyLineSplit(sourceConfig.lineSplit, endpoints.create.lineSplit, targetWarehouseCode, copyResults.lineSplit),
      this.copyTaskSequences(sourceConfig.taskSequences, endpoints.create.taskSequences, targetWarehouseCode, copyResults.taskSequences),
      this.copyTaskStrategy(sourceConfig.taskStrategy, endpoints.create.taskStrategy, targetWarehouseCode, copyResults.taskStrategy),
      this.copyBinSearch(sourceConfig.binSearch, endpoints.create.binSearch, targetWarehouseCode, copyResults.binSearch)
    ]);

    // Return summary of results
    return copyResults;
  }

  private async copyLineSplit(configs: any[], endpoint: string, warehouseCode: string, results: any) {
    for (const config of configs) {
      try {
        const createPayload = {
          ...config,
          id: undefined, // Remove ID - let target system generate new one
          whId: parseInt(warehouseCode) // Update warehouse ID
        };

        const response = await fetch(endpoint.replace('{warehouseCode}', warehouseCode), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createPayload)
        });

        if (response.ok) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`LineSplit config failed: ${response.statusText}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`LineSplit config error: ${error.message}`);
      }
    }
  }

  // Similar methods for other configuration types...
  private async copyTaskSequences(configs: any[], endpoint: string, warehouseCode: string, results: any) { /* ... */ }
  private async copyTaskStrategy(configs: any[], endpoint: string, warehouseCode: string, results: any) { /* ... */ }
  private async copyBinSearch(configs: any[], endpoint: string, warehouseCode: string, results: any) { /* ... */ }
}

export const copyConfigurationService = new CopyConfigurationService();
```

### **Step 3: Update TopNavbar Copy Handler**

**File: `client/src/components/TopNavbar.tsx`**

```typescript
import { copyConfigurationService } from '@/lib/copyConfigurationService';

const handleCopyConfiguration = async (targetWarehouseCode: string, environment: Environment) => {
  try {
    // Get current configuration from central store
    const sourceConfig = configuration; // This contains fetched data + user modifications
    
    if (!sourceConfig.warehouseCode) {
      toast({
        title: 'No Source Configuration',
        description: 'Please fetch a configuration first before copying.',
        variant: 'destructive',
      });
      return;
    }

    // Show loading state
    setIsCopying(true);

    // Perform the copy operation
    const results = await copyConfigurationService.copyConfiguration(
      sourceConfig,
      targetWarehouseCode,
      environment
    );

    // Calculate totals
    const totalSuccess = results.lineSplit.success + results.taskSequences.success + 
                        results.taskStrategy.success + results.binSearch.success;
    const totalFailed = results.lineSplit.failed + results.taskSequences.failed + 
                       results.taskStrategy.failed + results.binSearch.failed;

    // Show results
    if (totalFailed === 0) {
      toast({
        title: 'Copy Successful',
        description: `Successfully copied ${totalSuccess} configurations to warehouse ${targetWarehouseCode}`,
      });
    } else {
      toast({
        title: 'Copy Completed with Errors',
        description: `${totalSuccess} succeeded, ${totalFailed} failed. Check console for details.`,
        variant: 'destructive',
      });
      
      // Log detailed errors
      console.error('Copy configuration errors:', {
        lineSplit: results.lineSplit.errors,
        taskSequences: results.taskSequences.errors,
        taskStrategy: results.taskStrategy.errors,
        binSearch: results.binSearch.errors
      });
    }

    // Close dialog on completion
    setCopyDialogOpen(false);

  } catch (error) {
    console.error('Error copying configuration:', error);
    toast({
      title: 'Copy Failed',
      description: 'Failed to copy configuration. Please try again.',
      variant: 'destructive',
    });
  } finally {
    setIsCopying(false);
  }
};
```

### **Step 4: Update Copy Configuration Dialog**

**File: `client/src/components/dialogs/CopyConfigurationDialog.tsx`**

```typescript
// Add loading state and better user feedback
export default function CopyConfigurationDialog({
  open,
  onOpenChange,
  onCopy,
  sourceWarehouseCode,
  isLoading = false
}: CopyConfigurationDialogProps) {
  // ... existing code ...

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white border shadow-lg">
        <DialogHeader>
          <DialogTitle>Copy Configuration to Warehouse</DialogTitle>
          <DialogDescription>
            Copy the current configuration (including any modifications) from warehouse {sourceWarehouseCode} to another warehouse environment.
          </DialogDescription>
        </DialogHeader>
        
        {/* ... existing form fields ... */}
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!targetWarehouseCode.trim() || !environment || isLoading}
          >
            {isLoading ? 'Copying Configuration...' : 'Copy Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Data Flow for Copy Operation

### **Step-by-Step Process:**

1. **User Action**: User clicks "Copy Configuration" from dropdown
2. **Dialog Opens**: Shows environment selection and target warehouse input
3. **User Selects**: Environment + target warehouse code
4. **Validation**: Ensures source configuration exists in central store
5. **API Calls**: For each configuration type (lineSplit, taskSequences, etc.):
   ```
   POST /strategy/outbound/line-split?whId={targetWarehouse}
   Body: { configuration data with new warehouse ID }
   ```
6. **Progress Tracking**: Shows success/failure count for each type
7. **Results Display**: Toast notification with summary
8. **Error Handling**: Detailed error logging for failed operations

### **Configuration Data Transformation:**

```typescript
// Source configuration from central store
const sourceLineSplit = {
  id: "existing-uuid",
  whId: 294786085853183,  // Source warehouse
  storageIdentifiers: { category: "MD_FOOD DRY_CRAT" },
  sequence: 80,
  // ... other fields
}

// Transformed for target warehouse creation
const targetLineSplit = {
  // id: undefined,  // Remove ID - let target generate new
  whId: 987654321,   // Target warehouse
  storageIdentifiers: { category: "MD_FOOD DRY_CRAT" },
  sequence: 80,
  // ... other fields (copied as-is)
}
```

## Expected API Request Format

### **LineSplit Create Request:**
```http
POST /strategy/outbound/line-split?whId=987654321
Content-Type: application/json

{
  "storageIdentifiers": {
    "category": "MD_FOOD DRY_CRAT"
  },
  "lineIdentifiers": {},
  "sequence": 80,
  "mode": "mod", 
  "allowedUOMs": ["L0", "L2"]
}
```

### **TaskSequence Create Request:**
```http
POST /strategy/outbound/task-sequence?whId=987654321
Content-Type: application/json

{
  "storageIdentifiers": {},
  "lineIdentifiers": {},
  "sequence": 20,
  "taskSequence": [
    { "taskKind": "OUTBOUND_REPLEN", "taskSubKind": "" },
    { "taskKind": "OUTBOUND_PICK", "taskSubKind": "" },
    { "taskKind": "OUTBOUND_LOAD", "taskSubKind": "" }
  ],
  "ginAckByApi": false,
  "ginAckLevel": "SHIPMENT"
}
```

## Error Handling Strategy

### **Network Errors:**
- Retry failed requests up to 3 times
- Show specific error messages for each configuration type
- Continue with other configurations even if some fail

### **Validation Errors:**
- Log detailed validation errors from API response
- Show user-friendly summary in toast notification
- Provide option to view detailed error log

### **Success Metrics:**
```typescript
interface CopyResults {
  lineSplit: { success: number, failed: number, errors: string[] },
  taskSequences: { success: number, failed: number, errors: string[] },
  taskStrategy: { success: number, failed: number, errors: string[] }, 
  binSearch: { success: number, failed: number, errors: string[] }
}
```

## Implementation Timeline

### **Day 1: Core Infrastructure**
- [ ] Extend `environmentUtils.ts` with create endpoints
- [ ] Create `CopyConfigurationService` class
- [ ] Basic error handling structure

### **Day 2: Integration**
- [ ] Update `TopNavbar.tsx` copy handler  
- [ ] Update `CopyConfigurationDialog.tsx` with loading states
- [ ] Test basic copy functionality

### **Day 3: Error Handling & Polish**
- [ ] Comprehensive error handling
- [ ] User feedback improvements
- [ ] Testing with various scenarios

### **Day 4: Testing & Documentation**
- [ ] Test with different environments
- [ ] Error scenario testing  
- [ ] Update documentation

## Benefits of This Focused Approach

### **✅ Immediate Value:**
- Users can copy their modified configurations to other warehouses
- Preserves all manual changes made through forms or JSON editing
- Works with existing environment selection system

### **✅ Simple & Focused:**
- Only implements what's needed for copy functionality
- Builds on existing architecture without major changes
- Easy to test and validate

### **✅ Foundation for Future:**
- Copy service can be extended for other CRUD operations later
- API endpoint structure ready for read/update/delete operations
- Error handling patterns established

---

**Document Version**: 1.0  
**Created**: January 15, 2025  
**Scope**: Copy Configuration Create API Only  
**Estimated Implementation**: 3-4 days