'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { environmentService } from '@/lib/environment-service';

export default function Environments() {
  const [isCreating, setIsCreating] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [editingEnv, setEditingEnv] = useState<string | null>(null);
  const [editVariables, setEditVariables] = useState<Record<string, string>>({});
  const [isAddingVariable, setIsAddingVariable] = useState(false);
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');

  const environments = useLiveQuery(() => db.environments.toArray());

  const createEnvironment = async () => {
    if (!newEnvName.trim()) return;
    await environmentService.createEnvironment(newEnvName.trim(), {});
    setNewEnvName('');
    setIsCreating(false);
  };

  const deleteEnvironment = async (id: string) => {
    if (confirm('Delete this environment?')) {
      await environmentService.deleteEnvironment(id);
    }
  };

  const setActive = async (id: string) => {
    await environmentService.setActiveEnvironment(id);
  };

  const startEditing = (id: string, variables: Record<string, string>) => {
    setEditingEnv(id);
    setEditVariables({ ...variables });
  };

  const saveVariables = async () => {
    if (!editingEnv) return;
    await environmentService.updateEnvironment(editingEnv, { variables: editVariables });
    setEditingEnv(null);
    setEditVariables({});
    setIsAddingVariable(false);
    setNewVarKey('');
    setNewVarValue('');
  };

  const startAddingVariable = () => {
    setIsAddingVariable(true);
  };

  const confirmAddVariable = () => {
    if (!newVarKey.trim()) return;
    setEditVariables({ 
      ...editVariables, 
      [newVarKey.trim()]: newVarValue 
    });
    setIsAddingVariable(false);
    setNewVarKey('');
    setNewVarValue('');
  };

  const cancelAddVariable = () => {
    setIsAddingVariable(false);
    setNewVarKey('');
    setNewVarValue('');
  };

  const updateVariable = (key: string, value: string) => {
    setEditVariables({ ...editVariables, [key]: value });
  };

  const deleteVariable = (key: string) => {
    const updated = { ...editVariables };
    delete updated[key];
    setEditVariables(updated);
  };

  if (!environments) {
    return <div className="p-4 text-xs text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Environments
          </h3>
          <button
            onClick={() => setIsCreating(true)}
            className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          >
            + New
          </button>
        </div>

        {isCreating && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
              placeholder="Environment name (e.g., Production)"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createEnvironment();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewEnvName('');
                }
              }}
              autoFocus
            />
            <button
              onClick={createEnvironment}
              className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewEnvName('');
              }}
              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {environments.length === 0 ? (
          <div className="p-4 text-xs text-gray-500 dark:text-gray-400">
            No environments yet. Create one to define variables like baseUrl or apiKey.
          </div>
        ) : (
          environments.map((env) => (
            <div key={env.id} className="border-b border-gray-200 dark:border-gray-800">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={env.isActive}
                      onChange={() => setActive(env.id)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {env.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({Object.keys(env.variables).length} vars)
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditing(env.id, env.variables)}
                      className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEnvironment(env.id)}
                      className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingEnv === env.id && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Variables
                      </span>
                      {!isAddingVariable && (
                        <button
                          onClick={startAddingVariable}
                          className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {/* New variable form */}
                      {isAddingVariable && (
                        <div className="flex gap-2 items-center p-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={newVarKey}
                              onChange={(e) => setNewVarKey(e.target.value)}
                              placeholder="Variable name"
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmAddVariable();
                                if (e.key === 'Escape') cancelAddVariable();
                              }}
                              autoFocus
                            />
                            <input
                              type="text"
                              value={newVarValue}
                              onChange={(e) => setNewVarValue(e.target.value)}
                              placeholder="Value"
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmAddVariable();
                                if (e.key === 'Escape') cancelAddVariable();
                              }}
                            />
                          </div>
                          <button
                            onClick={confirmAddVariable}
                            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                            title="Add variable"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelAddVariable}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Cancel"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Existing variables */}
                      {Object.entries(editVariables).map(([key, value]) => (
                        <div key={key} className="flex gap-2 items-center">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={key}
                              disabled
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => updateVariable(key, e.target.value)}
                              placeholder="Value"
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <button
                            onClick={() => deleteVariable(key)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={saveVariables}
                        className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingEnv(null);
                          setEditVariables({});
                        }}
                        className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
