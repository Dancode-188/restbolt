'use client';

import { useState, useEffect } from 'react';
import { scriptingService } from '@/lib/scripting-service';

export default function VariablesPanel() {
  const [variables, setVariables] = useState<Map<string, any>>(new Map());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Load variables on mount and refresh
  const loadVariables = () => {
    setVariables(new Map(scriptingService.getAllVariables()));
  };

  useEffect(() => {
    loadVariables();
  }, []);

  const handleEdit = (key: string, value: any) => {
    setEditingKey(key);
    setEditingValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
  };

  const handleSaveEdit = (key: string) => {
    try {
      // Try to parse as JSON first
      let parsedValue;
      try {
        parsedValue = JSON.parse(editingValue);
      } catch {
        // If not JSON, treat as string
        parsedValue = editingValue;
      }
      
      scriptingService.setVariable(key, parsedValue);
      setEditingKey(null);
      setEditingValue('');
      loadVariables();
    } catch (error) {
      console.error('Error saving variable:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditingValue('');
  };

  const handleDelete = (key: string) => {
    if (confirm(`Delete variable "${key}"?`)) {
      scriptingService.deleteVariable(key);
      loadVariables();
    }
  };

  const handleAddNew = () => {
    if (!newKey.trim()) {
      alert('Variable name cannot be empty');
      return;
    }

    try {
      // Try to parse as JSON first
      let parsedValue;
      try {
        parsedValue = JSON.parse(newValue);
      } catch {
        // If not JSON, treat as string
        parsedValue = newValue;
      }

      scriptingService.setVariable(newKey.trim(), parsedValue);
      setNewKey('');
      setNewValue('');
      setShowAddNew(false);
      loadVariables();
    } catch (error) {
      console.error('Error adding variable:', error);
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all variables? This cannot be undone.')) {
      scriptingService.clearVariables();
      loadVariables();
    }
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const variablesArray = Array.from(variables.entries());

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Variables
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {variablesArray.length} variable{variablesArray.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddNew(!showAddNew)}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Add New
          </button>
          {variablesArray.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Add New Variable Form */}
      {showAddNew && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/10">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Add New Variable
          </h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Variable name"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddNew();
                }
              }}
            />
            <input
              type="text"
              placeholder="Variable value (strings, numbers, or JSON)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddNew();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddNew}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddNew(false);
                  setNewKey('');
                  setNewValue('');
                }}
                className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variables List */}
      <div className="flex-1 overflow-auto">
        {variablesArray.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              No variables yet
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Variables are created by scripts or can be added manually. Use them in requests with <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">{'{{variableName}}'}</code>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {variablesArray.map(([key, value]) => (
              <div key={key} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                {editingKey === key ? (
                  // Edit Mode
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {key}
                    </div>
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(key)}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {key}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                        {formatValue(value)}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                        Type: {typeof value}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(key, value)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(key)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with usage hint */}
      {variablesArray.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Use variables in requests with <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono">{'{{variableName}}'}</code>
          </p>
        </div>
      )}
    </div>
  );
}
