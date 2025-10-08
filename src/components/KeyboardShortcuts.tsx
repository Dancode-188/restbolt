'use client';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcuts({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Request Management',
      items: [
        { keys: ['⌘/Ctrl', 'Enter'], description: 'Send request' },
        { keys: ['⌘/Ctrl', 'K'], description: 'Focus URL bar' },
        { keys: ['⌘/Ctrl', 'H'], description: 'Toggle headers section' },
        { keys: ['⌘/Ctrl', '/'], description: 'Toggle body section' },
      ],
    },
    {
      category: 'Tab Management',
      items: [
        { keys: ['⌘/Ctrl', 'T'], description: 'New tab' },
        { keys: ['⌘/Ctrl', 'W'], description: 'Close current tab' },
        { keys: ['⌘/Ctrl', '1-9'], description: 'Switch to tab 1-9' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['⌘/Ctrl', 'B'], description: 'Toggle sidebar' },
        { keys: ['⌘/Ctrl', '?'], description: 'Show this help' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[600px] max-w-full mx-4 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {shortcuts.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIdx) => (
                        <span key={keyIdx} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono text-gray-900 dark:text-gray-100">
                            {key}
                          </kbd>
                          {keyIdx < item.keys.length - 1 && (
                            <span className="text-gray-500 dark:text-gray-400">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
