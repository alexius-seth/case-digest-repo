"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CaseDigest {
  id: string;
  case_title: string;
  gr_number: string;
  legal_classification: string;
  facts: string;
  issues: string;
  ruling: string;
  doctrine: string;
  created_at: string;
}

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [digest, setDigest] = useState<CaseDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("case_digests")
      .select("*")
      .eq("id", caseId)
      .single();

    if (error) {
      console.error("Error fetching case details:", error.message);
    } else {
      setDigest(data);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!digest) return;
    if (!confirm(`Are you sure you want to delete "${digest.case_title}"?`)) return;

    setDeleting(true);
    const { error } = await supabase.from("case_digests").delete().eq("id", caseId);

    if (error) {
      alert(`Error deleting case digest: ${error.message}`);
      setDeleting(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-gray-500">
        Loading case digest details...
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="p-8 sm:p-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
        <h3 className="text-base font-semibold text-foreground">Case Digest Not Found</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          The requested case entry does not exist or has been removed.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-accent hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-row items-center justify-between pb-3 sm:pb-4 border-b border-gray-200 gap-2">
        <Link
          href="/dashboard"
          className="text-xs sm:text-sm font-medium text-gray-600 hover:text-accent transition-colors"
        >
          ← Back to Dashboard
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Digest"}
        </button>
      </div>

      {/* Case Header */}
      <div className="bg-white p-4 sm:p-6 border border-gray-200 rounded-lg space-y-3">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">
          <span className="self-start text-xs px-3 py-1 rounded-full bg-accent-light text-accent-hover font-semibold">
            {digest.legal_classification}
          </span>
          <span className="text-xs font-mono text-gray-500">{digest.gr_number}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground break-words">
          {digest.case_title}
        </h1>
        <p className="text-xs text-gray-400">
          Added on {new Date(digest.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Key Legal Doctrine */}
      <div className="p-4 sm:p-5 bg-pink-50/50 border-l-4 border-accent rounded-r-lg space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-accent-hover">
          Legal Doctrine
        </h2>
        <p className="text-sm sm:text-base font-serif italic text-foreground leading-relaxed break-words">
          "{digest.doctrine}"
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 bg-white p-4 sm:p-6 border border-gray-200 rounded-lg">
        {/* Facts */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-gray-100 pb-1">
            Facts
          </h2>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line break-words">
            {digest.facts}
          </p>
        </section>

        {/* Issues */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-gray-100 pb-1">
            Issues
          </h2>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line break-words">
            {digest.issues}
          </p>
        </section>

        {/* Ruling */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-gray-100 pb-1">
            Ruling
          </h2>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line break-words">
            {digest.ruling}
          </p>
        </section>
      </div>
    </div>
  );
}