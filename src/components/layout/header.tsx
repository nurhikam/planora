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
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">P</span>
          </div>
          <span className="text-sm font-medium tracking-tight">Planora</span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-md bg-muted">
            <div className="h-5 w-5 rounded bg-muted-foreground/20 flex items-center justify-center">
              <span className="text-xs font-medium">{initials}</span>
            </div>
            <span className="text-xs text-muted-foreground">{user.name}</span>
          </div>

          <button
            onClick={() => signOut()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
