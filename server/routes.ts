import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWizardConfigurationSchema, insertTaskSequenceConfigurationSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
