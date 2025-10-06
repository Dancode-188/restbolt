import Dexie, { Table } from 'dexie';
import { Request, Collection } from '@/types';

export interface HistoryItem extends Request {
  timestamp: Date;
}

export class RestBoltDB extends Dexie {
  collections!: Table<Collection>;
  history!: Table<HistoryItem>;

  constructor() {
    super('RestBoltDB');
    
    this.version(1).stores({
      collections: '++id, name, createdAt, updatedAt',
      history: '++id, timestamp, method, url'
    });
  }
}

export const db = new RestBoltDB();
