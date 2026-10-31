export default function CaseLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-3">
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Case Header Card skeleton */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded font-mono" />
      </div>

      {/* Doctrine Banner skeleton */}
      <div className="p-5 border-l-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 rounded-r-md space-y-2">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Main Content Body skeleton */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/60 rounded" />
          <div className="h-4 w-11/12 bg-gray-100 dark:bg-gray-700/60 rounded" />
          <div className="h-4 w-4/5 bg-gray-100 dark:bg-gray-700/60 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/60 rounded" />
          <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-700/60 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/60 rounded" />
          <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-700/60 rounded" />
        </div>
      </div>
    </div>
  );
}

