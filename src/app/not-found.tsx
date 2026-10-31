import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
        404
      </h1>
      <h2 className="text-lg font-semibold text-foreground">Page Not Found</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="pt-2">
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

