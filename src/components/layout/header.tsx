"use client";

import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface HeaderProps {
  user: { name: string; email: string };
}

export function Header({ user }: HeaderProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-end px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-xs font-medium text-white">{initials}</span>
            </div>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {user.name}
            </span>
          </div>

          <button
            onClick={() => signOut()}
            className="text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
