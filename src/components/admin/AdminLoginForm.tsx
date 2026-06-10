"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
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
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign in failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-4">
      <div>
        <label className="mb-1.5 block text-sm text-[var(--muted)]">Admin email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[10px] border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-[var(--muted)]">Password</label>
        <input
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-[10px] border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          placeholder="••••••••"
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[10px] bg-[var(--accent)] py-3 font-semibold text-[var(--on-accent)] disabled:opacity-60 btn-primary"
      >
        {loading ? "Please wait..." : "Sign in to admin"}
      </button>
    </form>
  );
}
