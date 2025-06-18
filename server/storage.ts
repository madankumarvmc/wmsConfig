import { 
  users, 
  wizardConfigurations,
  taskSequenceConfigurations,
  pickStrategyConfigurations,
  type User, 
  type InsertUser,
  type WizardConfiguration,
  type InsertWizardConfiguration,
  type TaskSequenceConfiguration,
  type InsertTaskSequenceConfiguration,
  type PickStrategyConfiguration,
  type InsertPickStrategyConfiguration
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wizardConfigurations: Map<string, WizardConfiguration>;
  private taskSequenceConfigurations: Map<number, TaskSequenceConfiguration>;
  private pickStrategyConfigurations: Map<number, PickStrategyConfiguration>;
  private currentUserId: number;
  private currentWizardConfigId: number;
  private currentTaskSeqConfigId: number;
  private currentPickStrategyConfigId: number;

  constructor() {
    this.users = new Map();
    this.wizardConfigurations = new Map();
    this.taskSequenceConfigurations = new Map();
    this.pickStrategyConfigurations = new Map();
    this.currentUserId = 1;
    this.currentWizardConfigId = 1;
    this.currentTaskSeqConfigId = 1;
    this.currentPickStrategyConfigId = 1;
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
    const newConfig: PickStrategyConfiguration = { id, ...config };
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
}

export const storage = new MemStorage();
