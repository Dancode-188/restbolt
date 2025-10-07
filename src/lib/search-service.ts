import { db, Collection, HistoryItem } from './db';
import { Request } from '@/types';

export interface SearchResult {
  id: string;
  type: 'collection' | 'history';
  request: Request | HistoryItem;
  collectionName?: string;
  collectionId?: string;
  matchedFields: string[]; // Which fields matched the search
}

class SearchService {
  async searchRequests(query: string): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search in collections
    const collections = await db.collections.toArray();
    
    for (const collection of collections) {
      for (const request of collection.requests) {
        const matchedFields: string[] = [];
        
        // Check name
        if (request.name.toLowerCase().includes(searchTerm)) {
          matchedFields.push('name');
        }
        
        // Check URL
        if (request.url.toLowerCase().includes(searchTerm)) {
          matchedFields.push('url');
        }
        
        // Check method
        if (request.method.toLowerCase().includes(searchTerm)) {
          matchedFields.push('method');
        }
        
        // Check headers
        const headersString = JSON.stringify(request.headers).toLowerCase();
        if (headersString.includes(searchTerm)) {
          matchedFields.push('headers');
        }
        
        // Check body
        if (request.body && request.body.toLowerCase().includes(searchTerm)) {
          matchedFields.push('body');
        }
        
        if (matchedFields.length > 0) {
          results.push({
            id: request.id,
            type: 'collection',
            request,
            collectionName: collection.name,
            collectionId: collection.id,
            matchedFields,
          });
        }
      }
    }

    // Search in history
    const history = await db.history.toArray();
    
    for (const item of history) {
      const matchedFields: string[] = [];
      
      // Check name
      if (item.name.toLowerCase().includes(searchTerm)) {
        matchedFields.push('name');
      }
      
      // Check URL
      if (item.url.toLowerCase().includes(searchTerm)) {
        matchedFields.push('url');
      }
      
      // Check method
      if (item.method.toLowerCase().includes(searchTerm)) {
        matchedFields.push('method');
      }
      
      // Check headers
      const headersString = JSON.stringify(item.headers).toLowerCase();
      if (headersString.includes(searchTerm)) {
        matchedFields.push('headers');
      }
      
      // Check body
      if (item.body && item.body.toLowerCase().includes(searchTerm)) {
        matchedFields.push('body');
      }
      
      if (matchedFields.length > 0) {
        results.push({
          id: item.id,
          type: 'history',
          request: item,
          matchedFields,
        });
      }
    }

    // Sort by relevance (more matched fields = more relevant)
    return results.sort((a, b) => b.matchedFields.length - a.matchedFields.length);
  }

  async searchByMethod(method: string): Promise<SearchResult[]> {
    return this.searchRequests(method);
  }

  async searchByUrl(url: string): Promise<SearchResult[]> {
    return this.searchRequests(url);
  }
}

export const searchService = new SearchService();
