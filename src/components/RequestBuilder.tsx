'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { httpClient } from '@/lib/http-client';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;

export default function RequestBuilder() {
  const { setCurrentResponse } = useStore();
  const [method, setMethod] = useState<typeof HTTP_METHODS[number]>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      const result = await httpClient.sendRequest({
        method,
        url: url.trim(),
        headers: {},
        params: {},
      });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      const responseSize = new Blob([JSON.stringify(result.data)]).size;

      setCurrentResponse({
        status: result.status,
        statusText: result.statusText,
        headers: result.headers,
        data: result.data,
        time: responseTime,
        size: responseSize,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-950 p-4 overflow-auto flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Request Builder
      </h2>
      
      <div className="flex gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as typeof method)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-medium"
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSend();
            }
          }}
        />
        
        <button
          onClick={handleSend}
          disabled={loading || !url.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
        <p>💡 Tip: Press Enter to send request</p>
        <p className="mt-1">Try the default URL to test with JSONPlaceholder API</p>
      </div>
    </div>
  );
}
