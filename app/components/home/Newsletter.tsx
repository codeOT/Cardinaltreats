"use client";

import { useState } from "react";
import { IcArrow } from "@/app/components/ui/icons";

interface NewsletterProps {
  onSubscribe: (msg: string) => void;
}

export function Newsletter({ onSubscribe }: NewsletterProps) {
  const [email, setEmail] = useState("");

  const handleSubscribe = (): void => {
    if (email.trim()) {
      onSubscribe("🎉 Subscribed! Welcome to the fam.");
      setEmail("");
    }
  };

  return (
    <section className="bg-stone-900 py-20 px-6">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-400 mb-3">
          Stay Updated
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4 leading-[.95]">
          New Flavours.<br />Exclusive Deals.
        </h2>
        <p className="text-stone-400 mb-10 leading-relaxed text-sm">
          Be the first to know about new flavours, limited drops, and subscriber-only discounts.
        </p>

        <div className="flex max-w-md mx-auto rounded-full overflow-hidden border border-stone-700 focus-within:border-amber-500 transition-colors">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
            className="flex-1 bg-stone-800 text-white placeholder-stone-600 px-6 py-4 outline-none text-sm font-medium"
          />
          <button
            onClick={handleSubscribe}
            className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-4 flex items-center gap-2 text-sm flex-shrink-0 transition-colors"
          >
            Subscribe <IcArrow />
          </button>
        </div>

        <p className="text-stone-600 text-xs mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}