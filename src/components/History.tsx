'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, HistoryItem } from '@/lib/db';

interface HistoryProps {
  onSelectRequest: (request: HistoryItem) => void;
}

export default function History({ onSelectRequest }: HistoryProps) {
  const historyItems = useLiveQuery(() => 
    db.history.orderBy('timestamp').reverse().limit(50).toArray()
  );

  if (!historyItems || historyItems.length === 0) {
    return (
      <div className="p-4 text-xs text-gray-500 dark:text-gray-400">
        No history yet. Send a request to see it here.
      </div>
    );
  }

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          History
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Recent requests
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        {historyItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectRequest(item)}
            className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-left transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold ${getMethodColor(item.method)}`}>
                {item.method}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(item.timestamp)}
              </span>
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
              {item.url}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
