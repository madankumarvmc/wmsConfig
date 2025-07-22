import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWizardConfigurationSchema, insertTaskSequenceConfigurationSchema, insertInventoryGroupSchema, insertStockAllocationStrategySchema, insertTaskPlanningConfigurationSchema, insertTaskExecutionConfigurationSchema } from "@shared/schema";

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
        userId: MOCK_USER_ID,
        step: req.body.step,
        data: req.body.data || {},
        isComplete: req.body.isComplete || false
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

  // Inventory group routes
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
        userId: MOCK_USER_ID,
        name: req.body.name,
        storageIdentifiers: req.body.storageIdentifiers || {},
        lineIdentifiers: req.body.lineIdentifiers || {},
        description: req.body.description
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
        res.status(404).json({ error: "Inventory group not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory group data" });
    }
  });

  app.delete("/api/inventory-groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInventoryGroup(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Inventory group not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inventory group" });
    }
  });

  // Stock allocation strategy routes
  app.get("/api/stock-allocation", async (req, res) => {
    try {
      const strategies = await storage.getStockAllocationStrategies(MOCK_USER_ID);
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock allocation strategies" });
    }
  });

  app.get("/api/stock-allocation/by-group/:inventoryGroupId", async (req, res) => {
    try {
      const inventoryGroupId = parseInt(req.params.inventoryGroupId);
      const strategies = await storage.getStockAllocationStrategiesByGroup(inventoryGroupId);
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock allocation strategies" });
    }
  });

  app.post("/api/stock-allocation", async (req, res) => {
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

  app.put("/api/stock-allocation/:id", async (req, res) => {
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

  app.delete("/api/stock-allocation/:id", async (req, res) => {
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

  // Task planning configuration routes
  app.get("/api/task-planning", async (req, res) => {
    try {
      const configurations = await storage.getTaskPlanningConfigurations(MOCK_USER_ID);
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task planning configurations" });
    }
  });

  app.get("/api/task-planning/by-group/:inventoryGroupId", async (req, res) => {
    try {
      const inventoryGroupId = parseInt(req.params.inventoryGroupId);
      const configurations = await storage.getTaskPlanningConfigurationsByGroup(inventoryGroupId);
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task planning configurations" });
    }
  });

  app.post("/api/task-planning", async (req, res) => {
    try {
      const validatedData = insertTaskPlanningConfigurationSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const configuration = await storage.saveTaskPlanningConfiguration(validatedData);
      res.json(configuration);
    } catch (error) {
      res.status(400).json({ error: "Invalid task planning configuration data" });
    }
  });

  app.put("/api/task-planning/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const configuration = await storage.updateTaskPlanningConfiguration(id, req.body);
      if (configuration) {
        res.json(configuration);
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  app.delete("/api/task-planning/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTaskPlanningConfiguration(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete configuration" });
    }
  });

  // Task execution configuration routes
  app.get("/api/task-execution", async (req, res) => {
    try {
      const configurations = await storage.getTaskExecutionConfigurations(MOCK_USER_ID);
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task execution configurations" });
    }
  });

  app.get("/api/task-execution/by-planning/:taskPlanningConfigurationId", async (req, res) => {
    try {
      const taskPlanningConfigurationId = parseInt(req.params.taskPlanningConfigurationId);
      const configuration = await storage.getTaskExecutionByPlanning(taskPlanningConfigurationId);
      res.json(configuration || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task execution configuration" });
    }
  });

  app.post("/api/task-execution", async (req, res) => {
    try {
      const validatedData = insertTaskExecutionConfigurationSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      const configuration = await storage.saveTaskExecutionConfiguration(validatedData);
      res.json(configuration);
    } catch (error) {
      res.status(400).json({ error: "Invalid task execution configuration data" });
    }
  });

  app.put("/api/task-execution/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const configuration = await storage.updateTaskExecutionConfiguration(id, req.body);
      if (configuration) {
        res.json(configuration);
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  app.delete("/api/task-execution/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTaskExecutionConfiguration(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Configuration not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete configuration" });
    }
  });

  // One-click template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getOneClickTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getOneClickTemplate(id);
      if (template) {
        res.json(template);
      } else {
        res.status(404).json({ error: "Template not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/templates/:id/apply", async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const success = await storage.applyTemplate(templateId, MOCK_USER_ID);
      if (success) {
        res.json({ success: true, message: "Template applied successfully" });
      } else {
        res.status(404).json({ error: "Template not found or failed to apply" });
      }
    } catch (error) {
      console.error('Template application error:', error);
      res.status(500).json({ error: "Failed to apply template" });
    }
  });

  // Configuration export route
  app.get("/api/export/outbound", async (req, res) => {
    try {
      const [
        inventoryGroups,
        taskSequences,
        stockAllocationStrategies,
        taskPlanningConfigurations,
        taskExecutionConfigurations
      ] = await Promise.all([
        storage.getInventoryGroups(MOCK_USER_ID),
        storage.getTaskSequenceConfigurations(MOCK_USER_ID),
        storage.getStockAllocationStrategies(MOCK_USER_ID),
        storage.getTaskPlanningConfigurations(MOCK_USER_ID),
        storage.getTaskExecutionConfigurations(MOCK_USER_ID)
      ]);

      const exportData = {
        exportTimestamp: new Date().toISOString(),
        version: "1.0",
        configurations: {
          inventoryGroups,
          taskSequences,
          stockAllocationStrategies,
          taskPlanningConfigurations,
          taskExecutionConfigurations
        }
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="outbound-config-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export configurations" });
    }
  });

  // Quick Setup - Apply Default Configuration
  app.post("/api/quick-setup", async (req, res) => {
    try {
      const results = {
        taskSequences: 0,
        inventoryGroups: 0,
        stockAllocationStrategies: 0
      };

      // Default Task Sequence Configuration
      const taskSeqConfig = await storage.saveTaskSequenceConfiguration({
        userId: MOCK_USER_ID,
        taskSequences: ["OUTBOUND_REPLEN", "OUTBOUND_PICK", "OUTBOUND_LOAD"],
        shipmentAcknowledgment: "SHIPMENT"
      });
      results.taskSequences = 1;

      // Default Inventory Groups
      const group1 = await storage.saveInventoryGroup({
        userId: MOCK_USER_ID,
        name: "L0 Inventory Group",
        storageIdentifiers: { uom: "L0" },
        lineIdentifiers: {},
        description: "Level 0 items with area-based picking"
      });

      const group2 = await storage.saveInventoryGroup({
        userId: MOCK_USER_ID,
        name: "L2 Inventory Group",
        storageIdentifiers: { uom: "L2" },
        lineIdentifiers: {},
        description: "Level 2 items with UOM-based picking"
      });

      const group3 = await storage.saveInventoryGroup({
        userId: MOCK_USER_ID,
        name: "Replenishment Group",
        storageIdentifiers: {},
        lineIdentifiers: {},
        description: "Replenishment operations for outbound"
      });
      results.inventoryGroups = 3;
      
      // Create basic stock allocation strategies for each group
      await storage.saveStockAllocationStrategy({
        userId: MOCK_USER_ID,
        inventoryGroupId: group1.id,
        mode: "PICK",
        searchScope: "AREA",
        preferFixed: true,
        preferNonFixed: false
      });

      await storage.saveStockAllocationStrategy({
        userId: MOCK_USER_ID,
        inventoryGroupId: group2.id,
        mode: "PICK",
        searchScope: "AREA",
        preferFixed: true,
        preferNonFixed: false
      });

      await storage.saveStockAllocationStrategy({
        userId: MOCK_USER_ID,
        inventoryGroupId: group3.id,
        mode: "PICK",
        searchScope: "WH",
        preferFixed: false,
        preferNonFixed: true
      });
      
      results.stockAllocationStrategies = 3;

      res.json({
        success: true,
        message: "Quick setup completed successfully",
        results
      });
    } catch (error) {
      console.error('Quick setup error:', error);
      res.status(500).json({ error: "Failed to apply quick setup" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}