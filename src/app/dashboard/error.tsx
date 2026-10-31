"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="p-8 sm:p-12 text-center border-2 border-dashed border-red-200 dark:border-red-900 rounded-lg space-y-3">
      <h3 className="text-base font-semibold text-red-700 dark:text-red-400">
        Couldn&apos;t load your case digests
      </h3>
      <p className="text-sm text-red-600 dark:text-red-400 max-w-md mx-auto">
        There was a problem communicating with the repository database. Please check your connection and retry.
      </p>
      <div>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

