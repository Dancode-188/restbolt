'use client';

export default function Sidebar() {
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Collections
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        No collections yet
      </p>
    </div>
  );
}
