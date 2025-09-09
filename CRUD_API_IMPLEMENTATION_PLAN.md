# CRUD API Implementation Plan for WMS Configuration Management

## Current State Analysis

**✅ What's Already Implemented:**
1. **Read Operations**: `/query` endpoints for fetching configurations
2. **Local CRUD**: Wizard steps (1-6) have full CRUD via internal server API
3. **Environment Selection**: Dynamic endpoint construction
4. **V0.5 Forms**: Only local storage, no remote CRUD

**❌ What's Missing:**
1. **External API CRUD**: No create/update/delete operations to external APIs
2. **Unified API Service**: Different patterns for wizard vs V0.5 components
3. **Error Handling**: Limited retry logic and error categorization
4. **Optimistic Updates**: No offline-first approach
5. **Conflict Resolution**: No handling of concurrent modifications

## Proposed Architecture - Industry Best Practices

### 1. **RESTful API Design Standards**

Following REST conventions and industry standards like Google Cloud API Design Guide and Microsoft REST API Guidelines:

```typescript
// API Endpoint Structure
baseUrl/resource[/{id}][?queryParams]

// For each configuration type:
GET    /strategy/outbound/line-split/query?whId={code}           // ✅ Exists
POST   /strategy/outbound/line-split?whId={code}                // ➕ Create
PUT    /strategy/outbound/line-split/{id}?whId={code}           // ➕ Update
DELETE /strategy/outbound/line-split/{id}?whId={code}           // ➕ Delete

// Batch operations (Industry Standard)
POST   /strategy/outbound/line-split/batch?whId={code}          // ➕ Bulk create/update
DELETE /strategy/outbound/line-split/batch?whId={code}          // ➕ Bulk delete
```

### 2. **Unified API Service Layer**

**Design Pattern: Repository + Service Layer**
```typescript
interface ConfigurationRepository<T> {
  query(warehouseCode: string, filters?: QueryFilters): Promise<T[]>
  create(warehouseCode: string, config: Omit<T, 'id'>): Promise<T>
  update(warehouseCode: string, id: string, config: Partial<T>): Promise<T>
  delete(warehouseCode: string, id: string): Promise<void>
  bulkCreate(warehouseCode: string, configs: Omit<T, 'id'>[]): Promise<T[]>
  bulkUpdate(warehouseCode: string, configs: Partial<T>[]): Promise<T[]>
  bulkDelete(warehouseCode: string, ids: string[]): Promise<void>
}
```

### 3. **Enhanced Environment Utils Architecture**

**Current Implementation:**
```typescript
// ❌ Current: Only query endpoints
getApiEndpoints(environment: Environment | null) {
  return {
    lineSplit: `${baseUrl}/strategy/outbound/line-split/query?whId={warehouseCode}`
  }
}
```

**Proposed Implementation:**
```typescript
// ✅ Proposed: Full CRUD endpoints
interface CrudEndpoints {
  query: string;    // GET for reading
  create: string;   // POST for creating
  update: string;   // PUT for updating  
  delete: string;   // DELETE for removing
  batch: {
    create: string; // POST for bulk operations
    update: string; // PUT for bulk operations  
    delete: string; // DELETE for bulk operations
  };
}

getCrudEndpoints(environment: Environment, configType: ConfigType): CrudEndpoints
```

### 4. **Optimistic Updates with Error Recovery**

**Industry Pattern: Optimistic UI Updates**
```typescript
interface OptimisticUpdate<T> {
  localUpdate: () => void;           // Immediate UI update
  serverSync: () => Promise<T>;      // Server synchronization
  rollback: () => void;              // Rollback on failure
  retry: () => Promise<T>;           // Retry mechanism
}
```

### 5. **Comprehensive Error Handling Strategy**

**HTTP Status Code Handling:**
- `200`: Success operations
- `201`: Resource created
- `400`: Validation errors (client-side)
- `404`: Configuration not found
- `409`: Conflict (concurrent modification)
- `422`: Business logic validation errors
- `500`: Server errors
- `503`: Service unavailable

**Retry Strategy (Exponential Backoff):**
- Transient errors (5xx): Retry up to 3 times
- Network errors: Retry with exponential backoff
- Validation errors (4xx): No retry, immediate user feedback

### 6. **Conflict Resolution & Versioning**

**ETag-based Optimistic Locking:**
```typescript
interface VersionedConfiguration {
  id: string;
  version: string;    // ETag for conflict detection
  lastModified: string;
  data: T;
}

// Update with version check
PUT /api/line-split/{id}
Headers: If-Match: "version-hash"
```

## Implementation Plan

### **Phase 1: Enhanced Environment Utils (Week 1)**

1. **Extend `environmentUtils.ts`:**
   - Add full CRUD endpoint generation
   - Support batch operations
   - Add request/response typing

2. **Create `ApiService` class:**
   - Unified CRUD operations
   - Built-in retry logic
   - Error categorization
   - Request/response logging

### **Phase 2: V0.5 Component Integration (Week 1)**

1. **Extend V0.5 components** (LineSplit, TaskSequence, etc.):
   - Replace local-only operations with API calls
   - Add loading states for all operations
   - Implement optimistic updates
   - Add conflict resolution dialogs

2. **Enhanced user experience:**
   - Save indicators (saving/saved/error states)
   - Undo functionality for operations
   - Bulk operation support

### **Phase 3: Advanced Features (Week 2)**

1. **Offline-first architecture:**
   - Queue failed operations
   - Sync when connection restored
   - Conflict detection and resolution

2. **Real-time features:**
   - WebSocket integration for live updates
   - Multi-user conflict detection
   - Change notifications

### **Phase 4: Analytics & Monitoring (Week 2)**

1. **Operation analytics:**
   - Success/failure rates
   - Response time tracking
   - User operation patterns

2. **Enhanced error reporting:**
   - Categorized error logging
   - User-friendly error messages
   - Automated error recovery suggestions

## Technical Implementation Details

### **New Files Structure:**
```
client/src/lib/
├── api/
│   ├── ConfigurationApiService.ts    // Main API service
│   ├── types.ts                      // API types & interfaces
│   ├── errorHandling.ts             // Error handling utilities
│   └── retryLogic.ts                // Retry strategies
├── hooks/
│   ├── useOptimisticUpdate.ts       // Optimistic update hook
│   ├── useConfigurationCrud.ts      // CRUD operations hook
│   └── useConflictResolution.ts     // Conflict handling hook
└── utils/
    └── versionControl.ts            // ETag/version utilities
```

### **Integration Points:**

1. **V0.5 Components:** Replace `saveFormChanges()` with `apiService.create/update()`
2. **Wizard Components:** Extend existing CRUD to support external APIs
3. **Configuration Context:** Add server-sync capabilities
4. **Environment Selection:** Extended for all CRUD operations

### **Backward Compatibility:**
- Gradual migration approach
- Feature flags for API vs local-only mode
- Fallback to local storage when API unavailable

## API Endpoint Mapping

### **Current Query Endpoints:**
```typescript
// Line Split
GET /strategy/outbound/line-split/query?whId={warehouseCode}

// Task Sequence  
GET /strategy/outbound/task-sequence/query?whId={warehouseCode}

// Task Strategy
GET /task_strategy/query?whId={warehouseCode}

// Bin Search
GET /task-strategy/bin-search/query?whId={warehouseCode}
```

### **Proposed CRUD Endpoints:**

#### **Line Split Configuration**
```typescript
// Read
GET    /strategy/outbound/line-split/query?whId={code}
GET    /strategy/outbound/line-split/{id}?whId={code}

// Create
POST   /strategy/outbound/line-split?whId={code}
POST   /strategy/outbound/line-split/batch?whId={code}

// Update  
PUT    /strategy/outbound/line-split/{id}?whId={code}
PUT    /strategy/outbound/line-split/batch?whId={code}

// Delete
DELETE /strategy/outbound/line-split/{id}?whId={code}
DELETE /strategy/outbound/line-split/batch?whId={code}
```

#### **Task Sequence Configuration**
```typescript
// Read
GET    /strategy/outbound/task-sequence/query?whId={code}
GET    /strategy/outbound/task-sequence/{id}?whId={code}

// Create
POST   /strategy/outbound/task-sequence?whId={code}
POST   /strategy/outbound/task-sequence/batch?whId={code}

// Update
PUT    /strategy/outbound/task-sequence/{id}?whId={code}
PUT    /strategy/outbound/task-sequence/batch?whId={code}

// Delete
DELETE /strategy/outbound/task-sequence/{id}?whId={code}
DELETE /strategy/outbound/task-sequence/batch?whId={code}
```

#### **Task Strategy Configuration**
```typescript
// Read
GET    /task_strategy/query?whId={code}
GET    /task_strategy/{id}?whId={code}

// Create
POST   /task_strategy?whId={code}
POST   /task_strategy/batch?whId={code}

// Update
PUT    /task_strategy/{id}?whId={code}
PUT    /task_strategy/batch?whId={code}

// Delete
DELETE /task_strategy/{id}?whId={code}
DELETE /task_strategy/batch?whId={code}
```

#### **Bin Search Configuration**
```typescript
// Read
GET    /task-strategy/bin-search/query?whId={code}
GET    /task-strategy/bin-search/{id}?whId={code}

// Create
POST   /task-strategy/bin-search?whId={code}
POST   /task-strategy/bin-search/batch?whId={code}

// Update
PUT    /task-strategy/bin-search/{id}?whId={code}
PUT    /task-strategy/bin-search/batch?whId={code}

// Delete
DELETE /task-strategy/bin-search/{id}?whId={code}
DELETE /task-strategy/bin-search/batch?whId={code}
```

## Expected Request/Response Formats

### **Create Request (POST)**
```typescript
POST /strategy/outbound/line-split?whId=294786085853183
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

### **Create Response (201)**
```typescript
{
  "id": "01967c1b-6c1f-7207-a1d3-6c5d04752026",
  "whId": 294786085853183,
  "storageIdentifiers": {
    "category": "MD_FOOD DRY_CRAT"
  },
  "lineIdentifiers": {},
  "sequence": 80,
  "mode": "mod",
  "allowedUOMs": ["L0", "L2"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z",
  "version": "v1"
}
```

### **Update Request (PUT)**
```typescript
PUT /strategy/outbound/line-split/01967c1b-6c1f-7207-a1d3-6c5d04752026?whId=294786085853183
Content-Type: application/json
If-Match: "v1"

{
  "sequence": 85,
  "allowedUOMs": ["L0", "L1", "L2"]
}
```

### **Batch Operations**
```typescript
POST /strategy/outbound/line-split/batch?whId=294786085853183
Content-Type: application/json

{
  "operations": [
    {
      "type": "create",
      "data": { /* configuration data */ }
    },
    {
      "type": "update", 
      "id": "existing-id",
      "data": { /* partial update data */ }
    },
    {
      "type": "delete",
      "id": "id-to-delete"
    }
  ]
}
```

## Error Response Format

### **Standard Error Response**
```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid configuration data",
    "details": [
      {
        "field": "sequence",
        "message": "Sequence must be a positive integer",
        "value": -1
      }
    ],
    "requestId": "req-123456",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### **Conflict Error (409)**
```typescript
{
  "error": {
    "code": "CONFLICT",
    "message": "Configuration was modified by another user",
    "details": {
      "currentVersion": "v2",
      "providedVersion": "v1",
      "lastModifiedBy": "user@example.com",
      "lastModifiedAt": "2025-01-15T10:25:00Z"
    },
    "requestId": "req-123456",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

## Benefits of This Implementation

### **For Users:**
- ✅ **Real-time collaboration**: Changes sync across users
- ✅ **Offline support**: Work without internet, sync later
- ✅ **Conflict resolution**: Handle concurrent edits gracefully
- ✅ **Undo/Redo**: Easily revert changes
- ✅ **Bulk operations**: Efficient mass updates

### **For Developers:**
- ✅ **Unified API**: Consistent patterns across all configuration types
- ✅ **Type safety**: Full TypeScript support with proper error handling
- ✅ **Extensible**: Easy to add new configuration types
- ✅ **Testable**: Clear separation of concerns and dependency injection
- ✅ **Maintainable**: Industry-standard patterns and documentation

### **For System Architecture:**
- ✅ **Scalable**: Repository pattern supports caching and optimization
- ✅ **Reliable**: Retry logic and error recovery
- ✅ **Observable**: Comprehensive logging and monitoring
- ✅ **Secure**: Request validation and authorization ready
- ✅ **Performance**: Optimistic updates and batch operations

## Timeline and Milestones

### **Week 1: Foundation**
- [ ] Enhanced `environmentUtils.ts` with CRUD endpoints
- [ ] `ConfigurationApiService` class implementation
- [ ] Basic error handling and retry logic
- [ ] Unit tests for API service layer

### **Week 2: Integration** 
- [ ] V0.5 component integration (LineSplit, TaskSequence)
- [ ] Optimistic updates implementation
- [ ] Loading states and user feedback
- [ ] V0.5 component integration (TaskStrategy, BinSearch)

### **Week 3: Advanced Features**
- [ ] Conflict resolution dialogs
- [ ] Batch operation support
- [ ] Offline queue implementation  
- [ ] Version control and ETag support

### **Week 4: Polish & Documentation**
- [ ] Comprehensive error handling
- [ ] Performance optimization
- [ ] API documentation
- [ ] Integration testing

---

**Document Version**: 1.0  
**Created**: January 15, 2025  
**Last Updated**: January 15, 2025  
**Status**: Planning Phase