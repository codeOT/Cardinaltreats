"use client";

import { useState } from "react";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { CartSidebar } from "@/app/components/cart/CartSidebar";

export default function PrivacyPolicyPage() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <main className="px-4 sm:px-6 lg:px-8 py-10 mt-16">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-stone-100 shadow-sm p-8 space-y-8">
          <header>
            <p className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-500 mb-2">
              Privacy
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-stone-900">
              Privacy Policy
            </h1>
            <p className="text-sm text-stone-500 mt-2">
              How Cardinal Treats collects, uses, and protects your information.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="font-semibold text-stone-900">Information We Collect</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              We may collect your name, email, phone number, delivery address, and order details
              when you create an account or place an order.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-stone-900">How We Use Your Information</h2>
            <ul className="text-sm text-stone-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>To process and deliver your orders.</li>
              <li>To send order confirmations, status updates, and support responses.</li>
              <li>To improve product and customer experience.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-stone-900">Data Sharing</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              We do not sell your personal information. We only share required details with trusted
              service providers (e.g., payment and delivery partners) to fulfill your orders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-stone-900">Data Security</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              We take reasonable technical and operational measures to protect your data from unauthorized access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-stone-900">Your Rights</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              You may request access, correction, or deletion of your personal data by contacting our support team.
            </p>
          </section>
        </div>
      </main>

    
    </div>
  );
}

