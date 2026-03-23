"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
    <path
      fill="#FFC107"
      d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 39.6 16.3 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37 38.4 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"
    />
  </svg>
);

const ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback: "Google sign-in failed. Please try again.",
  OAuthSignin: "Could not start Google sign-in. Please try again.",
  OAuthAccountNotLinked:
    "This email is already registered. Sign in with your password instead.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to continue.",
  Default: "Something went wrong. Please try again.",
};

export default function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const errorCode = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default) : "",
  );
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGoogle = async () => {
    setError("");
    setGLoading(true);
    await signIn("google", { callbackUrl });
  };

  const handleGuest = () => {
    if (guestLoading || loading || gLoading) return;
    setGuestLoading(true);
    const dest = "/checkout";
    router.push(dest);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(ERROR_MESSAGES.CredentialsSignin);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-3 sm:px-4 py-6">
      <div className="w-full max-w-lg sm:max-w-md">
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
            <h1 className="font-display text-2xl font-black text-stone-900">
              Welcome back
            </h1>
            <p className="text-stone-400 text-sm mt-0.5">
              Sign in to your account to continue.
            </p>
          </div>

          {/* Google */}
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

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-xs font-medium text-stone-400">or</span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          <button
            type="button"
            onClick={handleGuest}
            disabled={guestLoading || loading || gLoading}
            className="w-full mb-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-60"
          >
            {guestLoading ? "Continuing as guest..." : "Continue as guest"}
          </button>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
              <div className="mt-2 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-amber-600 font-semibold hover:text-amber-700"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || gLoading}
              className="w-full bg-stone-900 hover:bg-stone-700 disabled:bg-stone-300 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-stone-400">
            Don&apos;t have an account?{" "}
            <Link
              href={`/auth/signup${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="text-amber-600 font-semibold hover:text-amber-700"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
