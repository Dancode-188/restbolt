'use client';

import { useState } from 'react';
import History from './History';
import Collections from './Collections';
import Environments from './Environments';
import Search from './Search';
import ChainManager from './ChainManager';
import { HistoryItem } from '@/lib/db';
import { Request } from '@/types';
import { SearchResult } from '@/lib/search-service';

interface SidebarProps {
  onSelectHistoryItem: (item: HistoryItem) => void;
  onSelectRequest: (request: Request) => void;
}

export default function Sidebar({ onSelectHistoryItem, onSelectRequest }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'collections' | 'environments' | 'chains'>('history');

  const handleSearchResult = (result: SearchResult) => {
    if (result.type === 'history') {
      onSelectHistoryItem(result.request as HistoryItem);
    } else {
      onSelectRequest(result.request);
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Search
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${
            activeTab === 'collections'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Collections
        </button>
        <button
          onClick={() => setActiveTab('environments')}
          className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${
            activeTab === 'environments'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Environments
        </button>
        <button
          onClick={() => setActiveTab('chains')}
          className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${
            activeTab === 'chains'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Chains
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'search' && <Search onSelectResult={handleSearchResult} />}
        {activeTab === 'history' && <History onSelectRequest={onSelectHistoryItem} />}
        {activeTab === 'collections' && <Collections onSelectRequest={onSelectRequest} />}
        {activeTab === 'environments' && <Environments />}
        {activeTab === 'chains' && <ChainManager />}
      </div>
    </div>
  );
}
