import { create } from 'zustand';
import { Request, Response, Collection, Environment } from '@/types';

interface AppState {
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
  
  // Actions
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
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  currentRequest: null,
  currentResponse: null,
  collections: [],
  history: [],
  environments: [],
  activeEnvironment: null,
  theme: 'dark',
  sidebarCollapsed: false,
  
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
}));
