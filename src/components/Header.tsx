'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { environmentService } from '@/lib/environment-service';

interface HeaderProps {
  onShowShortcuts: () => void;
}

export default function Header({ onShowShortcuts }: HeaderProps) {
  const { theme, toggleTheme } = useStore();
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);

  const environments = useLiveQuery(() => db.environments.toArray());
  const activeEnv = environments?.find(env => env.isActive);

  const switchEnvironment = async (id: string) => {
    await environmentService.setActiveEnvironment(id);
    setShowEnvDropdown(false);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <header className="h-12 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            RestBolt
          </h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            v0.1.0
          </span>
        </div>

        {/* Environment Switcher */}
        {environments && environments.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowEnvDropdown(!showEnvDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>{activeEnv ? activeEnv.name : 'No Environment'}</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showEnvDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded shadow-lg z-50">
                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => switchEnvironment(env.id)}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      env.isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{env.name}</span>
                      {env.isActive && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onShowShortcuts}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Show keyboard shortcuts"
          title="Keyboard shortcuts (⌘/Ctrl + ?)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
