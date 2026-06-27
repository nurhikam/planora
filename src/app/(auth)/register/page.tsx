"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthLayout from "@/components/layout/auth-layout";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created! Check your email to verify.");
        router.push("/login");
      } else {
        if (data.details && Array.isArray(data.details)) {
          const emailError = data.details.find(
            (d: { field?: string; message?: string }) => d.field === "email",
          );
          if (emailError?.message) {
            setError(emailError.message);
            toast.error(emailError.message);
          } else {
            setError(data.error || "Registration failed");
            toast.error(data.error || "Registration failed");
          }
        } else {
          setError(data.error || "Registration failed");
          toast.error(data.error || "Registration failed");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Start organizing your tasks by date.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white"
          />
        </div>
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
            placeholder="At least 6 characters"
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 dark:text-blue-400"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
