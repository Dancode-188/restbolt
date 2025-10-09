'use client';

import { useStore } from '@/lib/store';
import { diffService, DiffResult } from '@/lib/diff-service';
import { useState, useMemo } from 'react';

export default function DiffViewer() {
  const { currentResponse, comparisonResponse, clearComparison, theme } = useStore();
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  // Calculate the diff
  const comparison = useMemo(() => {
    if (!currentResponse || !comparisonResponse) return null;

    if (viewMode === 'side-by-side') {
      return diffService.compareSideBySide(
        { data: comparisonResponse.data, label: 'Previous Response' },
        { data: currentResponse.data, label: 'Current Response' }
      );
    } else {
      return diffService.compareResponses(
        { data: comparisonResponse.data, label: 'Previous Response' },
        { data: currentResponse.data, label: 'Current Response' }
      );
    }
  }, [currentResponse, comparisonResponse, viewMode]);

  if (!comparison) {
    return null;
  }

  const getLineBackground = (type: DiffResult['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-900/10 border-l-2 border-green-500';
      case 'removed':
        return 'bg-red-50 dark:bg-red-900/10 border-l-2 border-red-500';
      default:
        return '';
    }
  };

  const getLineTextColor = (type: DiffResult['type']) => {
    switch (type) {
      case 'added':
        return 'text-green-800 dark:text-green-200';
      case 'removed':
        return 'text-red-800 dark:text-red-200';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Response Comparison
          </h3>
          
          {/* Summary */}
          {'summary' in comparison && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-500"></span>
                <span className="text-gray-600 dark:text-gray-400">
                  {comparison.summary.additions} additions
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-500"></span>
                <span className="text-gray-600 dark:text-gray-400">
                  {comparison.summary.deletions} deletions
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'unified'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Unified
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={clearComparison}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Close comparison"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'side-by-side' && 'leftLines' in comparison ? (
          // Side by Side View
          <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-800 h-full">
            {/* Left Side - Previous Response */}
            <div className="overflow-auto">
              <div className="sticky top-0 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {comparison.leftLabel}
                </h4>
              </div>
              <div className="font-mono text-xs">
                {comparison.leftLines.map((line, index) => (
                  <div
                    key={`left-${index}`}
                    className={`flex ${getLineBackground(line.type)}`}
                  >
                    <span className="flex-shrink-0 w-12 px-2 py-1 text-right text-gray-400 dark:text-gray-600 select-none">
                      {line.value ? index + 1 : ''}
                    </span>
                    <span className={`flex-1 px-2 py-1 ${getLineTextColor(line.type)}`}>
                      {line.value || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Current Response */}
            <div className="overflow-auto">
              <div className="sticky top-0 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {comparison.rightLabel}
                </h4>
              </div>
              <div className="font-mono text-xs">
                {comparison.rightLines.map((line, index) => (
                  <div
                    key={`right-${index}`}
                    className={`flex ${getLineBackground(line.type)}`}
                  >
                    <span className="flex-shrink-0 w-12 px-2 py-1 text-right text-gray-400 dark:text-gray-600 select-none">
                      {line.value ? index + 1 : ''}
                    </span>
                    <span className={`flex-1 px-2 py-1 ${getLineTextColor(line.type)}`}>
                      {line.value || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Unified View
          'diff' in comparison && (
            <div className="font-mono text-xs">
              {comparison.diff.map((line, index) => (
                <div
                  key={index}
                  className={`flex ${getLineBackground(line.type)}`}
                >
                  <span className="flex-shrink-0 w-12 px-2 py-1 text-right text-gray-400 dark:text-gray-600 select-none">
                    {line.lineNumber}
                  </span>
                  <span className="flex-shrink-0 w-8 px-2 py-1 text-center text-gray-500 dark:text-gray-500 select-none">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ''}
                  </span>
                  <span className={`flex-1 px-2 py-1 ${getLineTextColor(line.type)}`}>
                    {line.value}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
