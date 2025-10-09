'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import Editor from '@monaco-editor/react';
import DiffViewer from './DiffViewer';
import ComparisonSelector from './ComparisonSelector';
import VariableExtractor from './VariableExtractor';

export default function ResponseViewer() {
  const { currentResponse, theme, comparisonMode, setComparisonMode, mergeChainVariables } = useStore();
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'variables'>('body');
  const [showHeaders, setShowHeaders] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showComparisonSelector, setShowComparisonSelector] = useState(false);

  const handleVariablesExtracted = (variables: Record<string, any>) => {
    mergeChainVariables(variables);
  };

  // Show DiffViewer if in comparison mode
  if (comparisonMode) {
    return <DiffViewer />;
  }

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFormattedData());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const data = getFormattedData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComparisonSelector(true)}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Compare
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center gap-1.5"
            >
              {copySuccess ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center px-4">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'body'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Body
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'headers'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Headers
          </button>
          <button
            onClick={() => setActiveTab('variables')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'variables'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Variables
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'body' && (
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
        )}

        {activeTab === 'headers' && (
          <div className="h-full overflow-auto p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Response Headers</h3>
            <div className="space-y-2">
              {Object.entries(currentResponse.headers).map(([key, value]) => (
                <div key={key} className="flex text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[200px]">{key}:</span>
                  <span className="text-gray-900 dark:text-gray-100 break-all">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'variables' && (
          <VariableExtractor
            response={currentResponse}
            onExtract={handleVariablesExtracted}
          />
        )}
      </div>

      {/* Comparison Selector Modal */}
      <ComparisonSelector
        isOpen={showComparisonSelector}
        onClose={() => setShowComparisonSelector(false)}
        onSelect={(response) => {
          setComparisonMode(true, response);
        }}
      />
    </div>
  );
}
