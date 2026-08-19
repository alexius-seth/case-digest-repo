"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Criminal Law",
  "Civil Law",
  "Administrative Law",
  "Constitutional Law",
  "International Law",
] as const;

export default function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [caseTitle, setCaseTitle] = useState("");
  const [grNumber, setGrNumber] = useState("");
  const [legalClassification, setLegalClassification] = useState<string>(CATEGORIES[0]);
  const [doctrine, setDoctrine] = useState("");
  const [facts, setFacts] = useState("");
  const [issue, setIssue] = useState("");
  const [ruling, setRuling] = useState("");

  useEffect(() => {
    fetchCaseDigest();
  }, [id]);

  const fetchCaseDigest = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("case_digests")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setErrorMsg("Case digest not found or permission denied.");
    } else {
      setCaseTitle(data.case_title || "");
      setGrNumber(data.gr_number || "");
      setLegalClassification(data.legal_classification || CATEGORIES[0]);
      setDoctrine(data.doctrine || "");
      setFacts(data.facts || "");
      setIssue(data.issues || "");
      setRuling(data.ruling || "");
    }

    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const { error } = await supabase
      .from("case_digests")
      .update({
        case_title: caseTitle.trim(),
        gr_number: grNumber.trim(),
        legal_classification: legalClassification,
        doctrine: doctrine.trim() || null,
        facts: facts.trim(),
        issues: issue.trim(),
        ruling: ruling.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setErrorMsg(error.message);
      setSubmitting(false);
    } else {
      router.push(`/case/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-gray-500">
        Loading digest details for editing...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Edit Case Digest
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Update facts, doctrine, or legal classifications for this entry.
          </p>
        </div>
        <Link
          href={`/case/${id}`}
          className="text-xs font-semibold text-gray-600 hover:text-foreground underline"
        >
          Back to Digest
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6 bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Case Title *
            </label>
            <input
              type="text"
              required
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              G.R. Number / Citation *
            </label>
            <input
              type="text"
              required
              value={grNumber}
              onChange={(e) => setGrNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
            Legal Classification *
          </label>
          <select
            value={legalClassification}
            onChange={(e) => setLegalClassification(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
            Legal Doctrine <span className="text-gray-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={doctrine}
            onChange={(e) => setDoctrine(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
            Facts *
          </label>
          <textarea
            rows={5}
            required
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
            Issue *
          </label>
          <textarea
            rows={3}
            required
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
            Ruling *
          </label>
          <textarea
            rows={5}
            required
            value={ruling}
            onChange={(e) => setRuling(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href={`/case/${id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update Digest"}
          </button>
        </div>
      </form>
    </div>
  );
}