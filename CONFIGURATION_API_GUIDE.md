# Warehouse Configuration API Integration Guide

## Overview

The system now includes a warehouse code field in the top navbar with a dropdown menu for fetching configurations from external APIs. Here's how to complete the integration:

## Current Setup

### 1. UI Components Added ✅
- **Warehouse Code Input**: Text input field in the top navbar
- **Actions Dropdown**: Contains "Fetch Configurations" option
- **Validation**: Validates that warehouse code is not empty

### 2. Backend Infrastructure ✅
- **Storage Routes**: `/api/configurations/*` endpoints for storing/retrieving fetched data
- **JSON Storage**: `server/fetchedConfigurations.json` file for persistence
- **API Service**: `client/src/lib/configurationApi.ts` handles external API calls

### 3. File Structure Created ✅
```
├── client/src/lib/configurationApi.ts          # API service class
├── server/fetchedConfigurations.json           # JSON storage file
├── server/routes.ts                            # Updated with config routes
└── client/src/components/TopNavbar.tsx         # Updated navbar with warehouse code
```

## Integration Steps

### Step 1: Provide Your API Endpoints

You need to replace the placeholder URLs in `TopNavbar.tsx` (lines 56-62) with your actual API endpoints:

```typescript
const apiEndpoints = {
  inventoryGroups: 'https://your-actual-api.com/api/inventory-groups/{warehouseCode}',
  taskSequences: 'https://your-actual-api.com/api/task-sequences/{warehouseCode}',
  taskPlanning: 'https://your-actual-api.com/api/task-planning/{warehouseCode}',
  taskExecution: 'https://your-actual-api.com/api/task-execution/{warehouseCode}',
  stockAllocation: 'https://your-actual-api.com/api/stock-allocation/{warehouseCode}'
};
```

**Note**: The `{warehouseCode}` placeholder will be automatically replaced with the actual warehouse code.

### Step 2: Enable the API Calls

In `TopNavbar.tsx`, uncomment line 68 and remove the simulation code:

```typescript
// Remove this simulation:
toast({
  title: 'Ready to Fetch',
  description: `Configuration fetch setup complete for warehouse ${warehouseCode}. Please provide API endpoints to enable actual fetching.`,
});

// Uncomment this line:
const result = await configurationApi.fetchConfigurations(warehouseCode, apiEndpoints);

// Add success message:
toast({
  title: 'Configurations Fetched',
  description: `Successfully fetched configurations for warehouse ${warehouseCode}`,
});
```

### Step 3: Configure Authentication (if needed)

If your APIs require authentication, update the `fetchFromEndpoint` method in `configurationApi.ts`:

```typescript
private async fetchFromEndpoint(endpoint: string, warehouseCode: string): Promise<any> {
  const url = endpoint.replace('{warehouseCode}', warehouseCode);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN', // Add your auth token
      // Add any other required headers
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
```

## API Response Format

The system expects your APIs to return JSON data. The fetched configurations will be stored in this format:

```json
{
  "warehouseCode": "YOUR_WAREHOUSE_CODE",
  "fetchedAt": "2024-01-15T10:30:00.000Z",
  "configurations": {
    "inventoryGroups": [...],
    "taskSequences": [...],
    "taskPlanning": [...],
    "taskExecution": [...],
    "stockAllocation": [...]
  }
}
```

## Usage

1. **Enter Warehouse Code**: Type a warehouse code in the navbar input
2. **Fetch Configurations**: Click the "Actions" dropdown and select "Fetch Configurations"
3. **View Results**: Configurations are automatically stored in `server/fetchedConfigurations.json`
4. **Access Stored Data**: Use the API endpoints:
   - `GET /api/configurations` - Get all stored configurations
   - `GET /api/configurations/{warehouseCode}` - Get specific warehouse configuration
   - `POST /api/configurations/store` - Store new configuration (used internally)

## Error Handling

The system includes comprehensive error handling:
- **Validation Errors**: Empty warehouse codes, missing fields
- **Network Errors**: Failed API calls, timeouts
- **Storage Errors**: File system issues (logged but don't prevent data return)
- **User Feedback**: Toast notifications for all operations

## Next Steps

1. **Provide Your API Endpoints**: Replace the placeholder URLs with your actual API endpoints
2. **Test Integration**: Try fetching configurations with a valid warehouse code
3. **Add Authentication**: If needed, configure API authentication headers
4. **Customize Data Structure**: Modify the storage format if your API responses differ

## 🚀 Complete Beginner's Guide to Adding New APIs

### What is an API and Why Do We Need It?

An **API (Application Programming Interface)** is like a messenger that allows different software applications to talk to each other. In our warehouse management system, we use APIs to:

1. **Fetch data** from external warehouse systems
2. **Store configurations** locally for fast access
3. **Share data** between our frontend (React) and backend (Express server)

Think of it like ordering food from a restaurant - you (frontend) tell the waiter (API) what you want, the waiter goes to the kitchen (external server), gets your food (data), and brings it back to you.

### Understanding Our Current System

Our WMS application has three main parts:
```
🌐 External API → 📱 Our React App → 💾 Local Storage (JSON file)
```

1. **External APIs**: Warehouse management systems that have configuration data
2. **Our React App**: The user interface where you enter warehouse codes
3. **Local Storage**: A JSON file that saves fetched configurations for later use

### Step-by-Step: Adding a New API Integration

Let's walk through adding a new API endpoint called "Shipping Rules" to our system.

#### Step 1: Understanding the Configuration API Service

Our system uses a **singleton pattern** (fancy term for "one instance for the whole app") in `client/src/lib/configurationApi.ts`. This file handles all API operations.

```typescript
// This is how we get the API service anywhere in our app
import { configurationApi } from '../lib/configurationApi';
```

#### Step 2: Add Your New API Endpoint

In `client/src/components/TopNavbar.tsx`, find the `apiEndpoints` object and add your new endpoint:

```typescript
const apiEndpoints = {
  inventoryGroups: 'https://your-api.com/api/inventory-groups/{warehouseCode}',
  taskSequences: 'https://your-api.com/api/task-sequences/{warehouseCode}',
  taskPlanning: 'https://your-api.com/api/task-planning/{warehouseCode}',
  taskExecution: 'https://your-api.com/api/task-execution/{warehouseCode}',
  stockAllocation: 'https://your-api.com/api/stock-allocation/{warehouseCode}',
  
  // 🆕 ADD YOUR NEW API HERE
  shippingRules: 'https://your-api.com/api/shipping-rules/{warehouseCode}'
};
```

**Important Notes:**
- The `{warehouseCode}` part gets automatically replaced with the actual warehouse code
- Use your real API URL, not the placeholder
- Make sure your API accepts POST requests (our system sends POST by default)

#### Step 3: Understanding Data Flow

Here's what happens when someone clicks "Fetch Configurations":

```
1. User enters warehouse code: "WH001"
2. User clicks "Fetch Configurations"
3. System calls configurationApi.fetchConfigurations()
4. For each endpoint, system replaces {warehouseCode} with "WH001"
5. System makes POST requests to all APIs simultaneously
6. System collects all responses
7. System saves everything to server/fetchedConfigurations.json
8. System shows success message to user
```

#### Step 4: Understanding the Storage Format

When data is fetched, it gets stored in this format in `server/fetchedConfigurations.json`:

```json
{
  "configurations": [
    {
      "warehouseCode": "WH001",
      "fetchedAt": "2024-01-15T10:30:00.000Z",
      "configurations": {
        "inventoryGroups": [...], // Data from inventory API
        "taskSequences": [...],   // Data from task sequences API
        "taskPlanning": [...],    // Data from task planning API
        "taskExecution": [...],   // Data from task execution API
        "stockAllocation": [...], // Data from stock allocation API
        "shippingRules": [...]    // 🆕 YOUR NEW DATA WILL BE HERE
      }
    }
  ],
  "lastUpdated": "2024-01-15T10:30:05.000Z"
}
```

### Example: Complete API Integration

Let's say you want to add a "Product Catalog" API. Here's exactly what you need to do:

#### 1. Add the endpoint in TopNavbar.tsx:
```typescript
const apiEndpoints = {
  // ... existing endpoints ...
  productCatalog: 'https://warehouse-api.company.com/v1/products/{warehouseCode}'
};
```

#### 2. Your API should return data like this:
```json
[
  {
    "productId": "PROD001",
    "name": "Widget A",
    "category": "Electronics",
    "stock": 150
  },
  {
    "productId": "PROD002", 
    "name": "Widget B",
    "category": "Tools",
    "stock": 75
  }
]
```

#### 3. After fetching, your data will be stored as:
```json
{
  "warehouseCode": "WH001",
  "fetchedAt": "2024-01-15T10:30:00.000Z",
  "configurations": {
    "productCatalog": [
      {
        "productId": "PROD001",
        "name": "Widget A", 
        "category": "Electronics",
        "stock": 150
      }
    ]
  }
}
```

### Common API Requirements and Solutions

#### Authentication Required?
If your API needs authentication, update the `fetchFromEndpoint` method in `configurationApi.ts`:

```typescript
private async fetchFromEndpoint(endpoint: string, warehouseCode: string): Promise<any> {
  const url = endpoint.replace('{warehouseCode}', warehouseCode);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_TOKEN_HERE', // 🔑 Add your token
      'X-API-Key': 'your-api-key-if-needed'          // 🔑 Or API key
    },
    body: JSON.stringify({}),
  });
  
  // ... rest of the method
}
```

#### Different HTTP Method Needed?
Change the `method` from 'POST' to 'GET', 'PUT', etc.:

```typescript
const response = await fetch(url, {
  method: 'GET', // 🔄 Change this as needed
  headers: {
    'Content-Type': 'application/json',
  },
  // Remove body for GET requests
});
```

#### Need to Send Data in the Request?
Modify the `body` parameter:

```typescript
body: JSON.stringify({
  warehouseCode: warehouseCode,
  requestedData: ['inventory', 'stock'],
  timestamp: new Date().toISOString()
}),
```

### Accessing Stored Data in Your React Components

Once data is fetched and stored, you can access it in any React component:

```typescript
import { configurationApi } from '../lib/configurationApi';
import { useEffect, useState } from 'react';

function MyComponent() {
  const [configurations, setConfigurations] = useState(null);
  
  useEffect(() => {
    async function loadData() {
      // Get data for a specific warehouse
      const data = await configurationApi.getStoredConfigurations('WH001');
      setConfigurations(data);
    }
    
    loadData();
  }, []);
  
  if (!configurations) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h2>Warehouse: {configurations.warehouseCode}</h2>
      <p>Fetched: {new Date(configurations.fetchedAt).toLocaleString()}</p>
      
      {/* Access your specific data */}
      {configurations.configurations.shippingRules && (
        <div>
          <h3>Shipping Rules</h3>
          {configurations.configurations.shippingRules.map((rule, index) => (
            <div key={index}>{rule.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Troubleshooting Common Issues

#### 1. "Failed to fetch" Error
- Check if your API URL is correct
- Verify your API accepts POST requests
- Check for CORS issues (API must allow requests from your domain)
- Verify API is online and accessible

#### 2. "Unauthorized" Error
- Add proper authentication headers
- Check if your API token is valid
- Verify API key permissions

#### 3. Data Not Showing Up
- Check browser console for errors
- Verify data format matches expected structure
- Check if `fetchedConfigurations.json` file was updated

#### 4. Empty Response
- Verify your warehouse code exists in the external system
- Check API documentation for required parameters
- Test API directly with tools like Postman

### Testing Your Integration

1. **Start the development server**: `npm run dev`
2. **Open browser**: Go to `http://localhost:5000`
3. **Enter warehouse code**: Use a code that exists in your external system
4. **Click "Actions" → "Fetch Configurations"**
5. **Check results**:
   - Look for success toast notification
   - Check browser console for any errors
   - Verify `server/fetchedConfigurations.json` was updated
   - Use browser dev tools to inspect network requests

### Best Practices

1. **Always validate data**: Check if API responses have expected structure
2. **Handle errors gracefully**: Don't let one failed API break the entire fetch
3. **Use meaningful names**: Name your API endpoints clearly (e.g., `productCatalog`, not `api1`)
4. **Test with real data**: Use actual warehouse codes and verify responses
5. **Monitor performance**: Large responses might slow down the UI

### Next Steps After Integration

Once your API is working:

1. **Create UI components** to display the fetched data
2. **Add data validation** using Zod schemas
3. **Implement data refresh** functionality
4. **Add error handling** in your React components
5. **Consider caching strategies** for frequently accessed data

## Testing

You can test the current setup by:
1. Running `npm run dev`
2. Entering a warehouse code
3. Clicking "Actions" → "Fetch Configurations"
4. Check console logs and toast notifications

The system is ready for integration - just provide your API endpoint details!