import { db, HistoryItem } from './db';
import { Request } from '@/types';

export const historyService = {
  async addToHistory(request: Request, response: { status: number; statusText: string }) {
    const historyItem: HistoryItem = {
      ...request,
      timestamp: new Date(),
    };
    
    await db.history.add(historyItem);
    
    // Keep only last 50 items
    const count = await db.history.count();
    if (count > 50) {
      const oldestItems = await db.history.orderBy('timestamp').limit(count - 50).toArray();
      const idsToDelete = oldestItems.map(item => item.id);
      await db.history.bulkDelete(idsToDelete as string[]);
    }
  },

  async getHistory(limit: number = 50): Promise<HistoryItem[]> {
    return await db.history
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  },

  async clearHistory() {
    await db.history.clear();
  },

  async deleteHistoryItem(id: string) {
    await db.history.delete(id);
  }
};
