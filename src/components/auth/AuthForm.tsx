"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { clearAuthClientCache } from "@/lib/auth-client-cache";
import { getOrCreateDeviceId } from "@/lib/device-id";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const nextQuery = nextParam ? `?next=${encodeURIComponent(nextParam)}` : "";

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
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
          ...(mode === "register" ? { deviceId: getOrCreateDeviceId() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      clearAuthClientCache();
      const next = nextParam ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-4" aria-busy={loading}>
      {mode === "register" && (
        <div>
          <label htmlFor="auth-name" className="mb-1.5 block text-sm text-[var(--muted)]">
            Name
          </label>
          <input
            id="auth-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="w-full rounded-[10px] border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--accent-12)]"
            placeholder="Your name"
          />
        </div>
      )}
      <div>
        <label htmlFor="auth-email" className="mb-1.5 block text-sm text-[var(--muted)]">
          Email
        </label>
        <input
          id="auth-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={error ? true : undefined}
          className="w-full rounded-[10px] border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--accent-12)]"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="auth-password" className="mb-1.5 block text-sm text-[var(--muted)]">
          Password
        </label>
        <input
          id="auth-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          aria-invalid={error ? true : undefined}
          className="w-full rounded-[10px] border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--accent-12)]"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p id="auth-error" role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-md btn-block"
        aria-describedby={error ? "auth-error" : undefined}
      >
        {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>

      <p className="text-center text-sm text-[var(--muted)]">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href={`/register${nextQuery}`} className="text-[var(--green)] no-underline">
              Create account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login${nextQuery}`} className="text-[var(--green)] no-underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
