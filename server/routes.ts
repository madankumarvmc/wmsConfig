import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWizardConfigurationSchema, insertTaskSequenceConfigurationSchema, insertPickStrategyConfigurationSchema, insertHUFormationConfigurationSchema, insertWorkOrderManagementConfigurationSchema, insertInventoryGroupSchema, insertStockAllocationStrategySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user for development (in production this would come from authentication)
  const MOCK_USER_ID = 1;

  // Wizard configuration routes
  app.get("/api/wizard/configurations", async (req, res) => {
    try {
      const configurations = await storage.getAllWizardConfigurations(MOCK_USER_ID);
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wizard configurations" });
    }
  });

  app.get("/api/wizard/configurations/:step", async (req, res) => {
    try {
      const step = parseInt(req.params.step);
      const configuration = await storage.getWizardConfiguration(MOCK_USER_ID, step);
      res.json(configuration || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wizard configuration" });
    }
  });

  app.post("/api/wizard/configurations", async (req, res) => {
    try {
      const validatedData = insertWizardConfigurationSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const configuration = await storage.saveWizardConfiguration(validatedData);
      res.json(configuration);
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  // Task sequence configuration routes
  app.get("/api/task-sequences", async (req, res) => {
    try {
      const configurations = await storage.getTaskSequenceConfigurations(MOCK_USER_ID);
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task sequence configurations" });
    }
  });

  app.post("/api/task-sequences", async (req, res) => {
    try {
      const validatedData = insertTaskSequenceConfigurationSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const configuration = await storage.saveTaskSequenceConfiguration(validatedData);
      res.json(configuration);
    } catch (error) {
      res.status(400).json({ error: "Invalid task sequence configuration data" });
    }
  });

  app.put("/api/task-sequences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const configuration = await storage.updateTaskSequenceConfiguration(id, req.body);
      if (configuration) {
        res.json(configuration);
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  app.delete("/api/task-sequences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTaskSequenceConfiguration(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete configuration" });
    }
  });

  // Pick strategy configuration routes
  app.get("/api/pick-strategies", async (req, res) => {
    try {
      const configurations = await storage.getPickStrategyConfigurations(MOCK_USER_ID);
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pick strategy configurations" });
    }
  });

  app.post("/api/pick-strategies", async (req, res) => {
    try {
      const validatedData = insertPickStrategyConfigurationSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const configuration = await storage.savePickStrategyConfiguration(validatedData);
      res.json(configuration);
    } catch (error) {
      res.status(400).json({ error: "Invalid pick strategy configuration data" });
    }
  });

  app.put("/api/pick-strategies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const configuration = await storage.updatePickStrategyConfiguration(id, req.body);
      if (configuration) {
        res.json(configuration);
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  app.delete("/api/pick-strategies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePickStrategyConfiguration(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete configuration" });
    }
  });

  // HU Formation configuration routes
  app.get("/api/hu-formations", async (req, res) => {
    try {
      const configurations = await storage.getHUFormationConfigurations(MOCK_USER_ID);
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch HU formation configurations" });
    }
  });

  app.get("/api/hu-formations/by-strategy/:pickStrategyId", async (req, res) => {
    try {
      const pickStrategyId = parseInt(req.params.pickStrategyId);
      const configuration = await storage.getHUFormationByPickStrategy(pickStrategyId);
      res.json(configuration || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch HU formation configuration" });
    }
  });

  app.post("/api/hu-formations", async (req, res) => {
    try {
      const validatedData = insertHUFormationConfigurationSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const configuration = await storage.saveHUFormationConfiguration(validatedData);
      res.json(configuration);
    } catch (error) {
      res.status(400).json({ error: "Invalid HU formation configuration data" });
    }
  });

  app.put("/api/hu-formations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const configuration = await storage.updateHUFormationConfiguration(id, req.body);
      if (configuration) {
        res.json(configuration);
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  app.delete("/api/hu-formations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteHUFormationConfiguration(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete configuration" });
    }
  });

  // Work Order Management configuration routes
  app.get("/api/work-order-management", async (req, res) => {
    try {
      const configurations = await storage.getWorkOrderManagementConfigurations(MOCK_USER_ID);
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work order management configurations" });
    }
  });

  app.get("/api/work-order-management/by-strategy/:pickStrategyId", async (req, res) => {
    try {
      const pickStrategyId = parseInt(req.params.pickStrategyId);
      const configuration = await storage.getWorkOrderManagementByPickStrategy(pickStrategyId);
      res.json(configuration || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work order management configuration" });
    }
  });

  app.post("/api/work-order-management", async (req, res) => {
    try {
      const validatedData = insertWorkOrderManagementConfigurationSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const configuration = await storage.saveWorkOrderManagementConfiguration(validatedData);
      res.json(configuration);
    } catch (error) {
      res.status(400).json({ error: "Invalid work order management configuration data" });
    }
  });

  app.put("/api/work-order-management/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const configuration = await storage.updateWorkOrderManagementConfiguration(id, req.body);
      if (configuration) {
        res.json(configuration);
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  app.delete("/api/work-order-management/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorkOrderManagementConfiguration(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete configuration" });
    }
  });

  // Inventory Groups routes
  app.get("/api/inventory-groups", async (req, res) => {
    try {
      const groups = await storage.getInventoryGroups(MOCK_USER_ID);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory groups" });
    }
  });

  app.post("/api/inventory-groups", async (req, res) => {
    try {
      const validatedData = insertInventoryGroupSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const group = await storage.saveInventoryGroup(validatedData);
      res.json(group);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory group data" });
    }
  });

  app.put("/api/inventory-groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const group = await storage.updateInventoryGroup(id, req.body);
      if (group) {
        res.json(group);
      } else {
        res.status(404).json({ error: "Group not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid group data" });
    }
  });

  app.delete("/api/inventory-groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInventoryGroup(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Group not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete group" });
    }
  });

  // Stock Allocation Strategies routes
  app.get("/api/stock-allocation-strategies", async (req, res) => {
    try {
      const strategies = await storage.getStockAllocationStrategies(MOCK_USER_ID);
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock allocation strategies" });
    }
  });

  app.get("/api/stock-allocation-strategies/by-group/:inventoryGroupId", async (req, res) => {
    try {
      const inventoryGroupId = parseInt(req.params.inventoryGroupId);
      const strategies = await storage.getStockAllocationStrategiesByGroup(inventoryGroupId);
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch strategies for group" });
    }
  });

  app.post("/api/stock-allocation-strategies", async (req, res) => {
    try {
      const validatedData = insertStockAllocationStrategySchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const strategy = await storage.saveStockAllocationStrategy(validatedData);
      res.json(strategy);
    } catch (error) {
      res.status(400).json({ error: "Invalid stock allocation strategy data" });
    }
  });

  app.put("/api/stock-allocation-strategies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const strategy = await storage.updateStockAllocationStrategy(id, req.body);
      if (strategy) {
        res.json(strategy);
      } else {
        res.status(404).json({ error: "Strategy not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid strategy data" });
    }
  });

  app.delete("/api/stock-allocation-strategies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStockAllocationStrategy(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Strategy not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete strategy" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
