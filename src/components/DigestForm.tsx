"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  caseDigestSchema,
  type CaseDigestInput,
  LEGAL_CLASSIFICATIONS,
} from "@/lib/validations/digest";
import { SUBCATEGORIES_BY_CLASSIFICATION } from "@/lib/constants";

interface DigestFormProps {
  initialData?: Partial<CaseDigestInput>;
  onSubmit: (data: CaseDigestInput) => Promise<void>;
  submitLabel: string;
}

export default function DigestForm({
  initialData,
  onSubmit,
  submitLabel,
}: DigestFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<CaseDigestInput>({
    case_title: initialData?.case_title ?? "",
    gr_number: initialData?.gr_number ?? "",
    legal_classification:
      initialData?.legal_classification ?? LEGAL_CLASSIFICATIONS[0],
    subcategory: initialData?.subcategory ?? "",
    doctrine: initialData?.doctrine ?? "",
    facts: initialData?.facts ?? "",
    issues: initialData?.issues ?? "",
    ruling: initialData?.ruling ?? "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availableSubcategories =
    SUBCATEGORIES_BY_CLASSIFICATION[formData.legal_classification] || [];

  const handleClassificationChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      legal_classification: value as CaseDigestInput["legal_classification"],
      subcategory: "",
    }));
    if (fieldErrors.legal_classification) {
      setFieldErrors((prev) => ({ ...prev, legal_classification: "" }));
    }
  };

  const handleChange = (field: keyof CaseDigestInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const result = caseDigestSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString();
        if (path && !errors[path]) {
          errors[path] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(result.data);
    } catch (err: any) {
      setGeneralError(
        err.message || "An unexpected error occurred while saving."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getInputClass = (field: keyof CaseDigestInput) =>
    `w-full px-3 py-2 border rounded focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors ${
      fieldErrors[field]
        ? "border-red-500 dark:border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
        : "border-gray-300 dark:border-gray-700 focus:border-accent"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
    >
      {generalError && (
        <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded">
          {generalError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
            Case Title *
          </label>
          <input
            type="text"
            value={formData.case_title}
            onChange={(e) => handleChange("case_title", e.target.value)}
            placeholder="e.g., People of the Philippines v. Santos"
            className={getInputClass("case_title")}
          />
          {fieldErrors.case_title && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors.case_title}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
            G.R. Number / Citation *
          </label>
          <input
            type="text"
            value={formData.gr_number}
            onChange={(e) => handleChange("gr_number", e.target.value)}
            placeholder="e.g., G.R. No. 201234, Jan 15, 2020"
            className={getInputClass("gr_number")}
          />
          {fieldErrors.gr_number && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors.gr_number}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
            Legal Classification *
          </label>
          <select
            value={formData.legal_classification}
            onChange={(e) => handleClassificationChange(e.target.value)}
            className={getInputClass("legal_classification")}
          >
            {LEGAL_CLASSIFICATIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {fieldErrors.legal_classification && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors.legal_classification}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
            Subcategory{" "}
            <span className="text-gray-400 font-normal lowercase">
              (optional)
            </span>
          </label>
          <select
            value={formData.subcategory ?? ""}
            onChange={(e) => handleChange("subcategory", e.target.value)}
            disabled={availableSubcategories.length === 0}
            className={`${getInputClass("subcategory")} disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed`}
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
          Legal Doctrine{" "}
          <span className="text-gray-400 font-normal lowercase">
            (optional)
          </span>
        </label>
        <textarea
          rows={2}
          value={formData.doctrine ?? ""}
          onChange={(e) => handleChange("doctrine", e.target.value)}
          placeholder="Summarize the key takeaway or principle laid down by the court..."
          className={getInputClass("doctrine")}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
          Facts *
        </label>
        <textarea
          rows={5}
          value={formData.facts}
          onChange={(e) => handleChange("facts", e.target.value)}
          placeholder="Essential background facts of the case..."
          className={getInputClass("facts")}
        />
        {fieldErrors.facts && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {fieldErrors.facts}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
          Issue *
        </label>
        <textarea
          rows={3}
          value={formData.issues}
          onChange={(e) => handleChange("issues", e.target.value)}
          placeholder="Key legal question(s) raised..."
          className={getInputClass("issues")}
        />
        {fieldErrors.issues && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {fieldErrors.issues}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
          Ruling *
        </label>
        <textarea
          rows={5}
          value={formData.ruling}
          onChange={(e) => handleChange("ruling", e.target.value)}
          placeholder="Court decision and rationale..."
          className={getInputClass("ruling")}
        />
        {fieldErrors.ruling && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {fieldErrors.ruling}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

