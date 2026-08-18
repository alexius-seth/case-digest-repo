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

export default function DashboardPage() {
  const [digests, setDigests] = useState<CaseDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const supabase = createClient();

  useEffect(() => {
    fetchDigests();
  }, []);

  const fetchDigests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("case_digests")
      .select("id, case_title, gr_number, legal_classification, doctrine, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching digests:", error.message);
    } else {
      setDigests(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const { error } = await supabase.from("case_digests").delete().eq("id", id);
    if (error) {
      alert(`Failed to delete digest: ${error.message}`);
    } else {
      setDigests((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Client-side search and category filtering
  const filteredDigests = useMemo(() => {
    return digests.filter((item) => {
      const matchesSearch =
        item.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.gr_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.legal_classification === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [digests, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Case Digest Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Manage and reference your personal legal repository entries.
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors self-start sm:self-auto"
        >
          + Create New Digest
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search by Case Title or G.R. Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm bg-white"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm bg-white"
          >
            <option value="All">All Classifications</option>
            <option value="Criminal Law">Criminal Law</option>
            <option value="Civil Law">Civil Law</option>
            <option value="Administrative Law">Administrative Law</option>
            <option value="Constitutional Law">Constitutional Law</option>
            <option value="International Law">International Law</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-12 text-center text-sm text-gray-500">
          Loading case digests...
        </div>
      ) : filteredDigests.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
          <h3 className="text-base font-semibold text-foreground">No Digests Found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            {searchQuery || selectedCategory !== "All"
              ? "No entries match your search filters."
              : "Start building your repository by adding your first case digest."}
          </p>
          <Link
            href="/create"
            className="inline-flex items-center text-sm font-medium text-accent hover:underline"
          >
            Create Digest →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDigests.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-foreground hover:text-accent">
                    <Link href={`/case/${item.id}`}>{item.case_title}</Link>
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-light text-accent-hover font-semibold">
                    {item.legal_classification}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{item.gr_number}</span>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2 mb-4 font-serif italic">
                "{item.doctrine}"
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <span className="text-gray-400">
                  Added on {new Date(item.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/case/${item.id}`}
                    className="font-medium text-foreground hover:text-accent"
                  >
                    View Full Digest →
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id, item.case_title)}
                    className="font-medium text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}