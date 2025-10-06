'use client';

import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Request } from '@/types';
import { exportService } from '@/lib/export-service';

interface CollectionsProps {
  onSelectRequest: (request: Request) => void;
}

export default function Collections({ onSelectRequest }: CollectionsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportAll = async () => {
    const json = await exportService.exportCollections();
    const filename = `restbolt-export-${new Date().toISOString().split('T')[0]}.json`;
    exportService.downloadFile(json, filename);
  };

  const handleExportCollection = async (collectionId: string, collectionName: string) => {
    const json = await exportService.exportCollection(collectionId);
    const filename = `${collectionName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    exportService.downloadFile(json, filename);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await exportService.importData(text);
      
      setImportMessage({
        type: 'success',
        text: `Imported ${result.collections} collection(s)${result.history > 0 ? ` and ${result.history} history item(s)` : ''}`,
      });
      
      setTimeout(() => setImportMessage(null), 5000);
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to import file',
      });
      
      setTimeout(() => setImportMessage(null), 5000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Import collections"
            >
              Import
            </button>
            {collections && collections.length > 0 && (
              <button
                onClick={handleExportAll}
                className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                title="Export all collections"
              >
                Export All
              </button>
            )}
            <button
              onClick={() => setIsCreating(true)}
              className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              + New
            </button>
          </div>
        </div>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {/* Import message */}
        {importMessage && (
          <div className={`mt-2 p-2 rounded text-xs ${
            importMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            {importMessage.text}
          </div>
        )}

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
                <div className="flex gap-1">
                  <button
                    onClick={() => handleExportCollection(collection.id, collection.name)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Export collection"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteCollection(collection.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete collection"
                  >
                    ×
                  </button>
                </div>
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
