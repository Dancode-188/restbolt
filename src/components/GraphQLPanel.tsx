'use client';

import { useState } from 'react';
import { graphqlService, GraphQLExecutionResult } from '@/lib/graphql-service';
import { useStore } from '@/lib/store';
import Editor from '@monaco-editor/react';

const DEFAULT_QUERY = `query {
  countries {
    code
    name
    emoji
    capital
  }
}`;

const EXAMPLE_QUERIES = [
  {
    name: 'Simple Query',
    query: `query {
  countries {
    code
    name
    emoji
  }
}`,
    variables: '{}',
  },
  {
    name: 'Query with Variables',
    query: `query GetCountry($code: ID!) {
  country(code: $code) {
    code
    name
    capital
    currency
    emoji
  }
}`,
    variables: `{
  "code": "US"
}`,
  },
];

export default function GraphQLPanel() {
  const { theme } = useStore();
  const [endpoint, setEndpoint] = useState('https://countries.trevorblades.com/');
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [variables, setVariables] = useState('{}');
  const [headers, setHeaders] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GraphQLExecutionResult | null>(null);
  const [showVariables, setShowVariables] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

  const handleExecute = async () => {
    const queryValidation = graphqlService.validateQuery(query);
    if (!queryValidation.valid) {
      setResult({ error: queryValidation.error, duration: 0 });
      return;
    }

    const variablesValidation = graphqlService.validateVariables(variables);
    if (!variablesValidation.valid) {
      setResult({ error: `Variables error: ${variablesValidation.error}`, duration: 0 });
      return;
    }

    let parsedHeaders = {};
    if (headers.trim()) {
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (error: any) {
        setResult({ error: `Headers error: ${error.message}`, duration: 0 });
        return;
      }
    }

    setLoading(true);
    setResult(null);

    try {
      const executionResult = await graphqlService.executeQuery({
        endpoint: endpoint.trim(),
        query: query.trim(),
        variables: variablesValidation.parsed,
        headers: parsedHeaders,
      });
      setResult(executionResult);
    } catch (error: any) {
      setResult({ error: `Execution failed: ${error.message}`, duration: 0 });
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example: typeof EXAMPLE_QUERIES[0]) => {
    setQuery(example.query);
    setVariables(example.variables);
  };

  const formatJSON = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // Calculate heights
  const headerHeight = 60;
  const controlsHeight = 40;
  const queryHeight = 150;
  const variablesHeight = showVariables ? 100 : 0;
  const headersHeight = showHeaders ? 100 : 0;
  const usedHeight = headerHeight + controlsHeight + queryHeight + variablesHeight + headersHeight;
  const responseHeight = 800 - usedHeight;

  return (
    <div style={{ height: '800px', display: 'flex', flexDirection: 'column' }} className="bg-white dark:bg-gray-950">
      {/* Header: Endpoint + Execute */}
      <div style={{ height: `${headerHeight}px`, flexShrink: 0 }} className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex gap-2">
        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="https://api.example.com/graphql"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) handleExecute();
          }}
        />
        <button
          onClick={handleExecute}
          disabled={loading || !endpoint.trim()}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Executing...' : 'Execute'}
        </button>
      </div>

      {/* Controls */}
      <div style={{ height: `${controlsHeight}px`, flexShrink: 0 }} className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <select
          onChange={(e) => {
            if (e.target.value) {
              loadExample(EXAMPLE_QUERIES[parseInt(e.target.value)]);
              e.target.value = '';
            }
          }}
          className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
        >
          <option value="">Load Example...</option>
          {EXAMPLE_QUERIES.map((example, index) => (
            <option key={index} value={index}>{example.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={showVariables} onChange={(e) => setShowVariables(e.target.checked)} className="rounded" />
            Variables
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={showHeaders} onChange={(e) => setShowHeaders(e.target.checked)} className="rounded" />
            Headers
          </label>
        </div>
      </div>

      {/* Query Editor */}
      <div style={{ height: `${queryHeight}px`, flexShrink: 0 }} className="border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Query</h3>
        </div>
        <div style={{ height: `${queryHeight - 32}px` }}>
          <Editor
            height="100%"
            language="graphql"
            value={query}
            onChange={(value) => setQuery(value || '')}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
      </div>

      {/* Variables */}
      {showVariables && (
        <div style={{ height: `${variablesHeight}px`, flexShrink: 0 }} className="border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Variables (JSON)</h3>
          </div>
          <div style={{ height: `${variablesHeight - 32}px` }}>
            <Editor
              height="100%"
              language="json"
              value={variables}
              onChange={(value) => setVariables(value || '{}')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
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

      {/* Headers */}
      {showHeaders && (
        <div style={{ height: `${headersHeight}px`, flexShrink: 0 }} className="border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Headers (JSON)</h3>
          </div>
          <div style={{ height: `${headersHeight - 32}px` }}>
            <Editor
              height="100%"
              language="json"
              value={headers}
              onChange={(value) => setHeaders(value || '{}')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
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

      {/* RESPONSE SECTION - COMPLETELY SCROLLABLE */}
      <div style={{ height: `${responseHeight}px`, flexShrink: 0 }} className="border-t border-gray-200 dark:border-gray-800">
        <div style={{ height: '32px', flexShrink: 0 }} className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Response</h3>
          {result && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {result.duration}ms{result.status && ` • ${result.status}`}
            </span>
          )}
        </div>
        
        {/* SCROLLABLE CONTENT WITH BOTTOM PADDING */}
        <div 
          style={{ 
            height: `${responseHeight - 32}px`,
            overflowY: 'scroll',
            overflowX: 'hidden'
          }} 
          className="p-4"
        >
          <div style={{ paddingBottom: '60px' }}>
            {!result ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">No response yet</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click Execute to send your GraphQL query
                </p>
              </div>
            ) : result.error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Error</h4>
                <pre className="text-xs text-red-600 dark:text-red-300 whitespace-pre-wrap font-mono">{result.error}</pre>
              </div>
            ) : result.response?.errors ? (
              <div className="space-y-3">
                {result.response.data && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Data (Partial)</h4>
                    <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">{formatJSON(result.response.data)}</pre>
                  </div>
                )}
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">GraphQL Errors</h4>
                  {result.response.errors.map((error, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <p className="text-xs text-red-600 dark:text-red-300 mb-1">{error.message}</p>
                      {error.locations && (
                        <p className="text-xs text-red-500 dark:text-red-400">
                          Line {error.locations[0].line}, Column {error.locations[0].column}
                        </p>
                      )}
                      {error.path && <p className="text-xs text-red-500 dark:text-red-400">Path: {error.path.join(' → ')}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : result.response?.data ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Success ✓</h4>
                <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">{formatJSON(result.response.data)}</pre>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">No data returned</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
