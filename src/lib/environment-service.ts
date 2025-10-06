import { db } from './db';
import { Environment } from '@/types';

export const environmentService = {
  async createEnvironment(name: string, variables: Record<string, string> = {}): Promise<string> {
    const id = crypto.randomUUID();
    
    // Check if this is the first environment
    const count = await db.environments.count();
    const isActive = count === 0; // First environment is active by default
    
    await db.environments.add({
      id,
      name,
      variables,
      isActive,
    });
    
    return id;
  },

  async updateEnvironment(id: string, updates: Partial<Environment>) {
    await db.environments.update(id, updates);
  },

  async deleteEnvironment(id: string) {
    const env = await db.environments.get(id);
    if (!env) return;
    
    // If deleting active environment, activate another one
    if (env.isActive) {
      const allEnvs = await db.environments.toArray();
      const otherEnv = allEnvs.find(e => e.id !== id);
      if (otherEnv) {
        await db.environments.update(otherEnv.id, { isActive: true });
      }
    }
    
    await db.environments.delete(id);
  },

  async setActiveEnvironment(id: string) {
    // Deactivate all environments
    const allEnvs = await db.environments.toArray();
    for (const env of allEnvs) {
      await db.environments.update(env.id, { isActive: false });
    }
    
    // Activate the selected one
    await db.environments.update(id, { isActive: true });
  },

  async getActiveEnvironment(): Promise<Environment | undefined> {
    return await db.environments.filter(env => env.isActive).first();
  },

  async getAllEnvironments(): Promise<Environment[]> {
    return await db.environments.toArray();
  },

  replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    
    // Replace {{variableName}} with actual values
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    });
    
    return result;
  },

  extractVariables(text: string): string[] {
    const regex = /{{\\s*([^}]+)\\s*}}/g;
    const matches: string[] = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    
    return [...new Set(matches)]; // Remove duplicates
  },
};
