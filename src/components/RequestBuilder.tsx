'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { httpClient } from '@/lib/http-client';
import { historyService } from '@/lib/history-service';
import { HistoryItem } from '@/lib/db';
import Editor from '@monaco-editor/react';
import { useHotkeys } from 'react-hotkeys-hook';

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
}

export default function RequestBuilder({ selectedHistoryItem }: RequestBuilderProps) {
  const { setCurrentResponse, theme } = useStore();
  const [method, setMethod] = useState<typeof HTTP_METHODS[number]>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts');
  const [headers, setHeaders] = useState<Header[]>([]);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showBody, setShowBody] = useState(false);
  
  const urlInputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      const headersObject = headers
        .filter(h => h.enabled && h.key.trim())
        .reduce((acc, h) => ({ ...acc, [h.key.trim()]: h.value }), {});

      const startTime = performance.now();
      const result = await httpClient.sendRequest({
        method,
        url: url.trim(),
        headers: headersObject,
        params: {},
        body: METHODS_WITH_BODY.includes(method) ? body : undefined,
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

      // Save to history
      await historyService.addToHistory({
        id: crypto.randomUUID(),
        name: `${method} ${url.trim()}`,
        method,
        url: url.trim(),
        headers: headersObject,
        params: {},
        body: METHODS_WITH_BODY.includes(method) ? body : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        status: result.status,
        statusText: result.statusText,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
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
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

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
            <p className="font-semibold mb-1">Keyboard Shortcuts:</p>
            <p>⌘/Ctrl + Enter - Send request</p>
            <p>⌘/Ctrl + K - Focus URL bar</p>
            <p>⌘/Ctrl + H - Toggle headers</p>
            <p>⌘/Ctrl + / - Toggle body</p>
          </div>
          <p className="pt-2 border-t border-gray-200 dark:border-gray-700">Try POST to https://jsonplaceholder.typicode.com/posts</p>
        </div>
      )}
    </div>
  );
}
