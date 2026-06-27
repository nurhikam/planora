"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthLayout from "@/components/layout/auth-layout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || "Invalid credentials");
        toast.error(result.error || "Invalid credentials");
      } else {
        toast.success("Welcome back");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Log in to see what&apos;s on today.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3"
        autoComplete="off"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            disabled={loading}
            autoComplete="off"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            autoComplete="new-password"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-600 dark:text-blue-400"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
