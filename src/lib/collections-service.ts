import { db } from './db';
import { Request, Collection } from '@/types';

export const collectionsService = {
  async createCollection(name: string): Promise<string> {
    const id = crypto.randomUUID();
    await db.collections.add({
      id,
      name,
      requests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return id;
  },

  async addRequestToCollection(collectionId: string, request: Request) {
    const collection = await db.collections.get(collectionId);
    if (!collection) throw new Error('Collection not found');

    // Add request with a unique ID if it doesn't have one
    const requestToAdd = {
      ...request,
      id: request.id || crypto.randomUUID(),
    };

    collection.requests.push(requestToAdd);
    collection.updatedAt = new Date();
    
    await db.collections.update(collectionId, collection);
  },

  async removeRequestFromCollection(collectionId: string, requestId: string) {
    const collection = await db.collections.get(collectionId);
    if (!collection) throw new Error('Collection not found');

    collection.requests = collection.requests.filter(r => r.id !== requestId);
    collection.updatedAt = new Date();
    
    await db.collections.update(collectionId, collection);
  },

  async updateCollection(collectionId: string, updates: Partial<Collection>) {
    await db.collections.update(collectionId, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async deleteCollection(collectionId: string) {
    await db.collections.delete(collectionId);
  },

  async getAllCollections(): Promise<Collection[]> {
    return await db.collections.toArray();
  },
};
