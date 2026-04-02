"use client";

import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      const session = await getSession();
      const access = session?.user?.staffAccess;
      if (!access) {
        setError("This account does not have admin or staff access.");
        return;
      }
      router.replace(callbackUrl.startsWith("/") ? callbackUrl : "/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-2">
            Cardinal Treats
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-100">
            Staff sign in
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Admin and order staff only. Customers use the main store sign in.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 sm:p-8 shadow-2xl space-y-5"
        >
          {error && (
            <div className="rounded-xl bg-red-950/50 border border-red-900 text-red-200 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-2">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 text-sm outline-none focus:ring-2 focus:ring-amber-600/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-2">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 text-sm outline-none focus:ring-2 focus:ring-amber-600/50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold py-3 text-sm transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-sm text-stone-500">
            <Link
              href="/auth/forgot-password"
              className="text-amber-500 hover:text-amber-400 font-medium"
            >
              Forgot password?
            </Link>
          </p>
        </form>

        <p className="text-center mt-8 text-sm text-stone-600">
          <Link href="/" className="text-stone-400 hover:text-stone-300 underline">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center text-stone-500 text-sm">
          Loading…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
