"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Toast, { ToastType } from "@/components/Toast";
import { useToast } from "@/components/Toastprovider";

const inputClass =
  "w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-accent text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    // Eye-off icon (currently visible, click to hide)
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
  ) : (
    // Eye icon (currently hidden, click to show)
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      if (!username.trim()) {
        showToast("Username is required.", "error");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username.trim() },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) {
        showToast(authError.message, "error");
        setLoading(false);
        return;
      }

      showToast("Registration successful! Check your email to confirm your account, then sign in.", "success");
      setIsRegistering(false);
      setPassword("");
      setConfirmPassword("");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        showToast(error.message, "error");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Case<span className="text-accent">Ko</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {isRegistering ? "Create your personal legal repository account" : "Sign in to access your case digests"}
          </p>
        </div>

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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-accent text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-accent text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Processing..." : isRegistering ? "Register Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-foreground hover:text-accent font-medium underline cursor-pointer"
          >
            {isRegistering ? "Already have an account? Sign in" : "Need an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
}