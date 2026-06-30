"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { UserMenu } from "./user-menu";
import { useSession } from "next-auth/react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const { data: session } = useSession();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100">
      <aside className="hidden w-60 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] px-4 py-5 md:flex">
        <div className="mb-8 px-1 flex items-center gap-2">
          <img src="/planora_logo.png" alt="Planora" className="h-8 w-auto" />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <NavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
          <NavItem
            href="/dashboard/calendar"
            icon={CalendarDays}
            label="Calendar"
            active={pathname === "/dashboard/calendar"}
          />
          <NavItem
            href="/dashboard/ai"
            icon={Sparkles}
            label="AI Assistant"
            active={pathname === "/dashboard/ai"}
          />
        </nav>

        <div className="mt-auto border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <UserMenu />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0C0C0C]/80 backdrop-blur-md px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <span className="font-display text-sm font-semibold">
                Planora
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {getGreeting()}
                {session?.user?.name
                  ? `, ${session.user.name.split(" ")[0]}`
                  : ""}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatDate()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="hidden md:block">
              <UserMenu />
            </div>
            <div className="md:hidden">
              <UserMenu mobile />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${
        active
          ? "bg-blue-50 dark:bg-blue-900/20 font-medium text-blue-600 dark:text-blue-400"
          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
