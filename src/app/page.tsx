'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RequestBuilder from '@/components/RequestBuilder';
import ResponseViewer from '@/components/ResponseViewer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Sidebar - Collections */}
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <Sidebar />
          </Panel>
          
          <PanelResizeHandle className="w-px bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 hover:w-1 transition-all" />
          
          {/* Request Builder */}
          <Panel defaultSize={40} minSize={30}>
            <RequestBuilder />
          </Panel>
          
          <PanelResizeHandle className="w-px bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 hover:w-1 transition-all" />
          
          {/* Response Viewer */}
          <Panel defaultSize={40} minSize={30}>
            <ResponseViewer />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
