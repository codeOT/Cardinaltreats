"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "ct_cookie_consent_v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CONSENT_KEY);
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // ignore storage issues
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed left-4 right-4 bottom-4 z-[160] md:left-auto md:right-4 md:max-w-md">
      <div className="bg-white border border-stone-200 shadow-xl rounded-2xl p-4">
        <p className="text-sm font-semibold text-stone-900 mb-1">Cookie Notice</p>
        <p className="text-xs text-stone-600 leading-relaxed">
          We use cookies and similar technologies to improve your experience, keep your cart,
          and process orders. By continuing, you agree to our{" "}
          <Link href="/policies" className="text-amber-700 font-semibold underline">
            Terms & Policies
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-amber-700 font-semibold underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={accept}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-700 text-white text-xs font-semibold"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

