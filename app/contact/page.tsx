"use client";

import { useState } from "react";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { CartSidebar } from "@/app/components/cart/CartSidebar";

export default function ContactPage() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <main className="px-4 sm:px-6 lg:px-8 py-10 mt-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
            <p className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-500 mb-2">
              Contact Us
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-stone-900 mb-3">
              We&apos;re Here to Help
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Questions about your order, wholesale requests, or anything else? Reach
              out and our team will get back to you quickly.
            </p>

            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-stone-400 text-xs mb-1">Email</p>
                <a
                  href="mailto:sales@cardinaltorch.com"
                  className="font-semibold text-stone-800 hover:text-amber-600"
                >
                  sales@cardinaltorch.com
                </a>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-stone-400 text-xs mb-1">WhatsApp</p>
                <a
                  href="https://wa.me/2340000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-stone-800 hover:text-amber-600"
                >
                  Chat with support
                </a>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-stone-400 text-xs mb-1">Response time</p>
                <p className="font-semibold text-stone-800">
                  Usually within 1-24 hours
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
            <h2 className="font-display text-2xl font-black text-stone-900 mb-1">
              Send Us a Message
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              This form is for quick contact. You can also reach us directly via email
              or WhatsApp.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Send Message
              </button>
            </form>
          </section>
        </div>
      </main>

      {/* <Footer onProductClick={() => {}} />
      {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />} */}
    </div>
  );
}

