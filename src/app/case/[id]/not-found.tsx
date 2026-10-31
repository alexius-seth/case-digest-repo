import Link from "next/link";

export default function CaseNotFound() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-2">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-foreground">
        Case Digest Not Found
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        This case digest does not exist or has been removed from your repository.
      </p>
      <div className="pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors"
        >
          ← Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

