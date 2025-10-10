'use client';

import { useState, useEffect } from 'react';
import { variableExtractionService, VariableExtraction } from '@/lib/variable-extraction-service';
import { useStore } from '@/lib/store';

interface VariableExtractorProps {
  response: any;
  onExtract: (variables: Record<string, any>) => void;
}

export default function VariableExtractor({ response, onExtract }: VariableExtractorProps) {
  const { theme } = useStore();
  const [extractions, setExtractions] = useState<VariableExtraction[]>([]);
  const [newExtraction, setNewExtraction] = useState({ name: '', path: '', description: '' });
  const [extractedVars, setExtractedVars] = useState<Record<string, any>>({});
  const [showExamples, setShowExamples] = useState(false);
  const [autoDetected, setAutoDetected] = useState<VariableExtraction[]>([]);

  // Auto-detect variables on mount
  useEffect(() => {
    if (response?.data) {
      const detected = variableExtractionService.autoDetectVariables(response.data);
      setAutoDetected(detected);
    }
  }, [response]);

  // Extract variables whenever extractions change
  useEffect(() => {
    if (response?.data && extractions.length > 0) {
      const vars = variableExtractionService.extractVariables(response.data, extractions);
      console.log('🔍 Extracting variables:', vars); // ← Debug log
      setExtractedVars(vars);
      onExtract(vars);
      console.log('✅ Called onExtract with:', vars); // ← Debug log
    }
  }, [extractions, response, onExtract]); // ← Added onExtract to dependencies

  const addExtraction = () => {
    if (!newExtraction.name.trim() || !newExtraction.path.trim()) return;

    // Validate JSONPath
    const validation = variableExtractionService.validateJSONPath(newExtraction.path);
    if (!validation.valid) {
      alert(`Invalid JSONPath: ${validation.error}`);
      return;
    }

    setExtractions([...extractions, { ...newExtraction }]);
    setNewExtraction({ name: '', path: '', description: '' });
  };

  const removeExtraction = (index: number) => {
    setExtractions(extractions.filter((_, i) => i !== index));
  };

  const addAutoDetected = (extraction: VariableExtraction) => {
    if (!extractions.find(e => e.name === extraction.name)) {
      setExtractions([...extractions, extraction]);
    }
  };

  const examples = variableExtractionService.getExamples();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Extract Variables
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Extract values from the response to use in subsequent requests
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Auto-detected variables */}
        {autoDetected.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Auto-detected Variables
            </h4>
            <div className="space-y-1">
              {autoDetected.map((extraction, index) => (
                <button
                  key={index}
                  onClick={() => addAutoDetected(extraction)}
                  disabled={extractions.some(e => e.name === extraction.name)}
                  className="w-full text-left p-2 rounded border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{extraction.name}</span>
                    <span className="text-gray-500 dark:text-gray-500">
                      {extractions.some(e => e.name === extraction.name) ? '✓ Added' : '+ Add'}
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-mono">{extraction.path}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add new extraction */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Add Custom Extraction
          </h4>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Variable name (e.g., userId)"
              value={newExtraction.name}
              onChange={(e) => setNewExtraction({ ...newExtraction, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            
            <div className="relative">
              <input
                type="text"
                placeholder="JSONPath (e.g., $.data.id)"
                value={newExtraction.path}
                onChange={(e) => setNewExtraction({ ...newExtraction, path: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
              />
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Examples
              </button>
            </div>

            {showExamples && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 space-y-1">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setNewExtraction({ ...newExtraction, path: example.path });
                      setShowExamples(false);
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs"
                  >
                    <div className="font-mono text-blue-600 dark:text-blue-400">{example.path}</div>
                    <div className="text-gray-600 dark:text-gray-400">{example.description}</div>
                  </button>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Description (optional)"
              value={newExtraction.description}
              onChange={(e) => setNewExtraction({ ...newExtraction, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />

            <button
              onClick={addExtraction}
              disabled={!newExtraction.name.trim() || !newExtraction.path.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Extraction Rule
            </button>
          </div>
        </div>

        {/* Current extractions */}
        {extractions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Extraction Rules ({extractions.length})
            </h4>
            <div className="space-y-2">
              {extractions.map((extraction, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {extraction.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {extraction.path}
                      </div>
                      {extraction.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {extraction.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeExtraction(index)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Show extracted value */}
                  {extractedVars[extraction.name] !== undefined && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Extracted Value:</div>
                      <div className="text-xs font-mono text-green-600 dark:text-green-400 break-all">
                        {variableExtractionService.formatVariableValue(extractedVars[extraction.name])}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted variables summary */}
        {Object.keys(extractedVars).length > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <div className="text-xs font-semibold text-green-800 dark:text-green-300 mb-2">
              ✓ {Object.keys(extractedVars).length} variable(s) extracted
            </div>
            <div className="text-xs text-green-700 dark:text-green-400">
              These variables can now be used in your next request using the syntax: <code className="font-mono">{'{{variableName}}'}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
