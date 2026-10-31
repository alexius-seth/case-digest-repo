"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toastprovider";
import {
  exportToCSV,
  exportToJSON,
  getExportFilename,
  triggerFileDownload,
  parseCSV,
  validateImportDigests,
} from "@/lib/export-import";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-accent text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500";

interface CaseDigestExport {
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

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [totalDigests, setTotalDigests] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Export / Import state
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  // Change email state
  const [newEmail, setNewEmail] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);
    setUserEmail(user.email || "N/A");

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url || null);
      setAvatarError(false);
    }

    const { count } = await supabase
      .from("case_digests")
      .select("*", { count: "exact", head: true });

    if (count !== null) setTotalDigests(count);

    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, username: username.trim(), updated_at: new Date().toISOString() });

    if (error) {
      showToast(`Error updating profile: ${error.message}`, "error");
    } else {
      showToast("Profile updated successfully!", "success");
    }
    setUpdating(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0 || !userId) return;

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: publicUrl, updated_at: new Date().toISOString() });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setAvatarError(false);
    } catch (error: any) {
      showToast(`Error uploading avatar: ${error.message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // ---------- Export ----------
  const handleExport = async (format: "json" | "csv") => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from("case_digests")
        .select("case_title, gr_number, legal_classification, subcategory, doctrine, facts, issues, ruling, created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const filename = getExportFilename(format);
      if (format === "json") {
        const jsonStr = exportToJSON(data || []);
        const blob = new Blob([jsonStr], { type: "application/json" });
        triggerFileDownload(blob, filename);
      } else {
        const csvStr = exportToCSV(data || []);
        const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
        triggerFileDownload(blob, filename);
      }
      showToast(`Exported digests as ${filename}`, "success");
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`, "error");
    } finally {
      setExporting(false);
    }
  };

  // ---------- Import ----------
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportMsg(null);
    if (!e.target.files || e.target.files.length === 0 || !userId) return;

    const file = e.target.files[0];
    const isJson = file.name.endsWith(".json");
    const isCsv = file.name.endsWith(".csv");

    if (!isJson && !isCsv) {
      setImportMsg("Please upload a .json or .csv export file.");
      e.target.value = "";
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      let rawRecords: unknown[] = [];

      if (isJson) {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error("JSON file must contain an array of case digests.");
        }
        rawRecords = parsed;
      } else {
        rawRecords = parseCSV(text);
      }

      const { validRows, errors } = validateImportDigests(rawRecords);

      if (validRows.length === 0) {
        const firstError = errors[0]?.errors[0] || "No valid rows found.";
        throw new Error(`No valid digests could be imported. Error: ${firstError}`);
      }

      const rowsToInsert = validRows.map((row) => ({
        ...row,
        user_id: userId,
      }));

      const { error } = await supabase.from("case_digests").insert(rowsToInsert);
      if (error) throw error;

      const successMsg = `Imported ${validRows.length} digest(s) successfully.${
        errors.length > 0 ? ` (${errors.length} invalid row(s) skipped)` : ""
      }`;
      setImportMsg(successMsg);
      showToast(successMsg, "success");
      fetchProfileData();
    } catch (err: any) {
      const errMsg = `Import failed: ${err.message}`;
      setImportMsg(errMsg);
      showToast(errMsg, "error");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  // ---------- Change Email ----------
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);

    if (!newEmail.trim() || newEmail.trim() === userEmail) {
      setEmailMsg("Enter a different email address.");
      return;
    }

    setEmailSubmitting(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });

    if (error) {
      setEmailMsg(error.message);
    } else {
      setEmailMsg("Confirmation links have been sent to both your old and new email addresses. Your email won't change until you confirm.");
      setNewEmail("");
    }
    setEmailSubmitting(false);
  };

  // ---------- Change Password ----------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match.");
      return;
    }

    setPasswordSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMsg(error.message);
    } else {
      setPasswordMsg("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSubmitting(false);
  };

  // ---------- Delete Account ----------
  const handleDeleteAccount = async () => {
    setDeleteError(null);

    if (deleteConfirmText !== "DELETE") {
      setDeleteError('Type "DELETE" exactly to confirm.');
      return;
    }

    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session found.");

      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: session.access_token }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete account.");

      await supabase.auth.signOut();
      router.push("/login");
    } catch (err: any) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-6 animate-pulse">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-100 dark:border-gray-700">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="space-y-2">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-9 w-full bg-gray-100 dark:bg-gray-700/50 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-9 w-full bg-gray-100 dark:bg-gray-700/50 rounded" />
            </div>
            <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="h-20 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
            <div className="h-20 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your identity, avatar, and repository settings.
        </p>
      </div>

      {/* ---------- Identity Card ---------- */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-accent-light flex items-center justify-center">
            {avatarUrl && !avatarError ? (
              <Image
                src={avatarUrl}
                alt="Profile Avatar"
                fill
                unoptimized
                onError={() => setAvatarError(true)}
                className="object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-accent uppercase">
                {username ? username[0] : userEmail ? userEmail[0] : "U"}
              </span>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              {uploading ? "Uploading..." : "Change Avatar"}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500">JPG, PNG or GIF. 2MB max.</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="text"
              disabled
              value={userEmail || ""}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., attorney_santos"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded transition-colors disabled:opacity-50"
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Case Digests
            </span>
            <span className="text-2xl font-bold text-accent">{totalDigests}</span>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Account Status
            </span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              Active Session
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Data Management ---------- */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Data Management
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Back up your repository, or bring digests in from a previous export.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport("json")}
            disabled={exporting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold rounded transition-colors disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export as JSON"}
          </button>
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold rounded transition-colors disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export as CSV"}
          </button>
          <label className="cursor-pointer px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold rounded transition-colors">
            {importing ? "Importing..." : "Import (JSON / CSV)"}
            <input type="file" accept=".json,.csv" onChange={handleImport} disabled={importing} className="hidden" />
          </label>
        </div>

        {importMsg && (
          <p className={`text-xs ${importMsg.startsWith("Import failed") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
            {importMsg}
          </p>
        )}
      </div>

      {/* ---------- Change Email ---------- */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Change Email
        </h2>
        <form onSubmit={handleChangeEmail} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              New Email Address
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new.email@example.com"
              className={inputClass}
            />
          </div>
          {emailMsg && (
            <p className={`text-xs ${emailMsg.toLowerCase().includes("fail") || emailMsg.toLowerCase().includes("error") ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300"}`}>
              {emailMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={emailSubmitting}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded transition-colors disabled:opacity-50"
          >
            {emailSubmitting ? "Sending..." : "Update Email"}
          </button>
        </form>
      </div>

      {/* ---------- Change Password ---------- */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {passwordMsg && (
            <p className={`text-xs ${passwordMsg.toLowerCase().includes("success") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {passwordMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordSubmitting}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded transition-colors disabled:opacity-50"
          >
            {passwordSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* ---------- Sign Out ---------- */}
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 font-medium text-sm rounded transition-colors disabled:opacity-50"
        >
          {signingOut ? "Signing Out..." : "Sign Out"}
        </button>
      </div>

      {/* ---------- Danger Zone: Delete Account ---------- */}
      <div className="bg-red-50/50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-900 rounded-lg space-y-3">
        <h2 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
          Danger Zone
        </h2>
        <p className="text-xs text-red-600 dark:text-red-400">
          Permanently delete your account, all {totalDigests} case digest(s), and your profile. This cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
          >
            Delete My Account
          </button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-red-200 dark:border-red-900">
            <p className="text-xs text-red-700 dark:text-red-300 font-medium">
              Type <span className="font-mono font-bold">DELETE</span> below to confirm. This action is permanent.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full sm:w-64 px-3 py-2 border border-red-300 dark:border-red-800 rounded focus:outline-none focus:border-red-500 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            />
            {deleteError && (
              <p className="text-xs text-red-600 dark:text-red-400">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== "DELETE"}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Permanently Delete Account"}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeleteError(null); }}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}