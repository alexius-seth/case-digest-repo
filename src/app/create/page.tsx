"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { createClient } from "@/lib/supabase/client";

// Zod Input Validation Schema
// Zod Input Validation Schema
const CaseDigestSchema = z.object({
  case_title: z.string().min(3, "Case Title must be at least 3 characters"),
  gr_number: z
    .string()
    .min(3, "G.R. Number is required")
    .regex(/^[A-Za-z0-9\s\-\.\,\/]+$/, "G.R. Number contains invalid characters"),
  legal_classification: z.enum([
    "Criminal Law",
    "Civil Law",
    "Administrative Law",
    "Constitutional Law",
    "International Law",
  ], { message: "Please select a valid legal classification" }),
  facts: z.string().min(10, "Facts section must be at least 10 characters"),
  issues: z.string().min(5, "Issues section must be at least 5 characters"),
  ruling: z.string().min(10, "Ruling section must be at least 10 characters"),
  doctrine: z.string().min(5, "Doctrine section must be at least 5 characters"),
});


type FormErrors = Partial<Record<keyof z.infer<typeof CaseDigestSchema>, string>>;

export default function CreateCaseDigestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    case_title: "",
    gr_number: "",
    legal_classification: "Criminal Law",
    facts: "",
    issues: "",
    ruling: "",
    doctrine: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    // 1. Zod Input Validation
    const validation = CaseDigestSchema.safeParse(formData);
    if (!validation.success) {
      const formattedErrors: FormErrors = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof FormErrors;
        formattedErrors[path] = issue.message;
      });
      setErrors(formattedErrors);
      setSubmitting(false);
      return;
    }

    // 2. Fetch Active Authenticated User
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      alert("Session expired. Please log in again.");
      router.push("/login");
      return;
    }

    // 3. XSS Sanitization
    const sanitizedData = {
      user_id: user.id, // Enforce User Ownership
      case_title: DOMPurify.sanitize(validation.data.case_title.trim()),
      gr_number: DOMPurify.sanitize(validation.data.gr_number.trim()),
      legal_classification: validation.data.legal_classification,
      facts: DOMPurify.sanitize(validation.data.facts.trim()),
      issues: DOMPurify.sanitize(validation.data.issues.trim()),
      ruling: DOMPurify.sanitize(validation.data.ruling.trim()),
      doctrine: DOMPurify.sanitize(validation.data.doctrine.trim()),
    };

    // 4. Secure Database Insertion
    const { error } = await supabase.from("case_digests").insert([sanitizedData]);

    if (error) {
      alert(`Error saving digest: ${error.message}`);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Case Digest</h1>
        <p className="text-sm text-gray-600">Add a structured legal case entry to your repository.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 border border-gray-200 rounded-lg">
        {/* Case Title & G.R. Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
              Case Title *
            </label>
            <input
              type="text"
              name="case_title"
              value={formData.case_title}
              onChange={handleChange}
              placeholder="e.g., People v. Santos"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm"
            />
            {errors.case_title && <p className="text-xs text-red-600 mt-1">{errors.case_title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
              G.R. Number *
            </label>
            <input
              type="text"
              name="gr_number"
              value={formData.gr_number}
              onChange={handleChange}
              placeholder="e.g., G.R. No. 123456"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm"
            />
            {errors.gr_number && <p className="text-xs text-red-600 mt-1">{errors.gr_number}</p>}
          </div>
        </div>

        {/* Legal Classification Dropdown */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
            Legal Classification *
          </label>
          <select
            name="legal_classification"
            value={formData.legal_classification}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm bg-white"
          >
            <option value="Criminal Law">Criminal Law</option>
            <option value="Civil Law">Civil Law</option>
            <option value="Administrative Law">Administrative Law</option>
            <option value="Constitutional Law">Constitutional Law</option>
            <option value="International Law">International Law</option>
          </select>
          {errors.legal_classification && <p className="text-xs text-red-600 mt-1">{errors.legal_classification}</p>}
        </div>

        {/* Facts */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
            Facts *
          </label>
          <textarea
            name="facts"
            rows={4}
            value={formData.facts}
            onChange={handleChange}
            placeholder="Summarize the essential background facts..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm"
          />
          {errors.facts && <p className="text-xs text-red-600 mt-1">{errors.facts}</p>}
        </div>

        {/* Issues */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
            Issues *
          </label>
          <textarea
            name="issues"
            rows={3}
            value={formData.issues}
            onChange={handleChange}
            placeholder="List the key legal questions..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm"
          />
          {errors.issues && <p className="text-xs text-red-600 mt-1">{errors.issues}</p>}
        </div>

        {/* Ruling */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
            Ruling *
          </label>
          <textarea
            name="ruling"
            rows={4}
            value={formData.ruling}
            onChange={handleChange}
            placeholder="Detail the Court's decision..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm"
          />
          {errors.ruling && <p className="text-xs text-red-600 mt-1">{errors.ruling}</p>}
        </div>

        {/* Doctrine */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
            Doctrine *
          </label>
          <textarea
            name="doctrine"
            rows={3}
            value={formData.doctrine}
            onChange={handleChange}
            placeholder="Extract the primary principle established..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm"
          />
          {errors.doctrine && <p className="text-xs text-red-600 mt-1">{errors.doctrine}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving Case Digest..." : "Save Case Digest"}
        </button>
      </form>
    </div>
  );
}