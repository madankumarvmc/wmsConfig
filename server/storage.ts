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
  type InsertWorkOrderManagementConfiguration
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wizardConfigurations: Map<string, WizardConfiguration>;
  private taskSequenceConfigurations: Map<number, TaskSequenceConfiguration>;
  private pickStrategyConfigurations: Map<number, PickStrategyConfiguration>;
  private huFormationConfigurations: Map<number, HUFormationConfiguration>;
  private workOrderManagementConfigurations: Map<number, WorkOrderManagementConfiguration>;
  private currentUserId: number;
  private currentWizardConfigId: number;
  private currentTaskSeqConfigId: number;
  private currentPickStrategyConfigId: number;
  private currentHUFormationConfigId: number;
  private currentWorkOrderManagementConfigId: number;

  constructor() {
    this.users = new Map();
    this.wizardConfigurations = new Map();
    this.taskSequenceConfigurations = new Map();
    this.pickStrategyConfigurations = new Map();
    this.huFormationConfigurations = new Map();
    this.workOrderManagementConfigurations = new Map();
    this.currentUserId = 1;
    this.currentWizardConfigId = 1;
    this.currentTaskSeqConfigId = 1;
    this.currentPickStrategyConfigId = 1;
    this.currentHUFormationConfigId = 1;
    this.currentWorkOrderManagementConfigId = 1;
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
      const updated: WizardConfiguration = { ...existing, ...config };
      this.wizardConfigurations.set(key, updated);
      return updated;
    } else {
      const id = this.currentWizardConfigId++;
      const newConfig: WizardConfiguration = { id, ...config };
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
    const newConfig: TaskSequenceConfiguration = { id, ...config };
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
}

export const storage = new MemStorage();
