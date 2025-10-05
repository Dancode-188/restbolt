'use client';

import { useStore } from '@/lib/store';
import Editor from '@monaco-editor/react';

export default function ResponseViewer() {
  const { currentResponse, theme } = useStore();

  if (!currentResponse) {
    return (
      <div className="h-full bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg 
            className="w-16 h-16 mx-auto mb-4 opacity-50" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <p className="text-sm">No response yet</p>
          <p className="text-xs mt-2">Send a request to see the response</p>
        </div>
      </div>
    );
  }

  // Format response data for display
  const getFormattedData = () => {
    try {
      if (typeof currentResponse.data === 'object') {
        return JSON.stringify(currentResponse.data, null, 2);
      }
      return String(currentResponse.data);
    } catch (e) {
      return String(currentResponse.data);
    }
  };

  // Determine language for Monaco based on content type
  const getLanguage = () => {
    const contentType = currentResponse.headers['content-type'] || '';
    if (contentType.includes('json')) return 'json';
    if (contentType.includes('xml')) return 'xml';
    if (contentType.includes('html')) return 'html';
    return 'plaintext';
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400';
    if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="h-full bg-white dark:bg-gray-950 flex flex-col">
      {/* Response metadata header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`text-sm font-semibold ${getStatusColor(currentResponse.status)}`}>
              {currentResponse.status} {currentResponse.statusText}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentResponse.time}ms
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {(currentResponse.size / 1024).toFixed(2)} KB
            </span>
          </div>
        </div>
      </div>

      {/* Response body */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={getLanguage()}
          value={getFormattedData()}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
