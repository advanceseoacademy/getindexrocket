"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearAuthClientCache } from "@/lib/auth-client-cache";
import { getOrCreateDeviceId } from "@/lib/device-id";

type GoogleSignInProps = {
  mode: "login" | "register";
};

export function GoogleSignIn({ mode }: GoogleSignInProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(384);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const width = Math.min(400, Math.max(240, Math.floor(el.offsetWidth)));
      setButtonWidth(width);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function handleSuccess(response: CredentialResponse) {
    const credential = response.credential;
    if (!credential) {
      setError("Google sign-in failed. Please try again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential,
          deviceId: getOrCreateDeviceId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Google sign-in failed");
        return;
      }
      clearAuthClientCache();
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
    <div ref={containerRef} className="mx-auto w-full max-w-md">
      <div className={loading ? "pointer-events-none opacity-60" : undefined}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError("Google sign-in failed. Please try again.")}
          theme="filled_black"
          size="large"
          width={buttonWidth}
          text={mode === "register" ? "signup_with" : "signin_with"}
          shape="rectangular"
        />
      </div>
      {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
