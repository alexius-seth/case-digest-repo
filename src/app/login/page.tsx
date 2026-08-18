"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (isRegistering) {
      if (!username.trim()) {
        setErrorMsg("Username is required.");
        setLoading(false);
        return;
      }

      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setErrorMsg(authError.message);
        setLoading(false);
        return;
      }

      // 2. Create profile row
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ id: authData.user.id, username: username.trim() }]);

        if (profileError) {
          setErrorMsg(profileError.message);
          setLoading(false);
          return;
        }
      }

      alert("Registration successful! You can now sign in.");
      setIsRegistering(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-lg shadow-sm bg-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Case<span className="text-accent">Digest</span>
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {isRegistering ? "Create your personal legal repository account" : "Sign in to access your case digests"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="attorney_doe"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lawyer@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent text-sm text-foreground bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : isRegistering ? "Register Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg(null);
            }}
            className="text-foreground hover:text-accent font-medium underline"
          >
            {isRegistering ? "Already have an account? Sign in" : "Need an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
}