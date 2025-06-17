import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const wizardConfigurations = pgTable("wizard_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  step: integer("step").notNull(),
  data: jsonb("data").notNull(),
  isComplete: boolean("is_complete").default(false),
});

export const taskSequenceConfigurations = pgTable("task_sequence_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  storageIdentifiers: jsonb("storage_identifiers").notNull(),
  lineIdentifiers: jsonb("line_identifiers").notNull(),
  taskSequences: text("task_sequences").array(),
  shipmentAcknowledgment: text("shipment_acknowledgment"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWizardConfigurationSchema = createInsertSchema(wizardConfigurations).omit({
  id: true,
});

export const insertTaskSequenceConfigurationSchema = createInsertSchema(taskSequenceConfigurations).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type WizardConfiguration = typeof wizardConfigurations.$inferSelect;
export type InsertWizardConfiguration = z.infer<typeof insertWizardConfigurationSchema>;
export type TaskSequenceConfiguration = typeof taskSequenceConfigurations.$inferSelect;
export type InsertTaskSequenceConfiguration = z.infer<typeof insertTaskSequenceConfigurationSchema>;
