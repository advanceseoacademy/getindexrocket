"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      const next = searchParams.get("next") ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-4">
      {mode === "register" && (
        <div>
          <label className="mb-1.5 block text-sm text-[var(--muted)]">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[10px] border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--green)]"
            placeholder="Your name"
          />
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-sm text-[var(--muted)]">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[10px] border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--green)]"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-[var(--muted)]">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-[10px] border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--green)]"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[10px] bg-[var(--green)] py-3 font-semibold text-[#050f08] disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
      </button>

      <p className="text-center text-sm text-[var(--muted)]">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/register" className="text-[var(--green)] no-underline">
              Create account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--green)] no-underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
