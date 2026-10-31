"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DigestForm from "@/components/DigestForm";
import type { CaseDigestInput } from "@/lib/validations/digest";

export default function EditCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<CaseDigestInput | null>(null);

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
      setInitialData({
        case_title: data.case_title,
        gr_number: data.gr_number,
        legal_classification:
          data.legal_classification as CaseDigestInput["legal_classification"],
        subcategory: data.subcategory,
        doctrine: data.doctrine,
        facts: data.facts,
        issues: data.issues,
        ruling: data.ruling,
      });
    }

    setLoading(false);
  };

  const handleUpdate = async (formData: CaseDigestInput) => {
    const { error } = await supabase
      .from("case_digests")
      .update({
        case_title: formData.case_title,
        gr_number: formData.gr_number,
        legal_classification: formData.legal_classification,
        subcategory: formData.subcategory,
        doctrine: formData.doctrine,
        facts: formData.facts,
        issues: formData.issues,
        ruling: formData.ruling,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    router.push(`/case/${id}`);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
        Loading digest details for editing...
      </div>
    );
  }

  if (errorMsg || !initialData) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          {errorMsg || "Digest Not Found"}
        </h2>
        <Link href="/dashboard" className="text-sm text-accent hover:underline">
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Edit Case Digest
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update facts, doctrine, or legal classifications for this entry.
          </p>
        </div>
        <Link
          href={`/case/${id}`}
          className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-foreground underline"
        >
          Back to Digest
        </Link>
      </div>

      <DigestForm
        initialData={initialData}
        onSubmit={handleUpdate}
        submitLabel="Update Digest"
      />
    </div>
  );
}
