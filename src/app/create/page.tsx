"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LEGAL_CLASSIFICATIONS, SUBCATEGORIES_BY_CLASSIFICATION } from "@/lib/constants";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-accent text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500";

export default function CreateDigestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [caseTitle, setCaseTitle] = useState("");
  const [grNumber, setGrNumber] = useState("");
  const [legalClassification, setLegalClassification] = useState<string>(LEGAL_CLASSIFICATIONS[0]);
  const [subcategory, setSubcategory] = useState<string>("");
  const [doctrine, setDoctrine] = useState("");
  const [facts, setFacts] = useState("");
  const [issue, setIssue] = useState("");
  const [ruling, setRuling] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableSubcategories = SUBCATEGORIES_BY_CLASSIFICATION[legalClassification] || [];

  const handleClassificationChange = (value: string) => {
    setLegalClassification(value);
    setSubcategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMsg("You must be logged in to create a digest.");
      setSubmitting(false);
      return;
    }

    const trimmedGrNumber = grNumber.trim();

    const { data: existing } = await supabase
      .from("case_digests")
      .select("id, case_title")
      .eq("user_id", user.id)
      .eq("gr_number", trimmedGrNumber)
      .maybeSingle();

    if (existing) {
      setErrorMsg(`A digest with this G.R. number already exists: "${existing.case_title}".`);
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("case_digests")
      .insert([
        {
          user_id: user.id,
          case_title: caseTitle.trim(),
          gr_number: trimmedGrNumber,
          legal_classification: legalClassification,
          subcategory: subcategory || null,
          doctrine: doctrine.trim() || null,
          facts: facts.trim(),
          issues: issue.trim(),
          ruling: ruling.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message);
      setSubmitting(false);
    } else if (data) {
      router.push(`/case/${data.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Create Case Digest
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          Add a new Philippine jurisprudence entry to your repository.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
      >
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
              placeholder="e.g., People of the Philippines v. Santos"
              className={inputClass}
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
              placeholder="e.g., G.R. No. 201234, Jan 15, 2020"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Legal Classification *
            </label>
            <select
              value={legalClassification}
              onChange={(e) => handleClassificationChange(e.target.value)}
              className={inputClass}
            >
              {LEGAL_CLASSIFICATIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Subcategory <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={availableSubcategories.length === 0}
              className={`${inputClass} disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed`}
            >
              <option value="">Select Subcategory...</option>
              {availableSubcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
            Legal Doctrine <span className="text-gray-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={doctrine}
            onChange={(e) => setDoctrine(e.target.value)}
            placeholder="Summarize the key takeaway or principle laid down by the court..."
            className={inputClass}
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
            placeholder="Essential background facts of the case..."
            className={inputClass}
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
            placeholder="Key legal question(s) raised..."
            className={inputClass}
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
            placeholder="Court decision and rationale..."
            className={inputClass}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving Digest..." : "Save Digest"}
          </button>
        </div>
      </form>
    </div>
  );
}