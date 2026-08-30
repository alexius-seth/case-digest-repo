import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toastprovider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseKo",
  description:
    "Organize, reference, and review Philippine case digests, legal doctrines, and Bar subjects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased flex flex-col transition-colors duration-200">
<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
  <ToastProvider>
    <Navbar />
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
      {children}
    </main>
  </ToastProvider>
</ThemeProvider>
      </body>
    </html>
  );
}