"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toastprovider";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function CaseActions({ digestId }: { digestId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("case_digests")
      .delete()
      .eq("id", digestId);

    if (error) {
      showToast(`Error deleting digest: ${error.message}`, "error");
      setDeleting(false);
      setShowConfirm(false);
    } else {
      showToast("Case digest deleted successfully.", "success");
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print / Export PDF
        </button>
        <Link
          href={`/case/${digestId}/edit`}
          className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold rounded transition-colors"
        >
          Edit Digest
        </Link>
        <button
          onClick={() => setShowConfirm(true)}
          className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-semibold rounded transition-colors cursor-pointer"
        >
          Delete Digest
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Case Digest"
        description="Are you sure you want to permanently delete this case digest? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onClose={() => setShowConfirm(false)}
      />
    </>
  );
}

