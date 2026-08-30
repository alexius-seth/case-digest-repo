"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === "success";

  return (
    <div
      role="status"
      className={`fixed top-4 right-4 left-4 sm:left-auto z-[100] flex items-start gap-3 w-auto sm:w-96 p-4 rounded-lg shadow-lg border animate-in fade-in slide-in-from-top-2 duration-300 ${
        isSuccess
          ? "bg-white dark:bg-gray-800 border-green-200 dark:border-green-900"
          : "bg-white dark:bg-gray-800 border-red-200 dark:border-red-900"
      }`}
    >
      <div
        className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
          isSuccess
            ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
            : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
        }`}
      >
        {isSuccess ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      <p className="flex-1 text-sm text-gray-800 dark:text-gray-100 leading-snug">{message}</p>

      <button
        onClick={onClose}
        className="shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
} 