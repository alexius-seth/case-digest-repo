"use client";

import { useState } from "react";

interface DoctrineHighlightProps {
  doctrine: string;
  caseTitle?: string;
  grNumber?: string;
  /** "compact" for card contexts (Dashboard/Library), "full" for the Case Detail banner */
  variant?: "compact" | "full";
  clamp?: boolean;
}

export default function DoctrineHighlight({
  doctrine,
  caseTitle,
  grNumber,
  variant = "compact",
  clamp = true,
}: DoctrineHighlightProps) {
  const isFull = variant === "full";
  const [copied, setCopied] = useState(false);

  const handleCopyCitation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const grPart = grNumber
      ? grNumber.startsWith("G.R.")
        ? grNumber
        : `G.R. No. ${grNumber}`
      : "";

    const citation = caseTitle
      ? `"${doctrine.trim()}"\n— ${caseTitle.trim()}${grPart ? `, ${grPart.trim()}` : ""}`
      : `"${doctrine.trim()}"`;

    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API blocked
    }
  };

  return (
    <div
      className={`relative group overflow-hidden rounded-r-md border-l-4 border-accent bg-gradient-to-br from-amber-50 to-amber-50/60 dark:from-amber-950/40 dark:to-amber-950/20 ${
        isFull ? "p-5" : "p-3"
      }`}
    >
      {/* Decorative oversized quote mark */}
      <svg
        className="absolute -top-2 right-2 w-10 h-10 text-accent/10 dark:text-accent/15 pointer-events-none"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
      </svg>

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <svg
            className={`shrink-0 text-accent mt-0.5 ${
              isFull ? "w-4 h-4" : "w-3.5 h-3.5"
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
          </svg>

          <div className="min-w-0 flex-1">
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

        {/* 1-Click Copy Citation Button */}
        <button
          type="button"
          onClick={handleCopyCitation}
          className="shrink-0 px-2 py-1 text-[11px] font-medium rounded border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:text-accent dark:hover:text-accent hover:border-accent transition-all shadow-2xs opacity-90 group-hover:opacity-100 flex items-center gap-1 cursor-pointer print:hidden"
          title="Copy doctrine with formal Philippine citation"
          aria-label="Copy citation"
        >
          {copied ? (
            <span className="text-green-600 dark:text-green-400 font-semibold">
              Copied Citation!
            </span>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copy Citation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
