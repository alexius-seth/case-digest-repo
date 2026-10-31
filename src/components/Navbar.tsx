"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Case Library", href: "/library" },
  { name: "Create Digest", href: "/create" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname === "/login") return;

    fetchUserProfile();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById(
          "search-input"
        ) as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          router.push("/dashboard?focus=search");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [pathname, router]);

  const fetchUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserEmail(user.email || null);

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
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Case<span className="text-pink-600 dark:text-pink-400">Ko</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400 pb-1 font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Pill Theme Switcher */}
            <ThemeToggle />

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-full cursor-pointer"
                aria-label="User Menu"
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-pink-100 dark:bg-slate-800 flex items-center justify-center">
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
                    <span className="text-sm font-bold text-pink-600 dark:text-pink-400 uppercase">
                      {username ? username[0] : userEmail ? userEmail[0] : "U"}
                    </span>
                  )}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black/5 divide-y divide-slate-100 dark:divide-slate-700 z-50">
                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Signed in as
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {username || userEmail}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      User Profile
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center px-3 mb-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 font-bold flex items-center justify-center mr-3 text-xs">
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
                  <span>{username ? username[0] : userEmail ? userEmail[0] : "U"}</span>
                )}
              </div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {username || userEmail}
              </div>
            </div>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Profile Settings
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
