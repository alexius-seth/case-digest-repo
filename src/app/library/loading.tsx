export default function LibraryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800 space-y-2">
        <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Search & Filter Options */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 sm:w-56 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"
          />
        ))}
      </div>

      {/* Main Content Groups */}
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, groupIdx) => (
          <div key={groupIdx} className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-6 bg-gray-100 dark:bg-gray-800 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, cardIdx) => (
                <div
                  key={cardIdx}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xs space-y-3"
                >
                  <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-12 w-full bg-gray-100 dark:bg-gray-700/50 rounded-r-md border-l-4 border-gray-200 dark:border-gray-700" />
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

