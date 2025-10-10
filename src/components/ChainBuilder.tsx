'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Chain, ChainStep, Request } from '@/types';
import { chainService } from '@/lib/chain-service';
import { useStore } from '@/lib/store';

interface ChainBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  chainId?: string; // If editing existing chain
}

export default function ChainBuilder({ isOpen, onClose, chainId }: ChainBuilderProps) {
  const { theme, chainVariables } = useStore();
  const [chain, setChain] = useState<Chain | null>(null);
  const [chainName, setChainName] = useState('');
  const [chainDescription, setChainDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  // Debounce timers for auto-save
  const updateTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Debounced database update - saves after user stops typing
  const debouncedUpdateStep = useCallback((chainId: string, stepId: string, updates: Partial<ChainStep>) => {
    // Clear existing timer for this step
    const timerId = updateTimers.current.get(stepId);
    if (timerId) {
      clearTimeout(timerId);
    }

    // Set new timer - save after 500ms of inactivity
    const newTimerId = setTimeout(async () => {
      console.log('💾 Auto-saving step:', stepId, updates);
      try {
        await chainService.updateStep(chainId, stepId, updates);
        console.log('✅ Step saved to database');
      } catch (error) {
        console.error('❌ Error saving step:', error);
      }
      updateTimers.current.delete(stepId);
    }, 500);

    updateTimers.current.set(stepId, newTimerId);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      updateTimers.current.forEach(timer => clearTimeout(timer));
      updateTimers.current.clear();
    };
  }, []);

  // Load chain if editing
  useEffect(() => {
    if (chainId && isOpen) {
      loadChain();
    } else if (isOpen && !chainId) {
      // Creating new chain
      setChainName('');
      setChainDescription('');
      setChain(null);
    }
  }, [chainId, isOpen]);

  const loadChain = async (idToLoad?: string) => {
    const targetId = idToLoad || chainId;
    if (!targetId) {
      console.log('⚠️ No chain ID to load');
      return;
    }
    
    console.log('🔄 Loading chain:', targetId);
    setIsLoading(true);
    try {
      const loadedChain = await chainService.getChain(targetId);
      console.log('📦 Loaded chain:', loadedChain);
      if (loadedChain) {
        setChain(loadedChain);
        setChainName(loadedChain.name);
        setChainDescription(loadedChain.description || '');
        console.log('✅ Chain state updated');
      } else {
        console.warn('⚠️ Chain not found in database');
      }
    } catch (error) {
      console.error('❌ Failed to load chain:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!chainName.trim()) {
      alert('Please enter a chain name');
      return;
    }

    setIsSaving(true);
    try {
      if (chain) {
        // Update existing
        await chainService.updateChain(chain.id, {
          name: chainName,
          description: chainDescription,
        });
      } else {
        // Create new
        const newChain = await chainService.createChain(chainName, chainDescription);
        setChain(newChain);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save chain:', error);
      alert('Failed to save chain');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStep = async () => {
    console.log('🔵 handleAddStep called');
    console.log('📋 Current chain:', chain);
    console.log('📝 Chain name:', chainName);
    
    try {
      if (!chain) {
        console.log('🔨 Creating new chain first...');
        
        // Create chain first
        const newChain = await chainService.createChain(
          chainName || 'New Chain',
          chainDescription
        );
        console.log('✅ Chain created:', newChain);
        setChain(newChain);

        console.log('🔨 Adding step to new chain...');
        // Add step
        await chainService.addStep(newChain.id, {
          name: 'New Step',
          request: {
            id: `request-${Date.now()}`,
            name: 'New Request',
            method: 'GET',
            url: 'https://api.example.com',
            headers: {},
            params: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          variableExtractions: [],
          continueOnError: false,
        });
        console.log('✅ Step added');

        // Reload with the new chain ID
        console.log('🔄 Reloading chain...');
        await loadChain(newChain.id);
        console.log('✅ Chain reloaded');
      } else {
        console.log('🔨 Adding step to existing chain...');
        
        // Add to existing chain
        await chainService.addStep(chain.id, {
          name: 'New Step',
          request: {
            id: `request-${Date.now()}`,
            name: 'New Request',
            method: 'GET',
            url: 'https://api.example.com',
            headers: {},
            params: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          variableExtractions: [],
          continueOnError: false,
        });
        console.log('✅ Step added');

        console.log('🔄 Reloading chain...');
        await loadChain(chain.id);
        console.log('✅ Chain reloaded');
      }
    } catch (error) {
      console.error('❌ Error in handleAddStep:', error);
      alert(`Failed to add step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRemoveStep = async (stepId: string) => {
    if (!chain) return;
    if (!confirm('Remove this step from the chain?')) return;

    try {
      await chainService.removeStep(chain.id, stepId);
      await loadChain(chain.id);
    } catch (error) {
      console.error('❌ Error removing step:', error);
      alert(`Failed to remove step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateStep = (stepId: string, updates: Partial<ChainStep>) => {
    if (!chain) return;
    
    console.log('🔄 Updating step locally:', stepId, updates);
    
    // Update local state immediately for instant UI feedback
    setChain({
      ...chain,
      steps: chain.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    });

    // Debounced save to database (happens 500ms after user stops typing)
    debouncedUpdateStep(chain.id, stepId, updates);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl h-[80vh] bg-white dark:bg-gray-900 rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Chain Name"
              value={chainName}
              onChange={(e) => setChainName(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 w-full"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={chainDescription}
              onChange={(e) => setChainDescription(e.target.value)}
              className="text-sm bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 placeholder-gray-400 w-full mt-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Steps */}
              {chain?.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => handleUpdateStep(step.id, { name: e.target.value })}
                        className="w-full text-sm font-medium bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-gray-100 pb-1"
                        placeholder="Step name"
                      />

                      {step.request && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={step.request.method}
                              onChange={(e) => handleUpdateStep(step.id, {
                                request: { ...step.request!, method: e.target.value as any }
                              })}
                              className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                              <option value="PATCH">PATCH</option>
                            </select>
                            <input
                              type="text"
                              value={step.request.url}
                              onChange={(e) => handleUpdateStep(step.id, {
                                request: { ...step.request!, url: e.target.value }
                              })}
                              className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 font-mono"
                              placeholder="https://api.example.com/endpoint"
                            />
                          </div>

                          {/* Variable Extractions */}
                          <div className="text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-600 dark:text-gray-400 font-medium">
                                Extract Variables ({step.variableExtractions.length})
                              </span>
                              <button
                                onClick={() => {
                                  const name = prompt('Variable name:');
                                  const path = prompt('JSONPath (e.g., $.data.id):');
                                  if (name && path) {
                                    handleUpdateStep(step.id, {
                                      variableExtractions: [
                                        ...step.variableExtractions,
                                        { name, path }
                                      ]
                                    });
                                  }
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                + Add
                              </button>
                            </div>
                            {step.variableExtractions.map((extraction, i) => (
                              <div key={i} className="flex items-center gap-2 py-1">
                                <span className="font-mono text-green-600 dark:text-green-400">{extraction.name}</span>
                                <span className="text-gray-500 dark:text-gray-500">=</span>
                                <span className="font-mono text-gray-600 dark:text-gray-400">{extraction.path}</span>
                                <button
                                  onClick={() => {
                                    handleUpdateStep(step.id, {
                                      variableExtractions: step.variableExtractions.filter((_, idx) => idx !== i)
                                    });
                                  }}
                                  className="ml-auto text-red-600 dark:text-red-400 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Options */}
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <input
                                type="checkbox"
                                checked={step.continueOnError}
                                onChange={(e) => handleUpdateStep(step.id, { continueOnError: e.target.checked })}
                                className="rounded"
                              />
                              Continue on error
                            </label>
                            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              Delay:
                              <input
                                type="number"
                                value={step.delay || 0}
                                onChange={(e) => handleUpdateStep(step.id, { delay: parseInt(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
                                placeholder="0"
                                min="0"
                              />
                              ms
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveStep(step.id)}
                      className="flex-shrink-0 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Step Button */}
              <button
                onClick={handleAddStep}
                className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Step
              </button>

              {/* Available Variables Info */}
              {Object.keys(chainVariables).length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    💡 Available Variables
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                    {Object.entries(chainVariables).map(([key, value]) => (
                      <div key={key} className="font-mono">
                        <span className="font-semibold">{'{{' + key + '}}'}</span> = {String(value)}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Use these in your requests with the syntax: <code className="font-mono">{'{{variableName}}'}</code>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
