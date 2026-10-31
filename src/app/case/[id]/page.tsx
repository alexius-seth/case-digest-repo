import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateLegalSourceLinks } from "@/lib/ph-law";
import DoctrineHighlight from "@/components/DoctrineHighlight";
import CaseActions from "@/components/CaseActions";

export default async function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: digest, error } = await supabase
    .from("case_digests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !digest) {
    notFound();
  }

  const legalSources = generateLegalSourceLinks(digest.gr_number);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Print-Only Header Branding */}
      <div className="hidden print:block text-xs font-mono text-gray-500 mb-4 pb-2 border-b border-gray-300">
        CaseKo — Philippine Jurisprudence Repository & Bar Review Brief
      </div>

      {/* Navigation and Action Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 print:hidden">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-foreground transition-colors"
        >
          ← Back to Dashboard
        </Link>

        <CaseActions digestId={digest.id} />
      </div>

      {/* Case Header Card */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 print:border-none print:p-0 print:shadow-none print-avoid-break">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-accent-light text-accent rounded-full print:border print:border-gray-300 print:bg-white print:text-black">
              {digest.legal_classification}
            </span>
            {digest.subcategory && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 print:border-gray-300 print:bg-white print:text-black">
                {digest.subcategory}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 print:text-gray-600">
            Added on {new Date(digest.created_at).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground print:text-xl leading-tight">
          {digest.case_title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <p className="text-sm font-mono text-gray-600 dark:text-gray-300 print:text-black print:font-semibold">
            {digest.gr_number}
          </p>
          <div className="flex items-center gap-2 print:hidden">
            {legalSources.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors"
                title={`Open on ${source.name}`}
              >
                {source.name} ↗
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Doctrine Banner */}
      {digest.doctrine && (
        <div className="print-avoid-break">
          <DoctrineHighlight
            doctrine={digest.doctrine}
            caseTitle={digest.case_title}
            grNumber={digest.gr_number}
            variant="full"
            clamp={false}
          />
        </div>
      )}

      {/* Main Content Body */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-6 print:border-none print:p-0 print:space-y-4 print:shadow-none">
        <div className="print-avoid-break">
          <h2 className="text-xs font-bold text-foreground print:text-black uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-700 print:border-gray-300 mb-3">
            Facts of the Case
          </h2>
          <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 print:text-black whitespace-pre-line leading-relaxed sm:leading-loose">
            {digest.facts}
          </p>
        </div>

        <div className="print-avoid-break">
          <h2 className="text-xs font-bold text-foreground print:text-black uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-700 print:border-gray-300 mb-3">
            Issue
          </h2>
          <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 print:text-black whitespace-pre-line leading-relaxed sm:leading-loose">
            {digest.issues}
          </p>
        </div>

        <div className="print-avoid-break">
          <h2 className="text-xs font-bold text-foreground print:text-black uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-700 print:border-gray-300 mb-3">
            Ruling
          </h2>
          <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 print:text-black whitespace-pre-line leading-relaxed sm:leading-loose">
            {digest.ruling}
          </p>
        </div>
      </div>

      {/* External Sources Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 print:hidden">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Full-Text Sources (Philippine Legal Repositories)
          </h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Read the complete official decision and opinions on external legal
          databases:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {legalSources.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-accent dark:hover:border-accent rounded shadow-xs text-left transition-all hover:shadow group"
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
