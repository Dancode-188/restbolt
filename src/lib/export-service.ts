import { db } from './db';
import { Collection } from '@/types';

export const exportService = {
  async exportCollections(): Promise<string> {
    const collections = await db.collections.toArray();
    const history = await db.history.toArray();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      collections,
      history,
    };
    
    return JSON.stringify(exportData, null, 2);
  },

  async exportCollection(collectionId: string): Promise<string> {
    const collection = await db.collections.get(collectionId);
    if (!collection) throw new Error('Collection not found');
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      collection,
    };
    
    return JSON.stringify(exportData, null, 2);
  },

  async importData(jsonString: string): Promise<{ collections: number; history: number }> {
    try {
      const data = JSON.parse(jsonString);
      
      let collectionsImported = 0;
      let historyImported = 0;
      
      // Import collections
      if (data.collections && Array.isArray(data.collections)) {
        for (const collection of data.collections) {
          // Generate new ID to avoid conflicts
          const newCollection = {
            ...collection,
            id: crypto.randomUUID(),
            createdAt: new Date(collection.createdAt),
            updatedAt: new Date(collection.updatedAt),
          };
          await db.collections.add(newCollection);
          collectionsImported++;
        }
      }
      
      // Import single collection
      if (data.collection) {
        const newCollection = {
          ...data.collection,
          id: crypto.randomUUID(),
          createdAt: new Date(data.collection.createdAt),
          updatedAt: new Date(data.collection.updatedAt),
        };
        await db.collections.add(newCollection);
        collectionsImported++;
      }
      
      // Import history (optional)
      if (data.history && Array.isArray(data.history)) {
        for (const item of data.history) {
          const newItem = {
            ...item,
            id: crypto.randomUUID(),
            timestamp: new Date(item.timestamp),
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          };
          await db.history.add(newItem);
          historyImported++;
        }
      }
      
      return { collections: collectionsImported, history: historyImported };
    } catch (error) {
      throw new Error('Invalid import file format');
    }
  },

  downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
