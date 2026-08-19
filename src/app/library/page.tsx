"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface CaseDigest {
  id: string;
  case_title: string;
  gr_number: string;
  legal_classification: string;
  doctrine: string;
  created_at: string;
}

const CATEGORIES = [
  "Criminal Law",
  "Civil Law",
  "Administrative Law",
  "Constitutional Law",
  "International Law",
] as const;

export default function CaseLibraryPage() {
  const [digests, setDigests] = useState<CaseDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const supabase = createClient();

  useEffect(() => {
    fetchLibraryDigests();
  }, []);

  const fetchLibraryDigests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("case_digests")
      .select("id, case_title, gr_number, legal_classification, doctrine, created_at")
      .order("case_title", { ascending: true });

    if (error) {
      console.error("Error fetching library digests:", error.message);
    } else {
      setDigests(data || []);
    }
    setLoading(false);
  };

  const filteredDigests = useMemo(() => {
    return digests.filter((item) => {
      const matchesSearch =
        item.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.gr_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.doctrine.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.legal_classification === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [digests, searchQuery, selectedCategory]);

  // Group filtered digests by classification
  const groupedDigests = useMemo(() => {
    const groups: Record<string, CaseDigest[]> = {};
    filteredDigests.forEach((item) => {
      if (!groups[item.legal_classification]) {
        groups[item.legal_classification] = [];
      }
      groups[item.legal_classification].push(item);
    });
    return groups;
  }, [filteredDigests]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Case Library
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Browse and search your legal repository grouped by classification.
        </p>
      </div>

      {/* Search & Filter Options */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by title, G.R. number, or doctrine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm bg-white"
          />
        </div>
        <div className="sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm bg-white"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
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
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            selectedCategory === "All"
              ? "bg-accent text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({digests.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = digests.filter((d) => d.legal_classification === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-sm text-gray-500">
          Loading library entries...
        </div>
      ) : filteredDigests.length === 0 ? (
        <div className="p-8 sm:p-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
          <h3 className="text-base font-semibold text-foreground">No Library Entries Found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            {searchQuery || selectedCategory !== "All"
              ? "No cases match your filter criteria."
              : "No digests added yet."}
          </p>
          <Link
            href="/create"
            className="inline-flex items-center text-sm font-medium text-accent hover:underline"
          >
            Add New Digest →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDigests).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                <h2 className="text-base font-bold text-foreground">{category}</h2>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {items.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link
                          href={`/case/${item.id}`}
                          className="font-bold text-sm text-foreground hover:text-accent leading-snug wrap-break-word"
                        >
                          {item.case_title}
                        </Link>
                      </div>
                      <p className="text-xs font-mono text-gray-500 mb-2">{item.gr_number}</p>
                      <p className="text-xs text-gray-700 line-clamp-3 font-serif italic mb-4">
                        "{item.doctrine}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
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