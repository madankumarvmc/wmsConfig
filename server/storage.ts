import { 
  users, 
  wizardConfigurations,
  taskSequenceConfigurations,
  type User, 
  type InsertUser,
  type WizardConfiguration,
  type InsertWizardConfiguration,
  type TaskSequenceConfiguration,
  type InsertTaskSequenceConfiguration
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wizardConfigurations: Map<string, WizardConfiguration>;
  private taskSequenceConfigurations: Map<number, TaskSequenceConfiguration>;
  private currentUserId: number;
  private currentWizardConfigId: number;
  private currentTaskSeqConfigId: number;

  constructor() {
    this.users = new Map();
    this.wizardConfigurations = new Map();
    this.taskSequenceConfigurations = new Map();
    this.currentUserId = 1;
    this.currentWizardConfigId = 1;
    this.currentTaskSeqConfigId = 1;
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
}

export const storage = new MemStorage();
