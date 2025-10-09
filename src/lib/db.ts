import Dexie, { Table } from 'dexie';
import { Request, Collection, Environment, Response, Chain, ChainExecution } from '@/types';

export interface HistoryItem extends Request {
  timestamp: Date;
  response?: Response;
}

export class RestBoltDB extends Dexie {
  collections!: Table<Collection>;
  history!: Table<HistoryItem>;
  environments!: Table<Environment>;
  chains!: Table<Chain>;
  chainExecutions!: Table<ChainExecution>;

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

    // Version 3: Add chains and chain executions
    this.version(3).stores({
      collections: '++id, name, createdAt, updatedAt',
      history: '++id, timestamp, method, url',
      environments: '++id, name, isActive',
      chains: '++id, name, createdAt, updatedAt',
      chainExecutions: '++id, chainId, startedAt, status'
    });
  }
}

export const db = new RestBoltDB();
