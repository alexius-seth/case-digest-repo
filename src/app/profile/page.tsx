"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [totalDigests, setTotalDigests] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const router = useRouter();
  const supabase = createClient();

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

    // Fetch profile info
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url || null);
    }

    // Fetch total cases count
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
      alert(`Error updating profile: ${error.message}`);
    } else {
      alert("Profile updated successfully!");
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

      // Upload image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      // Save URL to profile record
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: publicUrl, updated_at: new Date().toISOString() });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert(`Error uploading avatar: ${error.message}`);
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

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-gray-500">
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Manage your identity, avatar, and repository settings.
        </p>
      </div>

      <div className="bg-white p-6 border border-gray-200 rounded-lg space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-100">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-accent-light flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-accent uppercase">
                {username ? username[0] : userEmail ? userEmail[0] : "U"}
              </span>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              {uploading ? "Uploading..." : "Change Avatar"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400">JPG, PNG or GIF. 2MB max.</p>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="text"
              disabled
              value={userEmail || ""}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Case Digests
            </span>
            <span className="text-2xl font-bold text-accent">{totalDigests}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account Status
            </span>
            <span className="text-sm font-bold text-green-600 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              Active Session
            </span>
          </div>
        </div>

        {/* Sign Out */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium text-sm rounded transition-colors disabled:opacity-50"
          >
            {signingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}