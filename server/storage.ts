import { 
  users, 
  wizardConfigurations,
  taskSequenceConfigurations,
  pickStrategyConfigurations,
  huFormationConfigurations,
  workOrderManagementConfigurations,
  type User, 
  type InsertUser,
  type WizardConfiguration,
  type InsertWizardConfiguration,
  type TaskSequenceConfiguration,
  type InsertTaskSequenceConfiguration,
  type PickStrategyConfiguration,
  type InsertPickStrategyConfiguration,
  type HUFormationConfiguration,
  type InsertHUFormationConfiguration,
  type WorkOrderManagementConfiguration,
  type InsertWorkOrderManagementConfiguration,
  type InventoryGroup,
  type InsertInventoryGroup,
  type StockAllocationStrategy,
  type InsertStockAllocationStrategy,
  type TaskPlanningConfiguration,
  type InsertTaskPlanningConfiguration,
  type TaskExecutionConfiguration,
  type InsertTaskExecutionConfiguration,
  type OneClickTemplate,
  type InsertOneClickTemplate
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getWizardConfiguration(userId: number, step: number): Promise<WizardConfiguration | undefined>;
  saveWizardConfiguration(config: InsertWizardConfiguration): Promise<WizardConfiguration>;
  getAllWizardConfigurations(userId: number): Promise<WizardConfiguration[]>;
  
  getTaskSequenceConfigurations(userId: number): Promise<TaskSequenceConfiguration[]>;
  saveTaskSequenceConfiguration(config: InsertTaskSequenceConfiguration): Promise<TaskSequenceConfiguration>;
  deleteTaskSequenceConfiguration(id: number): Promise<boolean>;
  updateTaskSequenceConfiguration(id: number, config: Partial<InsertTaskSequenceConfiguration>): Promise<TaskSequenceConfiguration | undefined>;
  
  getPickStrategyConfigurations(userId: number): Promise<PickStrategyConfiguration[]>;
  savePickStrategyConfiguration(config: InsertPickStrategyConfiguration): Promise<PickStrategyConfiguration>;
  deletePickStrategyConfiguration(id: number): Promise<boolean>;
  updatePickStrategyConfiguration(id: number, config: Partial<InsertPickStrategyConfiguration>): Promise<PickStrategyConfiguration | undefined>;
  
  getHUFormationConfigurations(userId: number): Promise<HUFormationConfiguration[]>;
  getHUFormationByPickStrategy(pickStrategyId: number): Promise<HUFormationConfiguration | undefined>;
  saveHUFormationConfiguration(config: InsertHUFormationConfiguration): Promise<HUFormationConfiguration>;
  deleteHUFormationConfiguration(id: number): Promise<boolean>;
  updateHUFormationConfiguration(id: number, config: Partial<InsertHUFormationConfiguration>): Promise<HUFormationConfiguration | undefined>;
  
  getWorkOrderManagementConfigurations(userId: number): Promise<WorkOrderManagementConfiguration[]>;
  getWorkOrderManagementByPickStrategy(pickStrategyId: number): Promise<WorkOrderManagementConfiguration | undefined>;
  saveWorkOrderManagementConfiguration(config: InsertWorkOrderManagementConfiguration): Promise<WorkOrderManagementConfiguration>;
  deleteWorkOrderManagementConfiguration(id: number): Promise<boolean>;
  updateWorkOrderManagementConfiguration(id: number, config: Partial<InsertWorkOrderManagementConfiguration>): Promise<WorkOrderManagementConfiguration | undefined>;
  
  getInventoryGroups(userId: number): Promise<InventoryGroup[]>;
  saveInventoryGroup(group: InsertInventoryGroup): Promise<InventoryGroup>;
  deleteInventoryGroup(id: number): Promise<boolean>;
  updateInventoryGroup(id: number, group: Partial<InsertInventoryGroup>): Promise<InventoryGroup | undefined>;
  
  getStockAllocationStrategies(userId: number): Promise<StockAllocationStrategy[]>;
  getStockAllocationStrategiesByGroup(inventoryGroupId: number): Promise<StockAllocationStrategy[]>;
  saveStockAllocationStrategy(strategy: InsertStockAllocationStrategy): Promise<StockAllocationStrategy>;
  deleteStockAllocationStrategy(id: number): Promise<boolean>;
  updateStockAllocationStrategy(id: number, strategy: Partial<InsertStockAllocationStrategy>): Promise<StockAllocationStrategy | undefined>;
  
  getTaskPlanningConfigurations(userId: number): Promise<TaskPlanningConfiguration[]>;
  getTaskPlanningConfigurationsByGroup(inventoryGroupId: number): Promise<TaskPlanningConfiguration[]>;
  saveTaskPlanningConfiguration(config: InsertTaskPlanningConfiguration): Promise<TaskPlanningConfiguration>;
  deleteTaskPlanningConfiguration(id: number): Promise<boolean>;
  updateTaskPlanningConfiguration(id: number, config: Partial<InsertTaskPlanningConfiguration>): Promise<TaskPlanningConfiguration | undefined>;
  
  getTaskExecutionConfigurations(userId: number): Promise<TaskExecutionConfiguration[]>;
  getTaskExecutionConfigurationsByPlanning(taskPlanningConfigurationId: number): Promise<TaskExecutionConfiguration[]>;
  getTaskExecutionByPlanning(taskPlanningConfigurationId: number): Promise<TaskExecutionConfiguration | undefined>;
  saveTaskExecutionConfiguration(config: InsertTaskExecutionConfiguration): Promise<TaskExecutionConfiguration>;
  deleteTaskExecutionConfiguration(id: number): Promise<boolean>;
  updateTaskExecutionConfiguration(id: number, config: Partial<InsertTaskExecutionConfiguration>): Promise<TaskExecutionConfiguration | undefined>;
  
  // One-Click Templates
  getOneClickTemplates(): Promise<OneClickTemplate[]>;
  getOneClickTemplate(id: number): Promise<OneClickTemplate | undefined>;
  saveOneClickTemplate(template: InsertOneClickTemplate): Promise<OneClickTemplate>;
  applyTemplate(templateId: number, userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wizardConfigurations: Map<string, WizardConfiguration>;
  private taskSequenceConfigurations: Map<number, TaskSequenceConfiguration>;
  private pickStrategyConfigurations: Map<number, PickStrategyConfiguration>;
  private huFormationConfigurations: Map<number, HUFormationConfiguration>;
  private workOrderManagementConfigurations: Map<number, WorkOrderManagementConfiguration>;
  private inventoryGroups: Map<number, InventoryGroup>;
  private stockAllocationStrategies: Map<number, StockAllocationStrategy>;
  private taskPlanningConfigurations: Map<number, TaskPlanningConfiguration>;
  private taskExecutionConfigurations: Map<number, TaskExecutionConfiguration>;
  private oneClickTemplates: Map<number, OneClickTemplate>;
  private currentUserId: number;
  private currentWizardConfigId: number;
  private currentTaskSeqConfigId: number;
  private currentPickStrategyConfigId: number;
  private currentHUFormationConfigId: number;
  private currentWorkOrderManagementConfigId: number;
  private currentInventoryGroupId: number;
  private currentStockAllocationStrategyId: number;
  private currentTaskPlanningConfigId: number;
  private currentTaskExecutionConfigId: number;
  private currentTemplateId: number;

  constructor() {
    this.users = new Map();
    this.wizardConfigurations = new Map();
    this.taskSequenceConfigurations = new Map();
    this.pickStrategyConfigurations = new Map();
    this.huFormationConfigurations = new Map();
    this.workOrderManagementConfigurations = new Map();
    this.inventoryGroups = new Map();
    this.stockAllocationStrategies = new Map();
    this.taskPlanningConfigurations = new Map();
    this.taskExecutionConfigurations = new Map();
    this.oneClickTemplates = new Map();
    this.currentUserId = 1;
    this.currentWizardConfigId = 1;
    this.currentTaskSeqConfigId = 1;
    this.currentPickStrategyConfigId = 1;
    this.currentHUFormationConfigId = 1;
    this.currentWorkOrderManagementConfigId = 1;
    this.currentInventoryGroupId = 1;
    this.currentStockAllocationStrategyId = 1;
    this.currentTaskPlanningConfigId = 1;
    this.currentTaskExecutionConfigId = 1;
    this.currentTemplateId = 1;
    
    // Initialize Distribution Center Template
    this.initializeDistributionCenterTemplate();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWizardConfiguration(userId: number, step: number): Promise<WizardConfiguration | undefined> {
    const key = `${userId}-${step}`;
    return this.wizardConfigurations.get(key);
  }

  async saveWizardConfiguration(config: InsertWizardConfiguration): Promise<WizardConfiguration> {
    const key = `${config.userId}-${config.step}`;
    const existing = this.wizardConfigurations.get(key);
    
    if (existing) {
      const updated: WizardConfiguration = { ...existing, ...config, isComplete: config.isComplete ?? null };
      this.wizardConfigurations.set(key, updated);
      return updated;
    } else {
      const id = this.currentWizardConfigId++;
      const newConfig: WizardConfiguration = { id, ...config, isComplete: config.isComplete ?? null };
      this.wizardConfigurations.set(key, newConfig);
      return newConfig;
    }
  }

  async getAllWizardConfigurations(userId: number): Promise<WizardConfiguration[]> {
    return Array.from(this.wizardConfigurations.values()).filter(
      config => config.userId === userId
    );
  }

  async getTaskSequenceConfigurations(userId: number): Promise<TaskSequenceConfiguration[]> {
    return Array.from(this.taskSequenceConfigurations.values()).filter(
      config => config.userId === userId
    );
  }

  async saveTaskSequenceConfiguration(config: InsertTaskSequenceConfiguration): Promise<TaskSequenceConfiguration> {
    const id = this.currentTaskSeqConfigId++;
    const newConfig: TaskSequenceConfiguration = { 
      id, 
      ...config, 
      taskSequences: config.taskSequences ?? null,
      shipmentAcknowledgment: config.shipmentAcknowledgment ?? null
    };
    this.taskSequenceConfigurations.set(id, newConfig);
    return newConfig;
  }

  async deleteTaskSequenceConfiguration(id: number): Promise<boolean> {
    return this.taskSequenceConfigurations.delete(id);
  }

  async updateTaskSequenceConfiguration(id: number, config: Partial<InsertTaskSequenceConfiguration>): Promise<TaskSequenceConfiguration | undefined> {
    const existing = this.taskSequenceConfigurations.get(id);
    if (existing) {
      const updated = { ...existing, ...config };
      this.taskSequenceConfigurations.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getPickStrategyConfigurations(userId: number): Promise<PickStrategyConfiguration[]> {
    return Array.from(this.pickStrategyConfigurations.values()).filter(
      config => config.userId === userId
    );
  }

  async savePickStrategyConfiguration(config: InsertPickStrategyConfiguration): Promise<PickStrategyConfiguration> {
    const id = this.currentPickStrategyConfigId++;
    const newConfig: PickStrategyConfiguration = { 
      id, 
      ...config,
      taskAttrs: config.taskAttrs || {},
      groupBy: config.groupBy || []
    };
    this.pickStrategyConfigurations.set(id, newConfig);
    return newConfig;
  }

  async deletePickStrategyConfiguration(id: number): Promise<boolean> {
    return this.pickStrategyConfigurations.delete(id);
  }

  async updatePickStrategyConfiguration(id: number, config: Partial<InsertPickStrategyConfiguration>): Promise<PickStrategyConfiguration | undefined> {
    const existing = this.pickStrategyConfigurations.get(id);
    if (existing) {
      const updated = { ...existing, ...config };
      this.pickStrategyConfigurations.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getHUFormationConfigurations(userId: number): Promise<HUFormationConfiguration[]> {
    return Array.from(this.huFormationConfigurations.values()).filter(
      config => config.userId === userId
    );
  }

  async getHUFormationByPickStrategy(pickStrategyId: number): Promise<HUFormationConfiguration | undefined> {
    return Array.from(this.huFormationConfigurations.values()).find(
      config => config.pickStrategyId === pickStrategyId
    );
  }

  async saveHUFormationConfiguration(config: InsertHUFormationConfiguration): Promise<HUFormationConfiguration> {
    const id = this.currentHUFormationConfigId++;
    const newConfig: HUFormationConfiguration = { 
      id, 
      ...config,
      huKinds: config.huKinds || [],
      dropHUQuantThreshold: config.dropHUQuantThreshold ?? 0,
      swapHUThreshold: config.swapHUThreshold ?? 0,
      huWeightThreshold: config.huWeightThreshold ?? 0,
      qcMismatchMonthThreshold: config.qcMismatchMonthThreshold ?? 0,
      allowComplete: config.allowComplete ?? true,
      dropInnerHU: config.dropInnerHU ?? true,
      allowInnerHUBreak: config.allowInnerHUBreak ?? true,
      displayDropUOM: config.displayDropUOM ?? true,
      autoUOMConversion: config.autoUOMConversion ?? true,
      mobileSorting: config.mobileSorting ?? true,
      quantSlottingForHUsInDrop: config.quantSlottingForHUsInDrop ?? true,
      allowPickingMultiBatchfromHU: config.allowPickingMultiBatchfromHU ?? true,
      displayEditPickQuantity: config.displayEditPickQuantity ?? true,
      pickBundles: config.pickBundles ?? true,
      enableEditQtyInPickOp: config.enableEditQtyInPickOp ?? true,
      enableManualDestBinSelection: config.enableManualDestBinSelection ?? true
    };
    this.huFormationConfigurations.set(id, newConfig);
    return newConfig;
  }

  async deleteHUFormationConfiguration(id: number): Promise<boolean> {
    return this.huFormationConfigurations.delete(id);
  }

  async updateHUFormationConfiguration(id: number, config: Partial<InsertHUFormationConfiguration>): Promise<HUFormationConfiguration | undefined> {
    const existing = this.huFormationConfigurations.get(id);
    if (existing) {
      const updated = { ...existing, ...config };
      this.huFormationConfigurations.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getWorkOrderManagementConfigurations(userId: number): Promise<WorkOrderManagementConfiguration[]> {
    return Array.from(this.workOrderManagementConfigurations.values()).filter(
      config => config.userId === userId
    );
  }

  async getWorkOrderManagementByPickStrategy(pickStrategyId: number): Promise<WorkOrderManagementConfiguration | undefined> {
    return Array.from(this.workOrderManagementConfigurations.values()).find(
      config => config.pickStrategyId === pickStrategyId
    );
  }

  async saveWorkOrderManagementConfiguration(config: InsertWorkOrderManagementConfiguration): Promise<WorkOrderManagementConfiguration> {
    const id = this.currentWorkOrderManagementConfigId++;
    const newConfig: WorkOrderManagementConfiguration = { 
      id, 
      ...config,
      loadingUnits: config.loadingUnits || [],
      mapSegregationGroupsToBins: config.mapSegregationGroupsToBins ?? true,
      dropHUInBin: config.dropHUInBin ?? true,
      scanDestHUInDrop: config.scanDestHUInDrop ?? true,
      allowHUBreakInDrop: config.allowHUBreakInDrop ?? true,
      strictBatchAdherence: config.strictBatchAdherence ?? true,
      allowWorkOrderSplit: config.allowWorkOrderSplit ?? true,
      undoOp: config.undoOp ?? true,
      disableWorkOrder: config.disableWorkOrder ?? false,
      allowUnpick: config.allowUnpick ?? true,
      supportPalletScan: config.supportPalletScan ?? true,
      pickMandatoryScan: config.pickMandatoryScan ?? true,
      dropMandatoryScan: config.dropMandatoryScan ?? true
    };
    this.workOrderManagementConfigurations.set(id, newConfig);
    return newConfig;
  }

  async deleteWorkOrderManagementConfiguration(id: number): Promise<boolean> {
    return this.workOrderManagementConfigurations.delete(id);
  }

  async updateWorkOrderManagementConfiguration(id: number, config: Partial<InsertWorkOrderManagementConfiguration>): Promise<WorkOrderManagementConfiguration | undefined> {
    const existing = this.workOrderManagementConfigurations.get(id);
    if (existing) {
      const updated = { ...existing, ...config };
      this.workOrderManagementConfigurations.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getInventoryGroups(userId: number): Promise<InventoryGroup[]> {
    return Array.from(this.inventoryGroups.values()).filter(
      group => group.userId === userId
    );
  }

  async saveInventoryGroup(group: InsertInventoryGroup): Promise<InventoryGroup> {
    const id = this.currentInventoryGroupId++;
    const newGroup: InventoryGroup = { 
      id, 
      userId: group.userId,
      name: group.name,
      storageIdentifiers: group.storageIdentifiers,
      lineIdentifiers: group.lineIdentifiers,
      description: group.description || null
    };
    this.inventoryGroups.set(id, newGroup);

    // Automatically create PICK and PUT strategies for this group
    await this.createDefaultStrategiesForGroup(newGroup);
    
    return newGroup;
  }

  private async createDefaultStrategiesForGroup(group: InventoryGroup): Promise<void> {
    const pickStrategy: InsertStockAllocationStrategy = {
      userId: group.userId,
      inventoryGroupId: group.id,
      mode: "PICK",
      priority: 100,
      skipZoneFace: null,
      orderByQuantUpdatedAt: false,
      searchScope: "AREA",
      preferFixed: true,
      preferNonFixed: false,
      statePreferenceSeq: ["PURE", "IMPURE", "EMPTY", "SKU_EMPTY"],
      batchPreferenceMode: "NONE",
      orderByPickingPosition: false,
      useInventorySnapshotForPickSlotting: false,
      optimizationMode: "TOUCH"
    };

    const putStrategy: InsertStockAllocationStrategy = {
      userId: group.userId,
      inventoryGroupId: group.id,
      mode: "PUT",
      priority: 100,
      skipZoneFace: null,
      orderByQuantUpdatedAt: false,
      searchScope: "AREA",
      preferFixed: true,
      preferNonFixed: false,
      statePreferenceSeq: ["PURE", "IMPURE", "EMPTY", "SKU_EMPTY"],
      batchPreferenceMode: "NONE",
      orderByPickingPosition: false,
      useInventorySnapshotForPickSlotting: false,
      optimizationMode: "TOUCH"
    };

    await this.saveStockAllocationStrategy(pickStrategy);
    await this.saveStockAllocationStrategy(putStrategy);
  }

  async deleteInventoryGroup(id: number): Promise<boolean> {
    // Delete associated stock allocation strategies first
    const strategies = Array.from(this.stockAllocationStrategies.values()).filter(
      strategy => strategy.inventoryGroupId === id
    );
    for (const strategy of strategies) {
      this.stockAllocationStrategies.delete(strategy.id);
    }
    
    return this.inventoryGroups.delete(id);
  }

  async updateInventoryGroup(id: number, group: Partial<InsertInventoryGroup>): Promise<InventoryGroup | undefined> {
    const existing = this.inventoryGroups.get(id);
    if (existing) {
      const updated: InventoryGroup = { 
        ...existing, 
        userId: group.userId ?? existing.userId,
        name: group.name ?? existing.name,
        storageIdentifiers: group.storageIdentifiers ?? existing.storageIdentifiers,
        lineIdentifiers: group.lineIdentifiers ?? existing.lineIdentifiers,
        description: group.description !== undefined ? group.description || null : existing.description
      };
      this.inventoryGroups.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getStockAllocationStrategies(userId: number): Promise<StockAllocationStrategy[]> {
    return Array.from(this.stockAllocationStrategies.values()).filter(
      strategy => strategy.userId === userId
    );
  }

  async getStockAllocationStrategiesByGroup(inventoryGroupId: number): Promise<StockAllocationStrategy[]> {
    return Array.from(this.stockAllocationStrategies.values()).filter(
      strategy => strategy.inventoryGroupId === inventoryGroupId
    );
  }

  async saveStockAllocationStrategy(strategy: InsertStockAllocationStrategy): Promise<StockAllocationStrategy> {
    const id = this.currentStockAllocationStrategyId++;
    const newStrategy: StockAllocationStrategy = { 
      id, 
      ...strategy,
      statePreferenceSeq: strategy.statePreferenceSeq || ["PURE", "IMPURE", "EMPTY", "SKU_EMPTY"],
      skipZoneFace: strategy.skipZoneFace ?? null,
      orderByQuantUpdatedAt: strategy.orderByQuantUpdatedAt ?? false,
      searchScope: strategy.searchScope || "AREA",
      preferFixed: strategy.preferFixed ?? true,
      preferNonFixed: strategy.preferNonFixed ?? false,
      batchPreferenceMode: strategy.batchPreferenceMode || "NONE",
      orderByPickingPosition: strategy.orderByPickingPosition ?? false,
      useInventorySnapshotForPickSlotting: strategy.useInventorySnapshotForPickSlotting ?? false,
      optimizationMode: strategy.optimizationMode || "TOUCH",
      priority: strategy.priority ?? 100
    };
    this.stockAllocationStrategies.set(id, newStrategy);
    return newStrategy;
  }

  async deleteStockAllocationStrategy(id: number): Promise<boolean> {
    return this.stockAllocationStrategies.delete(id);
  }

  async updateStockAllocationStrategy(id: number, strategy: Partial<InsertStockAllocationStrategy>): Promise<StockAllocationStrategy | undefined> {
    const existing = this.stockAllocationStrategies.get(id);
    if (existing) {
      const updated = { ...existing, ...strategy };
      this.stockAllocationStrategies.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Task Planning Configuration methods
  async getTaskPlanningConfigurations(userId: number): Promise<TaskPlanningConfiguration[]> {
    return Array.from(this.taskPlanningConfigurations.values())
      .filter(config => config.userId === userId);
  }

  async getTaskPlanningConfigurationsByGroup(inventoryGroupId: number): Promise<TaskPlanningConfiguration[]> {
    return Array.from(this.taskPlanningConfigurations.values())
      .filter(config => config.inventoryGroupId === inventoryGroupId);
  }

  async saveTaskPlanningConfiguration(config: InsertTaskPlanningConfiguration): Promise<TaskPlanningConfiguration> {
    const id = this.currentTaskPlanningConfigId++;
    const newConfig: TaskPlanningConfiguration = { 
      id,
      ...config,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.taskPlanningConfigurations.set(id, newConfig);
    return newConfig;
  }

  async deleteTaskPlanningConfiguration(id: number): Promise<boolean> {
    // Also delete associated task execution configurations
    const executionConfigs = Array.from(this.taskExecutionConfigurations.values())
      .filter(config => config.taskPlanningConfigurationId === id);
    executionConfigs.forEach(config => this.taskExecutionConfigurations.delete(config.id));
    
    return this.taskPlanningConfigurations.delete(id);
  }

  async updateTaskPlanningConfiguration(id: number, config: Partial<InsertTaskPlanningConfiguration>): Promise<TaskPlanningConfiguration | undefined> {
    const existing = this.taskPlanningConfigurations.get(id);
    if (!existing) {
      return undefined;
    }
      
    const updated: TaskPlanningConfiguration = { 
      ...existing,
      ...config,
      id,
      updatedAt: new Date()
    };
    this.taskPlanningConfigurations.set(id, updated);
    return updated;
  }

  // Task Execution Configuration methods
  async getTaskExecutionConfigurations(userId: number): Promise<TaskExecutionConfiguration[]> {
    return Array.from(this.taskExecutionConfigurations.values())
      .filter(config => config.userId === userId);
  }

  async getTaskExecutionConfigurationsByPlanning(taskPlanningConfigurationId: number): Promise<TaskExecutionConfiguration[]> {
    return Array.from(this.taskExecutionConfigurations.values())
      .filter(config => config.taskPlanningConfigurationId === taskPlanningConfigurationId);
  }

  async getTaskExecutionByPlanning(taskPlanningConfigurationId: number): Promise<TaskExecutionConfiguration | undefined> {
    return Array.from(this.taskExecutionConfigurations.values())
      .find(config => config.taskPlanningConfigurationId === taskPlanningConfigurationId);
  }

  async saveTaskExecutionConfiguration(config: InsertTaskExecutionConfiguration): Promise<TaskExecutionConfiguration> {
    const id = this.currentTaskExecutionConfigId++;
    const newConfig: TaskExecutionConfiguration = { 
      id,
      ...config,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.taskExecutionConfigurations.set(id, newConfig);
    return newConfig;
  }

  async deleteTaskExecutionConfiguration(id: number): Promise<boolean> {
    return this.taskExecutionConfigurations.delete(id);
  }

  async updateTaskExecutionConfiguration(id: number, config: Partial<InsertTaskExecutionConfiguration>): Promise<TaskExecutionConfiguration | undefined> {
    const existing = this.taskExecutionConfigurations.get(id);
    if (!existing) {
      return undefined;
    }
      
    const updated: TaskExecutionConfiguration = { 
      ...existing,
      ...config,
      id,
      updatedAt: new Date()
    };
    this.taskExecutionConfigurations.set(id, updated);
    return updated;
  }

  // One-Click Template Methods
  private initializeDistributionCenterTemplate(): void {
    const distributionCenterTemplate: OneClickTemplate = {
      id: 1,
      name: "Distribution Center",
      description: "High-volume distribution with batch picking and cross-docking capabilities",
      industry: "Distribution",
      complexity: "Advanced",
      isActive: true,
      templateData: {
        inventoryGroups: [
          {
            name: "L0 Items",
            storageIdentifiers: {
              uom: "L0"
            },
            lineIdentifiers: {},
            description: "Level 0 items with area-based picking"
          },
          {
            name: "L2 Items",
            storageIdentifiers: {
              uom: "L2"
            },
            lineIdentifiers: {},
            description: "Level 2 items with UOM-based picking"
          }
        ],
        taskSequence: {
          taskSequences: ["OUTBOUND_REPLEN", "OUTBOUND_PICK", "OUTBOUND_LOAD"],
          shipmentAcknowledgment: "SHIP_CONFIRM"
        },
        taskPlanning: {
          strategy: "PICK_BY_CUSTOMER",
          tripType: "LM",
          groupBy: ["area", "uom"],
          useDockdoorAssignment: true,
          allowWorkOrderSplit: true
        },
        taskExecution: {
          huConfigs: {
            scanSourceHUKind: "PALLET",
            pickSourceHUKind: "NONE",
            carrierHUKind: "PALLET"
          },
          scanSettings: {
            pickMandatoryScan: false,
            dropMandatoryScan: false
          },
          dropSettings: {
            dropHUInBin: true,
            allowHUBreakInDrop: false,
            dropInnerHU: false,
            allowInnerHUBreak: false
          },
          params: {
            replenishBundles: 1,
            allowComplete: false,
            autoUOMConversion: false,
            displayEditPickQuantity: false
          }
        }
      },
      createdAt: new Date()
    };

    this.oneClickTemplates.set(1, distributionCenterTemplate);
  }

  async getOneClickTemplates(): Promise<OneClickTemplate[]> {
    return Array.from(this.oneClickTemplates.values());
  }

  async getOneClickTemplate(id: number): Promise<OneClickTemplate | undefined> {
    return this.oneClickTemplates.get(id);
  }

  async saveOneClickTemplate(template: InsertOneClickTemplate): Promise<OneClickTemplate> {
    const id = this.currentTemplateId++;
    const newTemplate: OneClickTemplate = {
      id,
      ...template,
      createdAt: new Date()
    };
    this.oneClickTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async applyTemplate(templateId: number, userId: number): Promise<boolean> {
    const template = this.oneClickTemplates.get(templateId);
    if (!template) {
      return false;
    }

    const templateData = template.templateData as any;

    try {
      // Clear existing configurations for this user
      this.clearUserConfigurations(userId);

      // Apply inventory groups
      const inventoryGroupIds: number[] = [];
      for (const groupData of templateData.inventoryGroups) {
        const inventoryGroup = await this.saveInventoryGroup({
          userId,
          name: groupData.name,
          storageIdentifiers: groupData.storageIdentifiers,
          lineIdentifiers: groupData.lineIdentifiers,
          description: groupData.description
        });
        inventoryGroupIds.push(inventoryGroup.id);
      }

      // Apply task sequence for each inventory group
      for (const groupId of inventoryGroupIds) {
        await this.saveTaskSequenceConfiguration({
          userId,
          inventoryGroupId: groupId,
          taskSequences: templateData.taskSequence.taskSequences,
          shipmentAcknowledgment: templateData.taskSequence.shipmentAcknowledgment
        });
      }

      // Apply task planning configurations
      for (const groupId of inventoryGroupIds) {
        const taskPlanning = await this.saveTaskPlanningConfiguration({
          userId,
          inventoryGroupId: groupId,
          strategy: templateData.taskPlanning.strategy,
          tripType: templateData.taskPlanning.tripType,
          groupBy: templateData.taskPlanning.groupBy,
          useDockdoorAssignment: templateData.taskPlanning.useDockdoorAssignment,
          allowWorkOrderSplit: templateData.taskPlanning.allowWorkOrderSplit,
          taskExecutionConfig: templateData.taskExecution
        });

        // Apply task execution configuration
        await this.saveTaskExecutionConfiguration({
          userId,
          taskPlanningConfigurationId: taskPlanning.id,
          huConfigs: templateData.taskExecution.huConfigs,
          scanSettings: templateData.taskExecution.scanSettings,
          dropSettings: templateData.taskExecution.dropSettings,
          params: templateData.taskExecution.params
        });
      }

      return true;
    } catch (error) {
      console.error('Error applying template:', error);
      return false;
    }
  }

  private clearUserConfigurations(userId: number): void {
    // Clear all existing configurations for the user
    const groupsToDelete = Array.from(this.inventoryGroups.values())
      .filter(group => group.userId === userId)
      .map(group => group.id);
    
    groupsToDelete.forEach(id => {
      this.inventoryGroups.delete(id);
    });

    const taskSeqToDelete = Array.from(this.taskSequenceConfigurations.values())
      .filter(config => config.userId === userId)
      .map(config => config.id);
    
    taskSeqToDelete.forEach(id => {
      this.taskSequenceConfigurations.delete(id);
    });

    const taskPlanToDelete = Array.from(this.taskPlanningConfigurations.values())
      .filter(config => config.userId === userId)
      .map(config => config.id);
    
    taskPlanToDelete.forEach(id => {
      this.taskPlanningConfigurations.delete(id);
    });

    const taskExecToDelete = Array.from(this.taskExecutionConfigurations.values())
      .filter(config => config.userId === userId)
      .map(config => config.id);
    
    taskExecToDelete.forEach(id => {
      this.taskExecutionConfigurations.delete(id);
    });
  }
}

export const storage = new MemStorage();
