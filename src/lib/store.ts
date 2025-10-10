import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Request, Response, Collection, Environment } from '@/types';

export interface Tab {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Array<{ key: string; value: string; enabled: boolean }>;
  body: string;
  isDirty: boolean;
}

interface AppState {
  // Tabs
  tabs: Tab[];
  activeTabId: string | null;
  
  // Current request/response
  currentRequest: Request | null;
  currentResponse: Response | null;
  
  // Collections and history
  collections: Collection[];
  history: Request[];
  
  // Environments
  environments: Environment[];
  activeEnvironment: Environment | null;
  
  // UI state
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  
  // Response comparison
  comparisonMode: boolean;
  comparisonResponse: Response | null;
  
  // Request chaining
  chainVariables: Record<string, any>;
  
  // Actions
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  setCurrentRequest: (request: Request | null) => void;
  setCurrentResponse: (response: Response | null) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, collection: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  addToHistory: (request: Request) => void;
  setEnvironments: (environments: Environment[]) => void;
  setActiveEnvironment: (environment: Environment | null) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setComparisonMode: (mode: boolean, response?: Response | null) => void;
  clearComparison: () => void;
  setChainVariables: (variables: Record<string, any>) => void;
  mergeChainVariables: (variables: Record<string, any>) => void;
  clearChainVariables: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      tabs: [{
        id: 'default',
        name: 'New Request',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts',
        headers: [],
        body: '{\n  "title": "Example Todo",\n  "completed": false\n}',
        isDirty: false,
      }],
      activeTabId: 'default',
      currentRequest: null,
      currentResponse: null,
      collections: [],
      history: [],
      environments: [],
      activeEnvironment: null,
      theme: 'dark',
      sidebarCollapsed: false,
      comparisonMode: false,
      comparisonResponse: null,
      chainVariables: {},
      
      // Tab actions
      addTab: () => set((state) => {
        const newTab: Tab = {
          id: `tab-${Date.now()}`,
          name: 'New Request',
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts',
          headers: [],
          body: '{\n  "title": "Example Todo",\n  "completed": false\n}',
          isDirty: false,
        };
        return {
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        };
      }),
      
      closeTab: (id) => set((state) => {
        const tabs = state.tabs.filter(t => t.id !== id);
        // Don't allow closing the last tab
        if (tabs.length === 0) {
          return {
            tabs: [{
              id: 'default',
              name: 'New Request',
              method: 'GET',
              url: 'https://jsonplaceholder.typicode.com/posts',
              headers: [],
              body: '{\n  "title": "Example Todo",\n  "completed": false\n}',
              isDirty: false,
            }],
            activeTabId: 'default',
          };
        }
        // If closing active tab, switch to the next tab or previous
        let newActiveTabId = state.activeTabId;
        if (id === state.activeTabId) {
          const closedIndex = state.tabs.findIndex(t => t.id === id);
          newActiveTabId = tabs[Math.min(closedIndex, tabs.length - 1)]?.id || tabs[0].id;
        }
        return {
          tabs,
          activeTabId: newActiveTabId,
        };
      }),
      
      setActiveTab: (id) => set({ activeTabId: id }),
      
      updateTab: (id, updates) => set((state) => ({
        tabs: state.tabs.map(tab =>
          tab.id === id ? { ...tab, ...updates, isDirty: true } : tab
        ),
      })),
      
      // Actions
      setCurrentRequest: (request) => set({ currentRequest: request }),
      setCurrentResponse: (response) => set({ currentResponse: response }),
  
  addCollection: (collection) => set((state) => ({
    collections: [...state.collections, collection],
  })),
  
  updateCollection: (id, updates) => set((state) => ({
    collections: state.collections.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    ),
  })),
  
  deleteCollection: (id) => set((state) => ({
    collections: state.collections.filter(c => c.id !== id),
  })),
  
  addToHistory: (request) => set((state) => ({
    history: [request, ...state.history].slice(0, 50), // Keep last 50
  })),
  
  setEnvironments: (environments) => set({ environments }),
  
  setActiveEnvironment: (environment) => set({ activeEnvironment: environment }),
  
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light',
  })),
  
  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed,
  })),
  
  setComparisonMode: (mode, response) => set({
    comparisonMode: mode,
    comparisonResponse: response || null,
  }),
  
  clearComparison: () => set({
    comparisonMode: false,
    comparisonResponse: null,
  }),
  
  setChainVariables: (variables) => set({ chainVariables: variables }),
  
  mergeChainVariables: (variables) => {
    console.log('🏪 Store mergeChainVariables called with:', variables); // ← Debug log
    
    // Filter out undefined and null values to keep the store clean
    const cleanedVariables = Object.entries(variables).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      } else {
        console.log(`⚠️ Skipping ${key} because value is ${value}`);
      }
      return acc;
    }, {} as Record<string, any>);
    
    console.log('🧹 Cleaned variables (removed undefined/null):', cleanedVariables); // ← Debug log
    
    set((state) => {
      const newChainVars = {
        ...state.chainVariables,
        ...cleanedVariables,
      };
      console.log('🏪 New chainVariables:', newChainVars); // ← Debug log
      return { chainVariables: newChainVars };
    });
  },
  
  clearChainVariables: () => set({ chainVariables: {} }),
}),
  {
    name: 'restbolt-storage',
    partialize: (state) => ({
      tabs: state.tabs,
      activeTabId: state.activeTabId,
      theme: state.theme,
      chainVariables: state.chainVariables, // ← Add this!
    }),
  }
));
