'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useHotkeys } from 'react-hotkeys-hook';
import ConfirmDialog from './ConfirmDialog';

export default function Tabs() {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useStore();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [tabToClose, setTabToClose] = useState<string | null>(null);

  // Keyboard shortcuts for tabs
  // Alt+T - New tab (avoiding browser Ctrl+T conflict)
  useHotkeys('alt+t', (e) => {
    e.preventDefault();
    addTab();
  });

  // Alt+W - Close current tab (avoiding browser Ctrl+W conflict)
  useHotkeys('alt+w', (e) => {
    e.preventDefault();
    if (activeTabId) {
      const tab = tabs.find(t => t.id === activeTabId);
      if (tab?.isDirty) {
        setTabToClose(activeTabId);
        setShowCloseConfirm(true);
      } else {
        closeTab(activeTabId);
      }
    }
  });

  // Ctrl/Cmd+1-9 - Switch to tab by number
  useHotkeys('ctrl+1, meta+1', (e) => { e.preventDefault(); tabs[0] && setActiveTab(tabs[0].id); });
  useHotkeys('ctrl+2, meta+2', (e) => { e.preventDefault(); tabs[1] && setActiveTab(tabs[1].id); });
  useHotkeys('ctrl+3, meta+3', (e) => { e.preventDefault(); tabs[2] && setActiveTab(tabs[2].id); });
  useHotkeys('ctrl+4, meta+4', (e) => { e.preventDefault(); tabs[3] && setActiveTab(tabs[3].id); });
  useHotkeys('ctrl+5, meta+5', (e) => { e.preventDefault(); tabs[4] && setActiveTab(tabs[4].id); });
  useHotkeys('ctrl+6, meta+6', (e) => { e.preventDefault(); tabs[5] && setActiveTab(tabs[5].id); });
  useHotkeys('ctrl+7, meta+7', (e) => { e.preventDefault(); tabs[6] && setActiveTab(tabs[6].id); });
  useHotkeys('ctrl+8, meta+8', (e) => { e.preventDefault(); tabs[7] && setActiveTab(tabs[7].id); });
  useHotkeys('ctrl+9, meta+9', (e) => { e.preventDefault(); tabs[8] && setActiveTab(tabs[8].id); });

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if tab has unsaved changes
    const tab = tabs.find(t => t.id === id);
    if (tab?.isDirty) {
      setTabToClose(id);
      setShowCloseConfirm(true);
      return;
    }
    
    closeTab(id);
  };

  const confirmClose = () => {
    if (tabToClose) {
      closeTab(tabToClose);
      setTabToClose(null);
    }
    setShowCloseConfirm(false);
  };

  const cancelClose = () => {
    setTabToClose(null);
    setShowCloseConfirm(false);
  };

  const tabName = tabs.find(t => t.id === tabToClose)?.name || 'this tab';

  return (
    <>
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-2 py-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-t text-sm transition-colors min-w-[120px] max-w-[200px] ${
              activeTabId === tab.id
                ? 'bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border-t-2 border-blue-600'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="flex-1 truncate text-left">
              {tab.isDirty && <span className="text-blue-600 mr-1">•</span>}
              {tab.name}
            </span>
            <div
              onClick={(e) => handleCloseTab(tab.id, e)}
              className="flex-shrink-0 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Close tab"
              role="button"
              tabIndex={0}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
        ))}
        
        <button
          onClick={addTab}
          className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title="New tab"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <ConfirmDialog
        isOpen={showCloseConfirm}
        title="Close Tab"
        message={`"${tabName}" has unsaved changes. Are you sure you want to close it?`}
        confirmText="Close Tab"
        cancelText="Keep Editing"
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </>
  );
}
