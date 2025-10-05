'use client';

export default function RequestBuilder() {
  return (
    <div className="h-full bg-white dark:bg-gray-950 p-4 overflow-auto">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Request Builder
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL
          </label>
          <input
            type="text"
            placeholder="https://api.example.com/endpoint"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Send Request
        </button>
      </div>
    </div>
  );
}
