'use client';

import { useState } from 'react';
import History from './History';
import Collections from './Collections';
import { HistoryItem } from '@/lib/db';
import { Request } from '@/types';

interface SidebarProps {
  onSelectHistoryItem: (item: HistoryItem) => void;
  onSelectRequest: (request: Request) => void;
}

export default function Sidebar({ onSelectHistoryItem, onSelectRequest }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'collections'>('history');

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'collections'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Collections
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'history' && <History onSelectRequest={onSelectHistoryItem} />}
        {activeTab === 'collections' && <Collections onSelectRequest={onSelectRequest} />}
      </div>
    </div>
  );
}
