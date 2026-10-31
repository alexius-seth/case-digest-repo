export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800 space-y-2">
        <div className="h-7 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-3">
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Case List Cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xs flex gap-3.5 items-start"
          >
            <div className="mt-1 w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              </div>
              <div className="h-12 w-full bg-gray-100 dark:bg-gray-700/50 rounded-r-md border-l-4 border-gray-200 dark:border-gray-700" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded font-mono" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

