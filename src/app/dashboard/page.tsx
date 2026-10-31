"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  LEGAL_CLASSIFICATIONS,
  SUBCATEGORIES_BY_CLASSIFICATION,
} from "@/lib/constants";
import DoctrineHighlight from "@/components/DoctrineHighlight";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toastprovider";

interface CaseDigest {
  id: string;
  case_title: string;
  gr_number: string;
  legal_classification: string;
  subcategory: string | null;
  doctrine: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const [digests, setDigests] = useState<CaseDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");

  // Batch Operations State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  const supabase = createClient();
  const { showToast } = useToast();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDigests = useCallback(
    async (search: string, category: string, subcategory: string) => {
      setLoading(true);
      setLoadError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const trimmedSearch = search.trim();
      let query = supabase
        .from("case_digests")
        .select(
          "id, case_title, gr_number, legal_classification, subcategory, doctrine, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (category !== "All") {
        query = query.eq("legal_classification", category);
      }

      if (subcategory !== "All") {
        query = query.eq("subcategory", subcategory);
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
          const fallbackQuery = supabase
            .from("case_digests")
            .select(
              "id, case_title, gr_number, legal_classification, subcategory, doctrine, created_at"
            )
            .eq("user_id", user.id)
            .or(
              `case_title.ilike.%${trimmedSearch}%,gr_number.ilike.%${trimmedSearch}%`
            )
            .order("created_at", { ascending: false });

          const fallbackResult = await fallbackQuery;
          if (fallbackResult.data) {
            setDigests(fallbackResult.data);
          } else {
            setLoadError("Search query failed. Please try again.");
          }
        } else {
          setLoadError(
            "Couldn't load your case digests. Check your connection and try again."
          );
        }
      } else if (data) {
        setDigests(data);
      }

      setLoading(false);
    },
    [supabase]
  );

  // Focus search input if directed by ?focus=search
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("focus") === "search") {
        const searchInput = document.getElementById(
          "search-input"
        ) as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    }
  }, []);

  // Trigger search on filter changes with debouncing on search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchDigests(searchQuery, selectedCategory, selectedSubcategory);
    }, 200);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedCategory, selectedSubcategory, fetchDigests]);

  const toggleSelectAll = () => {
    if (selectedIds.length === digests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(digests.map((d) => d.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsDeletingBatch(true);
    const { error } = await supabase
      .from("case_digests")
      .delete()
      .in("id", selectedIds);

    if (error) {
      showToast(`Failed to delete items: ${error.message}`, "error");
    } else {
      showToast(
        `${selectedIds.length} digest(s) deleted successfully.`,
        "success"
      );
      setDigests(digests.filter((d) => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    }
    setIsDeletingBatch(false);
    setShowBatchDeleteConfirm(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedSubcategory("All");
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== "All" ||
    selectedSubcategory !== "All";

  const subcategoryOptions =
    selectedCategory !== "All" &&
    SUBCATEGORIES_BY_CLASSIFICATION[selectedCategory]
      ? SUBCATEGORIES_BY_CLASSIFICATION[selectedCategory]
      : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Case Digest Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage, search, and reference your personal legal repository entries.
        </p>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            id="search-input"
            type="text"
            placeholder="Search by title, G.R. number, doctrine, or keywords (e.g., search, warrantless)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pr-16 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-accent"
          />
          <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 pointer-events-none">
            ⌘K
          </kbd>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory("All");
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-accent"
          >
            <option value="All">All Classifications</option>
            {LEGAL_CLASSIFICATIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={
              selectedCategory === "All" || subcategoryOptions.length === 0
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 focus:outline-none focus:border-accent"
          >
            <option value="All">All Subcategories</option>
            {subcategoryOptions.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Batch Operations Bar */}
      {digests.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={
                selectedIds.length === digests.length && digests.length > 0
              }
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-accent border-gray-300 cursor-pointer"
            />
            Select All ({digests.length})
          </label>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-gray-600 dark:text-gray-300 font-semibold">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => setShowBatchDeleteConfirm(true)}
                disabled={isDeletingBatch}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeletingBatch ? "Deleting..." : "Delete Selected"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Case List Cards */}
      {loadError ? (
        <div className="p-8 sm:p-12 text-center border-2 border-dashed border-red-200 dark:border-red-900 rounded-lg">
          <h3 className="text-base font-semibold text-red-700 dark:text-red-400">
            Something went wrong
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1 mb-4">
            {loadError}
          </p>
          <button
            onClick={() =>
              fetchDigests(searchQuery, selectedCategory, selectedSubcategory)
            }
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex gap-3.5 items-start animate-pulse"
            >
              <div className="mt-1 w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                </div>
                <div className="h-14 w-full bg-gray-100 dark:bg-gray-700/50 rounded-r-md border-l-4 border-gray-200 dark:border-gray-700" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : digests.length === 0 ? (
        <div className="p-8 sm:p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
          <h3 className="text-base font-semibold text-foreground">
            {hasActiveFilters
              ? "No matching case digests found"
              : "No digests in your repository yet"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {hasActiveFilters
              ? "No case digests match your search or filter criteria. Try adjusting your query or resetting filters."
              : "Start organizing your Philippine jurisprudence entries, legal doctrines, and Bar review notes."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            ) : (
              <>
                <Link
                  href="/create"
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors"
                >
                  Create First Digest
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
        <div className="space-y-3">
          {digests.map((digest) => {
            const isChecked = selectedIds.includes(digest.id);
            return (
              <div
                key={digest.id}
                className={`bg-white dark:bg-gray-800 p-5 border rounded-lg transition-all shadow-sm flex gap-3.5 items-start ${
                  isChecked
                    ? "border-accent ring-1 ring-accent/30 bg-accent-light/10 dark:bg-accent/10"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSelectOne(digest.id)}
                  className="mt-1 w-4 h-4 rounded accent-accent border-gray-300 cursor-pointer"
                />

                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Link
                      href={`/case/${digest.id}`}
                      className="text-base font-bold text-gray-900 dark:text-white hover:text-accent dark:hover:text-accent transition-colors"
                    >
                      {digest.case_title}
                    </Link>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-accent-light text-accent rounded-full">
                        {digest.legal_classification}
                      </span>
                      {digest.subcategory && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600">
                          {digest.subcategory}
                        </span>
                      )}
                    </div>
                  </div>

                  {digest.doctrine && (
                    <DoctrineHighlight
                      doctrine={digest.doctrine}
                      caseTitle={digest.case_title}
                      grNumber={digest.gr_number}
                      variant="compact"
                    />
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-mono">{digest.gr_number}</span>
                    <Link
                      href={`/case/${digest.id}`}
                      className="font-semibold text-gray-900 dark:text-white hover:text-accent dark:hover:text-accent transition-colors"
                    >
                      View Full Digest →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={showBatchDeleteConfirm}
        title="Delete Selected Case Digests"
        description={`Are you sure you want to permanently delete ${selectedIds.length} selected case digest(s)? This action cannot be undone.`}
        confirmText="Delete Selected"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeletingBatch}
        onConfirm={handleBatchDelete}
        onClose={() => setShowBatchDeleteConfirm(false)}
      />
    </div>
  );
}
