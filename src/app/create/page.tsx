"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DigestForm from "@/components/DigestForm";
import type { CaseDigestInput } from "@/lib/validations/digest";

export default function CreateDigestPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (formData: CaseDigestInput) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("You must be logged in to create a digest.");
    }

    const { data: existing } = await supabase
      .from("case_digests")
      .select("id, case_title")
      .eq("user_id", user.id)
      .eq("gr_number", formData.gr_number)
      .maybeSingle();

    if (existing) {
      throw new Error(
        `A digest with this G.R. number already exists: "${existing.case_title}".`
      );
    }

    const { data, error } = await supabase
      .from("case_digests")
      .insert({
        user_id: user.id,
        case_title: formData.case_title,
        gr_number: formData.gr_number,
        legal_classification: formData.legal_classification,
        subcategory: formData.subcategory,
        doctrine: formData.doctrine,
        facts: formData.facts,
        issues: formData.issues,
        ruling: formData.ruling,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
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

      <DigestForm onSubmit={handleCreate} submitLabel="Save Digest" />
    </div>
  );
}
