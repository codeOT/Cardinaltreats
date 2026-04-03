"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 39.6 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37 38.4 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

const Divider = () => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-stone-100" />
    <span className="text-xs font-medium text-stone-400">or</span>
    <div className="flex-1 h-px bg-stone-100" />
  </div>
);

export default function SignUpForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState<string | null>(null);
  const [verifyMode, setVerifyMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleGoogle = async () => {
    setGLoading(true);
    await signIn("google", { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res  = await fetch("/api/auth/signup", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error || "Unable to create account");
      setLoading(false);
      return;
    }

    setLoading(false);
    setVerifyMode(true);
    setSuccess(data.message || "Account created. Enter the code we sent to your email.");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: verificationCode.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Unable to verify email");
        return;
      }

      const signinRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });
      if (signinRes?.error) {
        router.push("/auth/signin");
      } else if (signinRes?.url) {
        router.push(signinRes.url);
      } else {
        router.push("/auth/signin");
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Unable to resend code");
        return;
      }
      setSuccess(data.message || "Verification code sent.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12 mt-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
                         src="/images/ct.png"
                         alt="Cardinal Treats"
                         width={420}
                         height={100}
                         className="h-24 w-auto"
                       />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 space-y-5">
          <div>
            <h1 className="font-display text-2xl font-black text-stone-900">Create account</h1>
            <p className="text-sm text-stone-400 mt-0.5">
              Save details for faster checkout &amp; order tracking.
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={gLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold transition-all disabled:opacity-60 shadow-sm"
          >
            {gLoading ? (
              <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <Divider />

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          {!verifyMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text" value={name} required
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm placeholder-stone-300 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email" value={email} required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm placeholder-stone-300 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password" value={password} required minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm placeholder-stone-300 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
            </div>

            <button
              type="submit" disabled={loading || gLoading}
              className="w-full px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-700 disabled:bg-stone-300 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Create Account
            </button>
          </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={verificationCode}
                  required
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit code"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm placeholder-stone-300 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                />
                <p className="text-xs text-stone-500 mt-1">Sent to {email}</p>
              </div>
              <button
                type="submit"
                disabled={verifyLoading}
                className="w-full px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-700 disabled:bg-stone-300 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                {verifyLoading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Verify Email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold disabled:opacity-60"
              >
                {resendLoading ? "Resending..." : "Resend code"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-stone-400">
            Already have an account?{" "}
            <Link
              href={`/auth/signin${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="text-amber-600 font-semibold hover:text-amber-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}