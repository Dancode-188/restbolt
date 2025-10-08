'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { httpClient } from '@/lib/http-client';
import { historyService } from '@/lib/history-service';
import { collectionsService } from '@/lib/collections-service';
import { environmentService } from '@/lib/environment-service';
import { HistoryItem } from '@/lib/db';
import { Request } from '@/types';
import Editor from '@monaco-editor/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import CodeGenerationModal from './CodeGenerationModal';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;
const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

const COMMON_HEADERS = [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Authorization', value: 'Bearer ' },
  { key: 'Accept', value: 'application/json' },
  { key: 'User-Agent', value: 'RestBolt/1.0' },
];

const DEFAULT_BODY = `{
  "title": "Example Todo",
  "completed": false
}`;

interface RequestBuilderProps {
  selectedHistoryItem: HistoryItem | null;
  selectedRequest: Request | null;
}

export default function RequestBuilder({ selectedHistoryItem, selectedRequest }: RequestBuilderProps) {
  const { setCurrentResponse, theme, tabs, activeTabId, updateTab } = useStore();
  const [method, setMethod] = useState<typeof HTTP_METHODS[number]>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts');
  const [headers, setHeaders] = useState<Header[]>([]);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAuthHelper, setShowAuthHelper] = useState(false);
  const [showCodeGen, setShowCodeGen] = useState(false);
  const [requestName, setRequestName] = useState('');
  
  const urlInputRef = useRef<HTMLInputElement>(null);
  const collections = useLiveQuery(() => db.collections.toArray());

  // Keyboard shortcuts
  useHotkeys('ctrl+enter, meta+enter', (e) => {
    e.preventDefault();
    handleSend();
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+k, meta+k', (e) => {
    e.preventDefault();
    urlInputRef.current?.focus();
    urlInputRef.current?.select();
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+h, meta+h', (e) => {
    e.preventDefault();
    setShowHeaders(prev => !prev);
  });

  useHotkeys('ctrl+/, meta+/', (e) => {
    e.preventDefault();
    if (hasBody) {
      setShowBody(prev => !prev);
    }
  });

  // Load active tab data
  useEffect(() => {
    if (activeTabId) {
      const activeTab = tabs.find(t => t.id === activeTabId);
      if (activeTab) {
        setMethod(activeTab.method as typeof HTTP_METHODS[number]);
        setUrl(activeTab.url);
        setHeaders(activeTab.headers);
        setBody(activeTab.body);
      }
    }
  }, [activeTabId, tabs]);

  // Sync tab state when form data changes
  useEffect(() => {
    if (activeTabId && !selectedHistoryItem && !selectedRequest) {
      const activeTab = tabs.find(t => t.id === activeTabId);
      // Only update if data actually changed
      if (activeTab && (
        activeTab.method !== method ||
        activeTab.url !== url ||
        JSON.stringify(activeTab.headers) !== JSON.stringify(headers) ||
        activeTab.body !== body
      )) {
        updateTab(activeTabId, {
          method,
          url,
          headers,
          body,
          name: url ? `${method} ${new URL(url).pathname}` : 'New Request',
        });
      }
    }
  }, [method, url, headers, body, activeTabId, tabs, selectedHistoryItem, selectedRequest, updateTab]);

  // Load history item into form when selected
  useEffect(() => {
    if (selectedHistoryItem) {
      setMethod(selectedHistoryItem.method);
      setUrl(selectedHistoryItem.url);
      
      // Convert headers object to array
      const headersArray = Object.entries(selectedHistoryItem.headers).map(([key, value]) => ({
        key,
        value,
        enabled: true,
      }));
      setHeaders(headersArray);
      
      if (selectedHistoryItem.body) {
        setBody(selectedHistoryItem.body);
      }
    }
  }, [selectedHistoryItem]);

  // Load request from collection when selected
  useEffect(() => {
    if (selectedRequest) {
      setMethod(selectedRequest.method);
      setUrl(selectedRequest.url);
      setRequestName(selectedRequest.name);
      
      // Convert headers object to array
      const headersArray = Object.entries(selectedRequest.headers).map(([key, value]) => ({
        key,
        value,
        enabled: true,
      }));
      setHeaders(headersArray);
      
      if (selectedRequest.body) {
        setBody(selectedRequest.body);
      }
    }
  }, [selectedRequest]);

  // Auto-open body section when method supports it
  useEffect(() => {
    if (METHODS_WITH_BODY.includes(method)) {
      setShowBody(true);
    } else {
      setShowBody(false);
    }
  }, [method]);

  const addHeader = (preset?: { key: string; value: string }) => {
    const newHeader: Header = {
      key: preset?.key || '',
      value: preset?.value || '',
      enabled: true,
    };
    setHeaders([...headers, newHeader]);
  };

  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: value };
    setHeaders(updated);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  // Auth helper functions
  const applyBearerToken = (token: string = '') => {
    // Remove existing Authorization header
    const filtered = headers.filter(h => h.key.toLowerCase() !== 'authorization');
    setHeaders([
      ...filtered,
      { key: 'Authorization', value: `Bearer ${token}`, enabled: true }
    ]);
    setShowAuthHelper(false);
    if (!showHeaders) setShowHeaders(true);
  };

  const applyBasicAuth = (username: string = '', password: string = '') => {
    // Remove existing Authorization header
    const filtered = headers.filter(h => h.key.toLowerCase() !== 'authorization');
    const credentials = btoa(`${username}:${password}`);
    setHeaders([
      ...filtered,
      { key: 'Authorization', value: `Basic ${credentials}`, enabled: true }
    ]);
    setShowAuthHelper(false);
    if (!showHeaders) setShowHeaders(true);
  };

  const applyApiKey = (headerName: string = 'X-API-Key', apiKey: string = '') => {
    // Remove existing header with same name
    const filtered = headers.filter(h => h.key.toLowerCase() !== headerName.toLowerCase());
    setHeaders([
      ...filtered,
      { key: headerName, value: apiKey, enabled: true }
    ]);
    setShowAuthHelper(false);
    if (!showHeaders) setShowHeaders(true);
  };

  const handleSend = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      // Get active environment for variable replacement
      const activeEnv = await environmentService.getActiveEnvironment();
      const envVars = activeEnv?.variables || {};

      // Replace variables in URL
      const processedUrl = environmentService.replaceVariables(url.trim(), envVars);

      // Replace variables in headers
      const headersObject = headers
        .filter(h => h.enabled && h.key.trim())
        .reduce((acc, h) => ({ 
          ...acc, 
          [h.key.trim()]: environmentService.replaceVariables(h.value, envVars)
        }), {});

      // Replace variables in body
      const processedBody = METHODS_WITH_BODY.includes(method) 
        ? environmentService.replaceVariables(body, envVars)
        : undefined;

      const startTime = performance.now();
      const result = await httpClient.sendRequest({
        method,
        url: processedUrl,
        headers: headersObject,
        params: {},
        body: processedBody,
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

      // Save to history with original values (including variables)
      await historyService.addToHistory({
        id: crypto.randomUUID(),
        name: `${method} ${url.trim()}`,
        method,
        url: url.trim(),
        headers: headers
          .filter(h => h.enabled && h.key.trim())
          .reduce((acc, h) => ({ ...acc, [h.key.trim()]: h.value }), {}),
        params: {},
        body: METHODS_WITH_BODY.includes(method) ? body : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        status: result.status,
        statusText: result.statusText,
      });

      // Clear isDirty flag after successful send
      if (activeTabId) {
        updateTab(activeTabId, { isDirty: false });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCollection = async (collectionId: string) => {
    if (!url.trim()) return;

    const headersObject = headers
      .filter(h => h.enabled && h.key.trim())
      .reduce((acc, h) => ({ ...acc, [h.key.trim()]: h.value }), {});

    const request: Request = {
      id: crypto.randomUUID(),
      name: requestName.trim() || `${method} ${url.trim()}`,
      method,
      url: url.trim(),
      headers: headersObject,
      params: {},
      body: METHODS_WITH_BODY.includes(method) ? body : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collectionsService.addRequestToCollection(collectionId, request);
    setShowSaveDialog(false);
    setRequestName('');
  };

  const hasBody = METHODS_WITH_BODY.includes(method);

  return (
    <div className="h-full bg-white dark:bg-gray-950 flex flex-col">
      <div className="p-4 space-y-4 flex-shrink-0">
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
            ref={urlInputRef}
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
          
          <button
            onClick={() => setShowCodeGen(true)}
            disabled={!url.trim()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            title="Generate code"
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Code
          </button>
          
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!url.trim()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            title="Save to collection"
          >
            Save
          </button>
        </div>

        {/* Save to Collection Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-96 max-w-full mx-4">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Save to Collection
                </h3>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Request Name (optional)
                  </label>
                  <input
                    type="text"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder={`${method} ${url.trim()}`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Collection
                  </label>
                  {collections && collections.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {collections.map((collection) => (
                        <button
                          key={collection.id}
                          onClick={() => handleSaveToCollection(collection.id)}
                          className="w-full p-3 text-left border border-gray-200 dark:border-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {collection.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {collection.requests.length} requests
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded">
                      No collections yet. Create one from the Collections tab.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setRequestName('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auth Helper Panel */}
        {showAuthHelper && (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Authentication Helper
              </h3>
              <button
                onClick={() => setShowAuthHelper(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Bearer Token */}
              <div className="border border-gray-200 dark:border-gray-700 rounded p-3 space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Bearer Token</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Adds Authorization: Bearer &lt;token&gt; header
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter token or {{variable}}"
                    id="bearer-token-input"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('bearer-token-input') as HTMLInputElement;
                      applyBearerToken(input.value);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Basic Auth */}
              <div className="border border-gray-200 dark:border-gray-700 rounded p-3 space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Basic Authentication</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Adds Authorization: Basic &lt;base64(username:password)&gt; header
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Username"
                    id="basic-auth-username"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    id="basic-auth-password"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => {
                      const usernameInput = document.getElementById('basic-auth-username') as HTMLInputElement;
                      const passwordInput = document.getElementById('basic-auth-password') as HTMLInputElement;
                      applyBasicAuth(usernameInput.value, passwordInput.value);
                      usernameInput.value = '';
                      passwordInput.value = '';
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div className="border border-gray-200 dark:border-gray-700 rounded p-3 space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">API Key</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Adds a custom header with your API key
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Header name (e.g., X-API-Key)"
                    id="api-key-header"
                    defaultValue="X-API-Key"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="API key value or {{variable}}"
                    id="api-key-value"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => {
                      const headerInput = document.getElementById('api-key-header') as HTMLInputElement;
                      const valueInput = document.getElementById('api-key-value') as HTMLInputElement;
                      applyApiKey(headerInput.value, valueInput.value);
                      valueInput.value = '';
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAuthHelper(!showAuthHelper)}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Auth Helper
          </button>

          <button
            onClick={() => setShowHeaders(!showHeaders)}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showHeaders ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Headers {headers.length > 0 && `(${headers.filter(h => h.enabled).length})`}
          </button>
        </div>

        {hasBody && (
          <button
            onClick={() => setShowBody(!showBody)}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showBody ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Body
          </button>
        )}
      </div>

      {showHeaders && (
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800">
          <div className="p-4 space-y-3 max-h-64 overflow-auto">
            {headers.length === 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_HEADERS.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => addHeader(preset)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {preset.key}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {headers.map((header, index) => (
              <div key={index} className="flex gap-2 items-start">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                  className="mt-2.5"
                />
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  placeholder="Header name"
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  placeholder="Header value"
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => removeHeader(index)}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              onClick={() => addHeader()}
              className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-dashed border-gray-300 dark:border-gray-700 rounded hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
            >
              + Add Header
            </button>
          </div>
        </div>
      )}

      {hasBody && showBody && (
        <div className="flex-1 border-t border-gray-200 dark:border-gray-800 flex flex-col min-h-0">
          <div className="p-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Request Body (JSON)</span>
            <button
              onClick={() => {
                try {
                  const formatted = JSON.stringify(JSON.parse(body), null, 2);
                  setBody(formatted);
                } catch (e) {
                  // Invalid JSON, don't format
                }
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Format
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language="json"
              value={body}
              onChange={(value) => setBody(value || '')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        </div>
      )}

      {!showHeaders && !showBody && (
        <div className="p-4 text-xs text-gray-500 dark:text-gray-400 mt-auto space-y-2">
          <div>
            <p className="font-semibold mb-1">Quick Keyboard Shortcuts:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p>⌘/Ctrl + Enter → Send request</p>
              <p>⌘/Ctrl + K → Focus URL bar</p>
              <p>Alt + T → New tab</p>
              <p>Alt + W → Close tab</p>
              <p>⌘/Ctrl + B → Toggle sidebar</p>
              <p>⌘/Ctrl + Shift + / → Show all shortcuts</p>
            </div>
          </div>
          <p className="pt-2 border-t border-gray-200 dark:border-gray-700">Try POST to https://jsonplaceholder.typicode.com/posts</p>
        </div>
      )}

      {/* Code Generation Modal */}
      <CodeGenerationModal
        isOpen={showCodeGen}
        onClose={() => setShowCodeGen(false)}
        method={method}
        url={url}
        headers={headers}
        body={body}
      />
    </div>
  );
}
