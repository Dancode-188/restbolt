import Dexie, { Table } from 'dexie';
import { Request, Collection, Environment, Response } from '@/types';

export interface HistoryItem extends Request {
  timestamp: Date;
  response?: Response;
}

export class RestBoltDB extends Dexie {
  collections!: Table<Collection>;
  history!: Table<HistoryItem>;
  environments!: Table<Environment>;

  constructor() {
    super('RestBoltDB');
    
    // Version 1: Initial schema
    this.version(1).stores({
      collections: '++id, name, createdAt, updatedAt',
      history: '++id, timestamp, method, url'
    });
    
    // Version 2: Add environments
    this.version(2).stores({
      collections: '++id, name, createdAt, updatedAt',
      history: '++id, timestamp, method, url',
      environments: '++id, name, isActive'
    });
  }
}

export const db = new RestBoltDB();
