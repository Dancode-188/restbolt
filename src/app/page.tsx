'use client';

import { useState, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useStore } from '@/lib/store';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Tabs from '@/components/Tabs';
import RequestBuilder from '@/components/RequestBuilder';
import ResponseViewer from '@/components/ResponseViewer';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { HistoryItem } from '@/lib/db';
import { Request } from '@/types';

export default function Home() {
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const sidebarRef = useRef<any>(null);
  
  // Global keyboard shortcuts
  // Ctrl/Cmd+B - Toggle sidebar
  useHotkeys('ctrl+b, meta+b', (e) => {
    e.preventDefault();
    setSidebarCollapsed(prev => !prev);
  });

  // Ctrl/Cmd+Shift+/ - Show keyboard shortcuts
  // Also adding Ctrl+Shift+? as alternative
  useHotkeys(['ctrl+shift+/', 'meta+shift+/', 'ctrl+shift+?', 'meta+shift+?', 'ctrl+?', 'meta+?'], (e) => {
    e.preventDefault();
    setShowShortcuts(true);
  }, { enableOnFormTags: true });

  // Esc - Close modals
  useHotkeys('esc', (e) => {
    if (showShortcuts) {
      e.preventDefault();
      setShowShortcuts(false);
    }
  });

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setSelectedRequest(null); // Clear collection selection
  };

  const handleSelectRequest = (request: Request) => {
    setSelectedRequest(request);
    setSelectedHistoryItem(null); // Clear history selection
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header onShowShortcuts={() => setShowShortcuts(true)} />
      
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Sidebar - History and Collections */}
          {!sidebarCollapsed && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30} ref={sidebarRef}>
                <Sidebar 
                  onSelectHistoryItem={handleSelectHistoryItem}
                  onSelectRequest={handleSelectRequest}
                />
              </Panel>
              
              <PanelResizeHandle className="w-px bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 hover:w-1 transition-all" />
            </>
          )}
          
          {/* Request Builder */}
          <Panel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col">
              <Tabs />
              <div className="flex-1 overflow-hidden">
                <RequestBuilder 
                  selectedHistoryItem={selectedHistoryItem}
                  selectedRequest={selectedRequest}
                />
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-px bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 hover:w-1 transition-all" />
          
          {/* Response Viewer */}
          <Panel defaultSize={40} minSize={30}>
            <ResponseViewer />
          </Panel>
        </PanelGroup>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
