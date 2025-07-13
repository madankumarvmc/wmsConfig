import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
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
  inventoryGroupId: integer("inventory_group_id").notNull(),
  taskSequences: text("task_sequences").array(),
  shipmentAcknowledgment: text("shipment_acknowledgment"),
});

export const pickStrategyConfigurations = pgTable("pick_strategy_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  inventoryGroupId: integer("inventory_group_id").notNull(),
  taskKind: text("task_kind").notNull(),
  taskSubKind: text("task_sub_kind").notNull(),
  taskAttrs: jsonb("task_attrs").default('{}'),
  strat: text("strat").notNull(),
  sortingStrategy: text("sorting_strategy").notNull(),
  loadingStrategy: text("loading_strategy").notNull(),
  groupBy: text("group_by").array(),
  taskLabel: text("task_label").notNull(),
});

export const huFormationConfigurations = pgTable("hu_formation_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  pickStrategyId: integer("pick_strategy_id").notNull(),
  tripType: text("trip_type").notNull(),
  huKinds: text("hu_kinds").array(),
  scanSourceHUKind: text("scan_source_hu_kind").notNull(),
  pickSourceHUKind: text("pick_source_hu_kind").notNull(),
  carrierHUKind: text("carrier_hu_kind").notNull(),
  huMappingMode: text("hu_mapping_mode").notNull(),
  dropHUQuantThreshold: integer("drop_hu_quant_threshold").notNull().default(0),
  dropUOM: text("drop_uom").notNull(),
  allowComplete: boolean("allow_complete").notNull().default(true),
  swapHUThreshold: integer("swap_hu_threshold").notNull().default(0),
  dropInnerHU: boolean("drop_inner_hu").notNull().default(true),
  allowInnerHUBreak: boolean("allow_inner_hu_break").notNull().default(true),
  displayDropUOM: boolean("display_drop_uom").notNull().default(true),
  autoUOMConversion: boolean("auto_uom_conversion").notNull().default(true),
  mobileSorting: boolean("mobile_sorting").notNull().default(true),
  sortingParam: text("sorting_param").notNull(),
  huWeightThreshold: integer("hu_weight_threshold").notNull().default(0),
  qcMismatchMonthThreshold: integer("qc_mismatch_month_threshold").notNull().default(0),
  quantSlottingForHUsInDrop: boolean("quant_slotting_for_hus_in_drop").notNull().default(true),
  allowPickingMultiBatchfromHU: boolean("allow_picking_multi_batch_from_hu").notNull().default(true),
  displayEditPickQuantity: boolean("display_edit_pick_quantity").notNull().default(true),
  pickBundles: boolean("pick_bundles").notNull().default(true),
  enableEditQtyInPickOp: boolean("enable_edit_qty_in_pick_op").notNull().default(true),
  dropSlottingMode: text("drop_slotting_mode").notNull(),
  enableManualDestBinSelection: boolean("enable_manual_dest_bin_selection").notNull().default(true),
});

// One-Click Templates
export const oneClickTemplates = pgTable("one_click_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  industry: text("industry").notNull(),
  complexity: text("complexity").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  templateData: jsonb("template_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workOrderManagementConfigurations = pgTable("work_order_management_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  pickStrategyId: integer("pick_strategy_id").notNull(),
  mapSegregationGroupsToBins: boolean("map_segregation_groups_to_bins").notNull().default(true),
  dropHUInBin: boolean("drop_hu_in_bin").notNull().default(true),
  scanDestHUInDrop: boolean("scan_dest_hu_in_drop").notNull().default(true),
  allowHUBreakInDrop: boolean("allow_hu_break_in_drop").notNull().default(true),
  strictBatchAdherence: boolean("strict_batch_adherence").notNull().default(true),
  allowWorkOrderSplit: boolean("allow_work_order_split").notNull().default(true),
  undoOp: boolean("undo_op").notNull().default(true),
  disableWorkOrder: boolean("disable_work_order").notNull().default(false),
  allowUnpick: boolean("allow_unpick").notNull().default(true),
  supportPalletScan: boolean("support_pallet_scan").notNull().default(true),
  loadingUnits: text("loading_units").array(),
  pickMandatoryScan: boolean("pick_mandatory_scan").notNull().default(true),
  dropMandatoryScan: boolean("drop_mandatory_scan").notNull().default(true),
});

export const inventoryGroups = pgTable("inventory_groups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  storageIdentifiers: jsonb("storage_identifiers").notNull(),
  lineIdentifiers: jsonb("line_identifiers").notNull(),
  description: text("description"),
});

export const stockAllocationStrategies = pgTable("stock_allocation_strategies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  inventoryGroupId: integer("inventory_group_id").notNull(),
  mode: text("mode").notNull(), // "PICK" or "PUT"
  priority: integer("priority").notNull().default(100),
  skipZoneFace: boolean("skip_zone_face"),
  orderByQuantUpdatedAt: boolean("order_by_quant_updated_at").notNull().default(false),
  searchScope: text("search_scope").notNull().default("AREA"),
  preferFixed: boolean("prefer_fixed").notNull().default(true),
  preferNonFixed: boolean("prefer_non_fixed").notNull().default(false),
  statePreferenceSeq: text("state_preference_seq").array().notNull(),
  batchPreferenceMode: text("batch_preference_mode").notNull().default("NONE"),
  orderByPickingPosition: boolean("order_by_picking_position").notNull().default(false),
  useInventorySnapshotForPickSlotting: boolean("use_inventory_snapshot_for_pick_slotting").notNull().default(false),
  optimizationMode: text("optimization_mode").notNull().default("TOUCH"),
});

export const taskPlanningConfigurations = pgTable("task_planning_configurations", {
  id: serial("id").primaryKey(),
  inventoryGroupId: integer("inventory_group_id").notNull(),
  userId: integer("user_id").notNull(),
  configurationName: text("configuration_name").notNull(),
  description: text("description"),
  
  // Task Planning Config fields - all optional
  taskKind: text("task_kind"),
  taskSubKind: text("task_sub_kind"),
  taskAttrs: jsonb("task_attrs"),
  strat: text("strat"),
  sortingStrategy: text("sorting_strategy"),
  loadingStrategy: text("loading_strategy"),
  groupBy: text("group_by").array(),
  taskLabel: text("task_label"),
  mode: text("mode"),
  priority: integer("priority"),
  skipZoneFace: text("skip_zone_face"),
  orderByQuantUpdatedAt: boolean("order_by_quant_updated_at"),
  searchScope: text("search_scope"),
  statePreferenceOrder: text("state_preference_order").array(),
  preferFixed: boolean("prefer_fixed"),
  preferNonFixed: boolean("prefer_non_fixed"),
  statePreferenceSeq: text("state_preference_seq").array(),
  batchPreferenceMode: text("batch_preference_mode"),
  areaTypes: text("area_types").array(),
  areas: text("areas").array(),
  orderByPickingPosition: boolean("order_by_picking_position"),
  useInventorySnapshotForPickSlotting: boolean("use_inventory_snapshot_for_pick_slotting"),
  optimizationMode: text("optimization_mode"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const taskExecutionConfigurations = pgTable("task_execution_configurations", {
  id: serial("id").primaryKey(),
  taskPlanningConfigurationId: integer("task_planning_configuration_id").notNull(),
  userId: integer("user_id").notNull(),
  configurationName: text("configuration_name").notNull(),
  description: text("description"),
  
  // Task Execution Config fields - all optional
  tripType: text("trip_type"),
  huKinds: text("hu_kinds").array(),
  scanSourceHUKind: text("scan_source_hu_kind"),
  pickSourceHUKind: text("pick_source_hu_kind"),
  carrierHUKind: text("carrier_hu_kind"),
  huMappingMode: text("hu_mapping_mode"),
  dropHUQuantThreshold: integer("drop_hu_quant_threshold"),
  dropUOM: text("drop_uom"),
  allowComplete: boolean("allow_complete"),
  swapHUThreshold: integer("swap_hu_threshold"),
  dropInnerHU: boolean("drop_inner_hu"),
  allowInnerHUBreak: boolean("allow_inner_hu_break"),
  displayDropUOM: boolean("display_drop_uom"),
  autoUOMConversion: boolean("auto_uom_conversion"),
  mobileSorting: boolean("mobile_sorting"),
  sortingParam: text("sorting_param"),
  huWeightThreshold: integer("hu_weight_threshold"),
  qcMismatchMonthThreshold: integer("qc_mismatch_month_threshold"),
  quantSlottingForHUsInDrop: boolean("quant_slotting_for_hus_in_drop"),
  allowPickingMultiBatchfromHU: boolean("allow_picking_multi_batch_from_hu"),
  displayEditPickQuantity: boolean("display_edit_pick_quantity"),
  pickBundles: boolean("pick_bundles"),
  enableEditQtyInPickOp: boolean("enable_edit_qty_in_pick_op"),
  dropSlottingMode: text("drop_slotting_mode"),
  enableManualDestBinSelection: boolean("enable_manual_dest_bin_selection"),
  mapSegregationGroupsToBins: boolean("map_segregation_groups_to_bins"),
  dropHUInBin: boolean("drop_hu_in_bin"),
  scanDestHUInDrop: boolean("scan_dest_hu_in_drop"),
  allowHUBreakInDrop: boolean("allow_hu_break_in_drop"),
  strictBatchAdherence: boolean("strict_batch_adherence"),
  allowWorkOrderSplit: boolean("allow_work_order_split"),
  undoOp: boolean("undo_op"),
  disableWorkOrder: boolean("disable_work_order"),
  allowUnpick: boolean("allow_unpick"),
  supportPalletScan: boolean("support_pallet_scan"),
  loadingUnits: text("loading_units").array(),
  pickMandatoryScan: boolean("pick_mandatory_scan"),
  dropMandatoryScan: boolean("drop_mandatory_scan"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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

export const insertPickStrategyConfigurationSchema = createInsertSchema(pickStrategyConfigurations).omit({
  id: true,
});

export const insertHUFormationConfigurationSchema = createInsertSchema(huFormationConfigurations).omit({
  id: true,
});

export const insertWorkOrderManagementConfigurationSchema = createInsertSchema(workOrderManagementConfigurations).omit({
  id: true,
});

export const insertInventoryGroupSchema = createInsertSchema(inventoryGroups).omit({
  id: true,
});

export const insertStockAllocationStrategySchema = createInsertSchema(stockAllocationStrategies).omit({
  id: true,
});

export const insertTaskPlanningConfigurationSchema = createInsertSchema(taskPlanningConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskExecutionConfigurationSchema = createInsertSchema(taskExecutionConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOneClickTemplateSchema = createInsertSchema(oneClickTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type WizardConfiguration = typeof wizardConfigurations.$inferSelect;
export type InsertWizardConfiguration = z.infer<typeof insertWizardConfigurationSchema>;
export type TaskSequenceConfiguration = typeof taskSequenceConfigurations.$inferSelect;
export type InsertTaskSequenceConfiguration = z.infer<typeof insertTaskSequenceConfigurationSchema>;
export type PickStrategyConfiguration = typeof pickStrategyConfigurations.$inferSelect;
export type InsertPickStrategyConfiguration = z.infer<typeof insertPickStrategyConfigurationSchema>;
export type HUFormationConfiguration = typeof huFormationConfigurations.$inferSelect;
export type InsertHUFormationConfiguration = z.infer<typeof insertHUFormationConfigurationSchema>;
export type WorkOrderManagementConfiguration = typeof workOrderManagementConfigurations.$inferSelect;
export type InsertWorkOrderManagementConfiguration = z.infer<typeof insertWorkOrderManagementConfigurationSchema>;
export type InventoryGroup = typeof inventoryGroups.$inferSelect;
export type InsertInventoryGroup = z.infer<typeof insertInventoryGroupSchema>;
export type StockAllocationStrategy = typeof stockAllocationStrategies.$inferSelect;
export type InsertStockAllocationStrategy = z.infer<typeof insertStockAllocationStrategySchema>;
export type TaskPlanningConfiguration = typeof taskPlanningConfigurations.$inferSelect;
export type InsertTaskPlanningConfiguration = z.infer<typeof insertTaskPlanningConfigurationSchema>;
export type TaskExecutionConfiguration = typeof taskExecutionConfigurations.$inferSelect;
export type InsertTaskExecutionConfiguration = z.infer<typeof insertTaskExecutionConfigurationSchema>;
export type OneClickTemplate = typeof oneClickTemplates.$inferSelect;
export type InsertOneClickTemplate = z.infer<typeof insertOneClickTemplateSchema>;
