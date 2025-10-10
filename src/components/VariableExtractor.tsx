'use client';

import { useState, useEffect } from 'react';
import { variableExtractionService, VariableExtraction } from '@/lib/variable-extraction-service';
import { useStore } from '@/lib/store';

interface VariableExtractorProps {
  response: any;
  onExtract: (variables: Record<string, any>) => void;
}

export default function VariableExtractor({ response, onExtract }: VariableExtractorProps) {
  const { theme, chainVariables } = useStore();
  const [extractions, setExtractions] = useState<VariableExtraction[]>([]);
  const [newExtraction, setNewExtraction] = useState({ name: '', path: '', description: '' });
  const [extractedVars, setExtractedVars] = useState<Record<string, any>>({});
  const [showExamples, setShowExamples] = useState(false);
  const [autoDetected, setAutoDetected] = useState<VariableExtraction[]>([]);
  
  // Conflict detection state
  const [conflictModal, setConflictModal] = useState<{
    show: boolean;
    varName: string;
    existingValue: any;
    newValue: any;
    extraction: VariableExtraction | null;
    isAutoDetected: boolean;
    fromAutoExtraction: boolean; // New flag for conflicts during automatic extraction
    pendingVars: Record<string, any> | null; // Store the full extracted vars for later use
  }>({
    show: false,
    varName: '',
    existingValue: null,
    newValue: null,
    extraction: null,
    isAutoDetected: false,
    fromAutoExtraction: false,
    pendingVars: null,
  });

  // Check if response is successful (2xx status)
  const isSuccessResponse = response?.status >= 200 && response?.status < 300;

  // Auto-detect variables on mount - ONLY for successful responses
  // Filter out variables that are already extracted
  useEffect(() => {
    if (response?.data && isSuccessResponse) {
      const detected = variableExtractionService.autoDetectVariables(response.data);
      
      // Filter out variables that already exist in chainVariables
      const newVariables = detected.filter(v => {
        const exists = chainVariables && chainVariables.hasOwnProperty(v.name);
        return !exists;
      });
      
      console.log('🔍 Auto-detected variables (before filtering):', detected.map(v => v.name));
      console.log('📋 Existing chainVariables:', Object.keys(chainVariables || {}));
      console.log('✨ New variables to suggest:', newVariables.map(v => v.name));
      
      setAutoDetected(newVariables);
    } else {
      // Clear auto-detected variables for error responses
      setAutoDetected([]);
    }
  }, [response, isSuccessResponse, chainVariables]);

  // Extract variables whenever extractions change - ONLY for successful responses
  // NOW WITH CONFLICT DETECTION!
  useEffect(() => {
    if (response?.data && extractions.length > 0 && isSuccessResponse) {
      const vars = variableExtractionService.extractVariables(response.data, extractions);
      console.log('🔍 Extracting variables:', vars);
      
      // Check for conflicts with existing variables
      const conflicts: Array<{name: string; existingValue: any; newValue: any}> = [];
      
      Object.entries(vars).forEach(([name, newValue]) => {
        if (chainVariables && chainVariables.hasOwnProperty(name)) {
          const existingValue = chainVariables[name];
          // Only consider it a conflict if values are different and new value is not undefined
          if (newValue !== undefined && newValue !== existingValue) {
            conflicts.push({ name, existingValue, newValue });
          }
        }
      });
      
      if (conflicts.length > 0) {
        // We have conflicts! Show modal for the first conflict
        const firstConflict = conflicts[0];
        console.log('⚠️ CONFLICT DETECTED during extraction:', firstConflict);
        
        // Find the extraction rule that caused this conflict
        const conflictingExtraction = extractions.find(e => e.name === firstConflict.name);
        
        if (conflictingExtraction) {
          setConflictModal({
            show: true,
            varName: firstConflict.name,
            existingValue: firstConflict.existingValue,
            newValue: firstConflict.newValue,
            extraction: conflictingExtraction,
            isAutoDetected: false,
            fromAutoExtraction: true, // Flag that this came from automatic extraction
            pendingVars: vars, // Store all the extracted vars for later use
          });
          
          // Don't extract or call onExtract - wait for user decision
          setExtractedVars({});
          return;
        }
      }
      
      // No conflicts, proceed normally
      setExtractedVars(vars);
      onExtract(vars);
      console.log('✅ Called onExtract with:', vars);
    } else if (!isSuccessResponse && extractions.length > 0) {
      // Clear extracted vars for error responses
      console.log('⚠️ Skipping variable extraction - Error response (status:', response?.status, ')');
      setExtractedVars({});
    }
  }, [extractions, response, isSuccessResponse, chainVariables]); // Added chainVariables dependency

  // Helper function to check if a variable would conflict with an existing one
  const checkConflict = (varName: string, extraction: VariableExtraction): { hasConflict: boolean; existingValue: any; newValue: any } => {
    // Check if variable already exists in chainVariables
    if (!chainVariables || !chainVariables.hasOwnProperty(varName)) {
      return { hasConflict: false, existingValue: null, newValue: null };
    }

    // Get the existing value
    const existingValue = chainVariables[varName];

    // Try to extract the new value
    if (!response?.data) {
      return { hasConflict: false, existingValue: null, newValue: null };
    }

    const testVars = variableExtractionService.extractVariables(response.data, [extraction]);
    const newValue = testVars[varName];

    // If new value is undefined or same as existing, no conflict
    if (newValue === undefined || newValue === existingValue) {
      return { hasConflict: false, existingValue, newValue };
    }

    // We have a conflict!
    return { hasConflict: true, existingValue, newValue };
  };

  // Get suggested alternative name for a conflicting variable
  const getSuggestedName = (baseName: string): string => {
    // Common patterns
    const patterns: Record<string, string> = {
      'id': 'postId',
      'userId': 'authorId',
      'name': 'userName',
      'email': 'userEmail',
      'title': 'postTitle',
      'body': 'postBody',
      'data': 'responseData',
    };

    // Check if we have a common pattern suggestion
    if (patterns[baseName]) {
      return patterns[baseName];
    }

    // Otherwise, add a prefix
    return `new${baseName.charAt(0).toUpperCase()}${baseName.slice(1)}`;
  };

  const addExtraction = () => {
    if (!newExtraction.name.trim() || !newExtraction.path.trim()) return;

    // Validate JSONPath
    const validation = variableExtractionService.validateJSONPath(newExtraction.path);
    if (!validation.valid) {
      alert(`Invalid JSONPath: ${validation.error}`);
      return;
    }

    // Check for conflicts with existing variables
    const conflict = checkConflict(newExtraction.name, newExtraction);
    
    if (conflict.hasConflict) {
      // Show conflict modal
      setConflictModal({
        show: true,
        varName: newExtraction.name,
        existingValue: conflict.existingValue,
        newValue: conflict.newValue,
        extraction: { ...newExtraction },
        isAutoDetected: false,
        fromAutoExtraction: false,
        pendingVars: null,
      });
      return;
    }

    // No conflict, proceed normally
    setExtractions([...extractions, { ...newExtraction }]);
    setNewExtraction({ name: '', path: '', description: '' });
  };

  const removeExtraction = (index: number) => {
    setExtractions(extractions.filter((_, i) => i !== index));
  };

  const addAutoDetected = (extraction: VariableExtraction) => {
    // Don't add if already in extractions list
    if (extractions.find(e => e.name === extraction.name)) {
      return;
    }

    // Check for conflicts with existing variables
    const conflict = checkConflict(extraction.name, extraction);
    
    if (conflict.hasConflict) {
      // Show conflict modal
      setConflictModal({
        show: true,
        varName: extraction.name,
        existingValue: conflict.existingValue,
        newValue: conflict.newValue,
        extraction: extraction,
        isAutoDetected: true,
        fromAutoExtraction: false,
        pendingVars: null,
      });
      return;
    }

    // No conflict, proceed normally
    setExtractions([...extractions, extraction]);
  };

  // Handle conflict resolution: Cancel
  const handleConflictCancel = () => {
    setConflictModal({
      show: false,
      varName: '',
      existingValue: null,
      newValue: null,
      extraction: null,
      isAutoDetected: false,
      fromAutoExtraction: false,
      pendingVars: null,
    });
  };

  // Handle conflict resolution: Use Different Name
  const handleConflictUseDifferentName = () => {
    if (!conflictModal.extraction) return;

    const suggestedName = getSuggestedName(conflictModal.varName);
    
    if (conflictModal.fromAutoExtraction) {
      // For automatic extraction conflicts, we need to:
      // 1. Remove the old extraction rule (with conflicting name)
      // 2. Add a new extraction rule with the suggested name
      // 3. The extraction will happen automatically
      
      const updatedExtractions = extractions.filter(e => e.name !== conflictModal.varName);
      const newExtraction = {
        name: suggestedName,
        path: conflictModal.extraction.path,
        description: conflictModal.extraction.description || `Renamed from ${conflictModal.varName} to avoid conflict`,
      };
      
      setExtractions([...updatedExtractions, newExtraction]);
      console.log(`✅ Renamed extraction rule from '${conflictModal.varName}' to '${suggestedName}'`);
      
      // Close the modal - the extraction will happen automatically via the useEffect
      handleConflictCancel();
    } else {
      // For manual additions, pre-fill the custom extraction form
      setNewExtraction({
        name: suggestedName,
        path: conflictModal.extraction.path,
        description: conflictModal.extraction.description || '',
      });

      // Close the modal
      handleConflictCancel();

      // Scroll to the custom extraction section
      const customSection = document.querySelector('[data-custom-extraction]');
      customSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Handle conflict resolution: Replace Anyway
  const handleConflictReplace = () => {
    if (!conflictModal.extraction) return;

    // Check if this conflict came from automatic extraction (rule already exists)
    if (conflictModal.fromAutoExtraction && conflictModal.pendingVars) {
      // The extraction rule is already in place, just call onExtract with the pending vars
      console.log('✅ User approved replacement, calling onExtract with:', conflictModal.pendingVars);
      setExtractedVars(conflictModal.pendingVars);
      onExtract(conflictModal.pendingVars);
    } else if (conflictModal.isAutoDetected) {
      // For auto-detected, add the extraction rule
      setExtractions([...extractions, conflictModal.extraction]);
    } else {
      // For custom extraction, add the rule and clear the form
      setExtractions([...extractions, conflictModal.extraction]);
      setNewExtraction({ name: '', path: '', description: '' });
    }

    // Close the modal
    handleConflictCancel();
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

      {/* Error Response Warning */}
      {!isSuccessResponse && (
        <div className="m-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
                Cannot Extract from Error Response
              </h4>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Variable extraction is only available for successful responses (status 2xx). This response has status {response?.status || 'unknown'}. 
                Send a successful request to extract variables.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Only show variable extraction UI for successful responses */}
        {isSuccessResponse ? (
          <>
            {/* Auto-detected variables */}
            {autoDetected.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  New Variables Detected
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

        {/* Message when no new variables detected */}
        {autoDetected.length === 0 && Object.keys(chainVariables || {}).length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              ℹ️ No new variables detected. All available variables are already extracted.
            </p>
          </div>
        )}

        {/* Add new extraction */}
        <div className="space-y-3" data-custom-extraction>
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
          </>
        ) : (
          /* Show helpful message for error responses */
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Failed
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fix the error and send a successful request to extract variables
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Conflict Detection Modal */}
      {conflictModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Variable Already Exists
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                The variable <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">{conflictModal.varName}</code> already exists with a different value.
              </p>

              {/* Value Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Current Value
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <code className="text-sm font-mono text-blue-900 dark:text-blue-100 break-all">
                      {variableExtractionService.formatVariableValue(conflictModal.existingValue)}
                    </code>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    New Value
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                    <code className="text-sm font-mono text-orange-900 dark:text-orange-100 break-all">
                      {variableExtractionService.formatVariableValue(conflictModal.newValue)}
                    </code>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-orange-800 dark:text-orange-200">
                  ⚠️ <strong>Warning:</strong> Replacing this variable will overwrite the current value. Consider using a different name like <code className="px-1 py-0.5 bg-orange-100 dark:bg-orange-800 rounded font-mono">{getSuggestedName(conflictModal.varName)}</code> to keep both values.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleConflictCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConflictUseDifferentName}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Use Different Name
              </button>
              <button
                onClick={handleConflictReplace}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors"
              >
                Replace Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
