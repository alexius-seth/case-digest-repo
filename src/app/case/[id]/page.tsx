"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateLegalSourceLinks } from "@/lib/ph-law";
import DoctrineHighlight from "@/components/DoctrineHighlight";

interface CaseDigest {
  id: string;
  case_title: string;
  gr_number: string;
  legal_classification: string;
  subcategory: string | null;
  doctrine: string | null;
  facts: string;
  issues: string;
  ruling: string;
  created_at: string;
}

export default function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [digest, setDigest] = useState<CaseDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchDigestDetails();
  }, [id]);

  const fetchDigestDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("case_digests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching digest:", error.message);
    } else {
      setDigest(data);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this case digest?")) return;

    setDeleting(true);
    const { error } = await supabase.from("case_digests").delete().eq("id", id);

    if (error) {
      alert(`Error deleting digest: ${error.message}`);
      setDeleting(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
        Loading case digest...
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-foreground">Case Digest Not Found</h2>
        <Link href="/dashboard" className="text-sm text-accent hover:underline">
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  const legalSources = generateLegalSourceLinks(digest.gr_number);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Print-Only Header Branding */}
      <div className="hidden print:block text-xs font-mono text-gray-400 mb-4 pb-2 border-b border-gray-200">
        CaseKo — Personal Case Repository
      </div>

      {/* Navigation and Action Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 print:hidden">
        <Link href="/dashboard" className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-foreground">
          ← Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Export PDF
          </button>
          <Link
            href={`/case/${digest.id}/edit`}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold rounded transition-colors"
          >
            Edit Digest
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-semibold rounded transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Digest"}
          </button>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 print:border-none print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-accent-light text-accent rounded-full print:border print:border-gray-300">
              {digest.legal_classification}
            </span>
            {digest.subcategory && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 print:border-gray-300">
                {digest.subcategory}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Added on {new Date(digest.created_at).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
          {digest.case_title}
        </h1>
        <p className="text-sm font-mono text-gray-500 dark:text-gray-400">{digest.gr_number}</p>
      </div>

      {/* Doctrine Banner */}
      {digest.doctrine && (
        <DoctrineHighlight doctrine={digest.doctrine} variant="full" clamp={false} />
      )}

      {/* Main Content Body */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-6 print:border-none print:p-0">
        <div>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-700 mb-3">
            Facts of the Case
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {digest.facts}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-700 mb-3">
            Issue
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {digest.issues}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-700 mb-3">
            Ruling
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {digest.ruling}
          </p>
        </div>
      </div>

      {/* External Sources Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 print:hidden">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Full-Text Sources (Philippine Legal Repositories)
          </h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Read the complete official decision and opinions on external legal databases:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {legalSources.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-accent dark:hover:border-accent rounded shadow-sm text-left transition-all hover:shadow group"
            >
              <div className="text-xs font-bold text-foreground group-hover:text-accent">
                {source.name} ↗
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                {source.description}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}