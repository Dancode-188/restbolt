'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Request } from '@/types';

interface CollectionsProps {
  onSelectRequest: (request: Request) => void;
}

export default function Collections({ onSelectRequest }: CollectionsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const collections = useLiveQuery(() => db.collections.toArray());

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    await db.collections.add({
      id: crypto.randomUUID(),
      name: newCollectionName.trim(),
      requests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setNewCollectionName('');
    setIsCreating(false);
  };

  const deleteCollection = async (id: string) => {
    if (confirm('Delete this collection?')) {
      await db.collections.delete(id);
    }
  };

  const toggleCollection = (id: string) => {
    const updated = new Set(expandedCollections);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setExpandedCollections(updated);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-600 dark:text-green-400';
      case 'POST': return 'text-blue-600 dark:text-blue-400';
      case 'PUT': return 'text-yellow-600 dark:text-yellow-400';
      case 'DELETE': return 'text-red-600 dark:text-red-400';
      case 'PATCH': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!collections) {
    return <div className="p-4 text-xs text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Collections
          </h3>
          <button
            onClick={() => setIsCreating(true)}
            className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          >
            + New
          </button>
        </div>

        {isCreating && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createCollection();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewCollectionName('');
                }
              }}
              autoFocus
            />
            <button
              onClick={createCollection}
              className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewCollectionName('');
              }}
              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {collections.length === 0 ? (
          <div className="p-4 text-xs text-gray-500 dark:text-gray-400">
            No collections yet. Create one to organize your requests.
          </div>
        ) : (
          collections.map((collection) => (
            <div key={collection.id} className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <button
                  onClick={() => toggleCollection(collection.id)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {expandedCollections.has(collection.id) ? '▼' : '▶'}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {collection.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({collection.requests.length})
                  </span>
                </button>
                <button
                  onClick={() => deleteCollection(collection.id)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete collection"
                >
                  ×
                </button>
              </div>

              {expandedCollections.has(collection.id) && (
                <div className="bg-gray-50 dark:bg-gray-900">
                  {collection.requests.length === 0 ? (
                    <div className="p-3 text-xs text-gray-500 dark:text-gray-400">
                      No requests in this collection
                    </div>
                  ) : (
                    collection.requests.map((request, index) => (
                      <button
                        key={index}
                        onClick={() => onSelectRequest(request)}
                        className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-t border-gray-200 dark:border-gray-800 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold ${getMethodColor(request.method)}`}>
                            {request.method}
                          </span>
                          <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                            {request.name || request.url}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {request.url}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
