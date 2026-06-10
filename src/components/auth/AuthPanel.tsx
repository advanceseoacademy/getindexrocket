"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";

type AuthPanelProps = {
  mode: "login" | "register";
};

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function AuthPanel({ mode }: AuthPanelProps) {
  const content = (
    <div className="space-y-6">
      {googleClientId ? (
        <>
          <GoogleSignIn mode={mode} />
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--card-border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-[var(--bg)] px-2 text-[var(--muted)]">or</span>
            </div>
          </div>
        </>
      ) : null}
      <AuthForm mode={mode} />
    </div>
  );

  if (!googleClientId) return content;

  return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
}
