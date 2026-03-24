"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const [reference, setReference] = useState("");

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    setReference(q.get("reference") || q.get("trxref") || "");
  }, []);

  useEffect(() => {
    const run = async () => {
      const ref =
        reference ||
        (typeof window !== "undefined"
          ? window.localStorage.getItem("ct_last_order_reference") || ""
          : "");

      if (!ref) {
        setStatus("error");
        setMsg("Missing payment reference.");
        return;
      }
      try {
        const res = await fetch("/api/orders/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: ref }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatus("error");
          setMsg(data.error || "Unable to confirm payment or send email.");
          return;
        }
        setStatus("ok");
        setMsg(
          data.emailSent
            ? "Order confirmed. We sent your order details to your email."
            : data.alreadySent
              ? "Order confirmed. Email already sent."
              : "Order confirmed, but we could not send an email."
        );
      } catch {
        setStatus("error");
        setMsg("Unable to confirm payment right now. Please refresh.");
      }
    };
    run();
  }, [reference]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-100 shadow-sm p-8 text-center space-y-3">
        <h1 className="font-display text-2xl font-black text-stone-900">
          Payment successful
        </h1>
        <p className="text-sm text-stone-500">{msg || "Confirming your order…"}</p>

        {status === "loading" && (
          <div className="flex justify-center pt-2">
            <span className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full bg-stone-900 hover:bg-stone-700 text-white font-bold py-3 rounded-2xl text-sm transition-colors"
          >
            Continue shopping
          </Link>
          <Link
            href="/auth/signin?callbackUrl=/account"
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold py-3 rounded-2xl text-sm transition-colors"
          >
            Sign in to track orders
          </Link>
        </div>

        {(reference || status !== "loading") && (
          <p className="text-[11px] text-stone-400 pt-2">
            Ref: <span className="font-mono">{reference || "—"}</span>
          </p>
        )}
      </div>
    </div>
  );
}

