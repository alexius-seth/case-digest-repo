"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LEGAL_CLASSIFICATIONS } from "@/lib/constants";
import DoctrineHighlight from "@/components/DoctrineHighlight";

interface CaseDigest {
  id: string;
  case_title: string;
  gr_number: string;
  legal_classification: string;
  doctrine: string | null;
  created_at: string;
}

export default function CaseLibraryPage() {
  const [digests, setDigests] = useState<CaseDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const supabase = createClient();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLibraryDigests = useCallback(
    async (search: string, category: string) => {
      setLoading(true);
      setLoadError(null);

      const trimmedSearch = search.trim();
      let query = supabase
        .from("case_digests")
        .select(
          "id, case_title, gr_number, legal_classification, doctrine, created_at"
        )
        .order("case_title", { ascending: true });

      if (category !== "All") {
        query = query.eq("legal_classification", category);
      }

      if (trimmedSearch) {
        // PostgreSQL Full-Text Search
        query = query.textSearch("fts", trimmedSearch, {
          type: "websearch",
          config: "english",
        });
      }

      const { data, error } = await query;

      if (error) {
        // Fallback for pre-migration environments without FTS column
        if (trimmedSearch && error.message.includes("fts")) {
          let fallbackQuery = supabase
            .from("case_digests")
            .select(
              "id, case_title, gr_number, legal_classification, doctrine, created_at"
            )
            .or(
              `case_title.ilike.%${trimmedSearch}%,gr_number.ilike.%${trimmedSearch}%`
            )
            .order("case_title", { ascending: true });

          if (category !== "All") {
            fallbackQuery = fallbackQuery.eq("legal_classification", category);
          }

          const fallbackResult = await fallbackQuery;
          setDigests(fallbackResult.data || []);
        } else {
          console.error("Error fetching library digests:", error.message);
          setLoadError(
            "Couldn't load your case library. Check your connection and try again."
          );
        }
      } else {
        setDigests(data || []);
      }
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchLibraryDigests(searchQuery, selectedCategory);
    }, 200);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedCategory, fetchLibraryDigests]);

  // Group filtered digests by classification
  const groupedDigests = useMemo(() => {
    const groups: Record<string, CaseDigest[]> = {};
    digests.forEach((item) => {
      if (!groups[item.legal_classification]) {
        groups[item.legal_classification] = [];
      }
      groups[item.legal_classification].push(item);
    });
    return groups;
  }, [digests]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedCategory !== "All";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Case Library
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          Browse and search your legal repository grouped by Philippine Bar subject.
        </p>
      </div>

      {/* Search & Filter Options */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            id="search-input"
            type="text"
            placeholder="Search by title, G.R. number, doctrine, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pr-16 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-accent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
            ⌘K
          </kbd>
        </div>
        <div className="sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-accent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="All">All Categories</option>
            {LEGAL_CLASSIFICATIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs / Filters */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            selectedCategory === "All"
              ? "bg-accent text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          All
        </button>
        {LEGAL_CLASSIFICATIONS.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === cat
                ? "bg-accent text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {loadError ? (
        <div className="p-8 sm:p-12 text-center border-2 border-dashed border-red-200 dark:border-red-900 rounded-lg space-y-3">
          <h3 className="text-base font-semibold text-red-700 dark:text-red-400">
            Something went wrong
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 max-w-md mx-auto">
            {loadError}
          </p>
          <button
            onClick={() => fetchLibraryDigests(searchQuery, selectedCategory)}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-6 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, cardIdx) => (
                  <div
                    key={cardIdx}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm space-y-3 animate-pulse"
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
      ) : digests.length === 0 ? (
        <div className="p-8 sm:p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
          <h3 className="text-base font-semibold text-foreground">
            {hasActiveFilters
              ? "No library cases match your search or filter criteria"
              : "No digests added to your library yet"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {hasActiveFilters
              ? "Try adjusting your search terms or clearing your category filter."
              : "Start organizing your Philippine jurisprudence entries, legal doctrines, and Bar review notes."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <>
                <Link
                  href="/create"
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors inline-block"
                >
                  Add New Digest →
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold rounded transition-colors"
                >
                  Import Cases
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDigests).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                <h2 className="text-base font-bold text-foreground">
                  {category}
                </h2>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
                  {items.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2 mb-4">
                      <Link
                        href={`/case/${item.id}`}
                        className="font-bold text-sm text-foreground hover:text-accent leading-snug wrap-break-word block"
                      >
                        {item.case_title}
                      </Link>
                      <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {item.gr_number}
                      </p>
                      {item.doctrine && (
                        <DoctrineHighlight
                          doctrine={item.doctrine}
                          caseTitle={item.case_title}
                          grNumber={item.gr_number}
                          variant="compact"
                        />
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/case/${item.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        Read →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
