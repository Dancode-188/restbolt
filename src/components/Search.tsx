'use client';

import { useState, useEffect } from 'react';
import { searchService, SearchResult } from '@/lib/search-service';

interface SearchProps {
  onSelectResult: (result: SearchResult) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-600 dark:text-green-400',
  POST: 'text-blue-600 dark:text-blue-400',
  PUT: 'text-yellow-600 dark:text-yellow-400',
  DELETE: 'text-red-600 dark:text-red-400',
  PATCH: 'text-purple-600 dark:text-purple-400',
  HEAD: 'text-gray-600 dark:text-gray-400',
  OPTIONS: 'text-gray-600 dark:text-gray-400',
};

export default function Search({ onSelectResult }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'collection' | 'history'>('all');

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchService.searchRequests(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const filteredResults = results.filter(result => {
    if (selectedFilter === 'all') return true;
    return result.type === selectedFilter;
  });

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      <div className="p-4 flex-shrink-0 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Search
        </h2>
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search requests..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All ({results.length})
          </button>
          <button
            onClick={() => setSelectedFilter('collection')}
            className={`px-3 py-1.5 rounded transition-colors ${
              selectedFilter === 'collection'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Collections ({results.filter(r => r.type === 'collection').length})
          </button>
          <button
            onClick={() => setSelectedFilter('history')}
            className={`px-3 py-1.5 rounded transition-colors ${
              selectedFilter === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            History ({results.filter(r => r.type === 'history').length})
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Searching...
          </div>
        )}

        {!loading && query && filteredResults.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No results found for &quot;{query}&quot;
          </div>
        )}

        {!loading && !query && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Start typing to search across all requests
          </div>
        )}

        {!loading && filteredResults.length > 0 && (
          <div className="space-y-1 p-2">
            {filteredResults.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => onSelectResult(result)}
                className="w-full p-3 text-left border border-gray-200 dark:border-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${METHOD_COLORS[result.request.method]}`}>
                        {result.request.method}
                      </span>
                      {result.type === 'collection' && result.collectionName && (
                        <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                          {result.collectionName}
                        </span>
                      )}
                      {result.type === 'history' && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                          History
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                      {highlightText(result.request.name, query)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {highlightText(result.request.url, query)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Matched: {result.matchedFields.join(', ')}
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
