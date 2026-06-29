"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Settings } from "lucide-react";

export function UserMenu({ mobile = false }: { mobile?: boolean }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const user = session?.user;

  const getUserInitials = () => {
    const name = user?.name || user?.email || "Guest";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          mobile
            ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-mono text-xs font-bold"
            : "flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }
      >
        <div
          className={
            mobile
              ? ""
              : "flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold"
          }
        >
          {getUserInitials()}
        </div>
        {!mobile && (
          <div className="min-w-0 text-left hidden md:block">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user?.name ?? "Guest"}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {user?.email ?? ""}
            </p>
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] py-2 shadow-lg z-50">
            <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {user?.name ?? "Guest"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {user?.email ?? ""}
              </p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Add settings page
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Settings size={16} />
              Settings
            </button>
            <button
              onClick={() => {
                signOut({ callbackUrl: "/login" });
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
