interface DoctrineHighlightProps {
  doctrine: string;
  /** "compact" for card contexts (Dashboard/Library), "full" for the Case Detail banner */
  variant?: "compact" | "full";
  clamp?: boolean;
}

export default function DoctrineHighlight({
  doctrine,
  variant = "compact",
  clamp = true,
}: DoctrineHighlightProps) {
  const isFull = variant === "full";

  return (
    <div
      className={`relative overflow-hidden rounded-r-md border-l-4 border-accent bg-gradient-to-br from-amber-50 to-amber-50/60 dark:from-amber-950/40 dark:to-amber-950/20 ${
        isFull ? "p-5" : "p-3"
      }`}
    >
      {/* Decorative oversized quote mark, bleeding off the top-right corner */}
      <svg
        className="absolute -top-2 right-2 w-10 h-10 text-accent/10 dark:text-accent/15 pointer-events-none"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
      </svg>

      <div className="relative flex items-start gap-2">
        <svg
          className={`shrink-0 text-accent mt-0.5 ${isFull ? "w-4 h-4" : "w-3.5 h-3.5"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
        </svg>

        <div className="min-w-0">
          {isFull && (
            <h3 className="text-[11px] font-bold text-accent uppercase tracking-widest mb-1.5">
              Doctrine
            </h3>
          )}
          <p
            className={`font-serif italic text-gray-800 dark:text-gray-200 leading-relaxed ${
              isFull ? "text-sm sm:text-base" : "text-xs"
            } ${clamp ? "line-clamp-2" : ""}`}
          >
            {doctrine}
          </p>
        </div>
      </div>
    </div>
  );
}