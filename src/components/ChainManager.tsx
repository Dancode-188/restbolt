'use client';

import { useState, useEffect } from 'react';
import { Chain, ChainExecution } from '@/types';
import { chainService } from '@/lib/chain-service';
import ChainBuilder from './ChainBuilder';
import { useStore } from '@/lib/store';

export default function ChainManager() {
  const { theme } = useStore();
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [executions, setExecutions] = useState<ChainExecution[]>([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingChainId, setEditingChainId] = useState<string | undefined>();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<{
    current: number;
    total: number;
    status: string;
  } | null>(null);

  useEffect(() => {
    loadChains();
  }, []);

  useEffect(() => {
    if (selectedChain) {
      loadExecutions(selectedChain.id);
    }
  }, [selectedChain]);

  const loadChains = async () => {
    const allChains = await chainService.getAllChains();
    setChains(allChains);
  };

  const loadExecutions = async (chainId: string) => {
    const chainExecutions = await chainService.getChainExecutions(chainId);
    setExecutions(chainExecutions.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    ));
  };

  const handleCreateChain = () => {
    setEditingChainId(undefined);
    setIsBuilderOpen(true);
  };

  const handleEditChain = (chain: Chain) => {
    setEditingChainId(chain.id);
    setIsBuilderOpen(true);
  };

  const handleDeleteChain = async (chain: Chain) => {
    if (!confirm(`Delete chain "${chain.name}"?`)) return;
    await chainService.deleteChain(chain.id);
    if (selectedChain?.id === chain.id) {
      setSelectedChain(null);
    }
    await loadChains();
  };

  const handleDuplicateChain = async (chain: Chain) => {
    await chainService.duplicateChain(chain.id);
    await loadChains();
  };

  const handleExecuteChain = async (chain: Chain) => {
    setIsExecuting(true);
    setExecutionProgress({ current: 0, total: chain.steps.length, status: 'Starting...' });

    try {
      await chainService.executeChain(
        chain.id,
        (stepIndex, response, variables) => {
          setExecutionProgress({
            current: stepIndex + 1,
            total: chain.steps.length,
            status: `Completed step ${stepIndex + 1}: ${chain.steps[stepIndex].name}`,
          });
        },
        (stepIndex, error) => {
          setExecutionProgress({
            current: stepIndex + 1,
            total: chain.steps.length,
            status: `Failed step ${stepIndex + 1}: ${error}`,
          });
        }
      );

      setExecutionProgress({
        current: chain.steps.length,
        total: chain.steps.length,
        status: 'Chain completed successfully!',
      });

      // Reload executions
      await loadExecutions(chain.id);
    } catch (error: any) {
      setExecutionProgress({
        current: executionProgress?.current || 0,
        total: chain.steps.length,
        status: `Error: ${error.message}`,
      });
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecutionProgress(null), 3000);
    }
  };

  const handleExportChain = async (chain: Chain) => {
    const json = await chainService.exportChain(chain.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chain.name.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportChain = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      try {
        await chainService.importChain(text);
        await loadChains();
      } catch (error) {
        alert('Failed to import chain. Please check the file format.');
      }
    };
    input.click();
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'running':
        return 'text-blue-600 dark:text-blue-400';
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDuration = (startedAt: Date, completedAt?: Date) => {
    const start = new Date(startedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    const duration = end - start;
    
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Request Chains
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportChain}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </button>
            <button
              onClick={handleCreateChain}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chain
            </button>
          </div>
        </div>

        {/* Execution Progress */}
        {executionProgress && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                Executing Chain
              </span>
              <span className="text-xs text-blue-700 dark:text-blue-400">
                {executionProgress.current} / {executionProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(executionProgress.current / executionProgress.total) * 100}%` }}
              />
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400">
              {executionProgress.status}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {chains.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">No chains yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Create a chain to execute multiple requests sequentially
            </p>
            <button
              onClick={handleCreateChain}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Create Your First Chain
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {chains.map((chain) => (
              <div
                key={chain.id}
                className={`border rounded-lg p-4 transition-colors ${
                  selectedChain?.id === chain.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {chain.name}
                    </h3>
                    {chain.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {chain.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                      <span>{chain.steps.length} steps</span>
                      <span>•</span>
                      <span>Created {new Date(chain.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleExecuteChain(chain)}
                    disabled={isExecuting}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Execute
                  </button>
                  <button
                    onClick={() => handleEditChain(chain)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicateChain(chain)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleExportChain(chain)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleDeleteChain(chain)}
                    className="ml-auto px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Recent Executions */}
                {selectedChain?.id === chain.id && executions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Recent Executions
                    </h4>
                    <div className="space-y-2">
                      {executions.slice(0, 5).map((execution) => (
                        <div
                          key={execution.id}
                          className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${getExecutionStatusColor(execution.status)}`}>
                              {execution.status.toUpperCase()}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatDuration(execution.startedAt, execution.completedAt)}
                            </span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-500">
                            {new Date(execution.startedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedChain(selectedChain?.id === chain.id ? null : chain)}
                  className="w-full mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedChain?.id === chain.id ? 'Hide' : 'View'} Executions
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chain Builder Modal */}
      <ChainBuilder
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          loadChains();
        }}
        chainId={editingChainId}
      />
    </div>
  );
}
