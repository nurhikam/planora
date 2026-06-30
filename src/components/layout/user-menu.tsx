"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function UserMenu({ mobile = false }: { mobile?: boolean }) {
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const user = session?.user;

  const getUserInitials = () => {
    const name = user?.name || user?.email || "Guest";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      await update();
      toast.success("Profile updated!");
      setProfileOpen(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const openProfile = () => {
    setName(session?.user?.name || "");
    setProfileOpen(true);
    setIsOpen(false);
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
              onClick={openProfile}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <User size={16} />
              Edit Profile
            </button>
            <button
              onClick={() => {
                signOut({ callbackUrl: "/login" });
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </>
      )}

      {/* Profile Edit Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Email
              </label>
              <Input
                value={user?.email || ""}
                disabled
                className="w-full bg-zinc-100 dark:bg-zinc-800"
              />
              <p className="text-xs text-zinc-500">Email cannot be changed</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProfileOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={loading || !name.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
