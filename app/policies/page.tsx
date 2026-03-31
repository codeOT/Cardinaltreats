"use client";

import { useState } from "react";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { CartSidebar } from "@/app/components/cart/CartSidebar";
import Link from "next/link";

export default function PoliciesPage() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <main className="px-4 sm:px-6 lg:px-8 py-10 mt-16">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-stone-100 shadow-sm p-8 space-y-8">
          <header>
            <p className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-500 mb-2">
              Terms & Policies
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-stone-900">
              Delivery & Refund Policy
            </h1>
            <p className="text-sm text-stone-500 mt-2">
              Please review these terms before placing an order with Cardinal Treats.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="font-semibold text-stone-900">Order Confirmation</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Your order is confirmed only after successful payment and receipt of an
              order confirmation from us. We may contact you to verify delivery details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-stone-900">Delivery Policy</h2>
            <ul className="text-sm text-stone-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>Standard delivery timelines vary by location and logistics conditions.</li>
              <li>Please ensure your delivery address and phone number are accurate.</li>
              <li>If delivery fails due to incorrect details, additional charges may apply.</li>
              <li>Delivery timelines are estimates and may be affected by weather, traffic, or carrier delays.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-stone-900">Refund & Cancellation Policy</h2>
            <ul className="text-sm text-stone-600 leading-relaxed list-disc pl-5 space-y-2">
              <li>Food items are generally non-refundable once processing begins.</li>
              <li>Orders cannot be cancelled after they have been packed or dispatched.</li>
              <li>If we cannot fulfill your order, we will issue a full refund for affected items.</li>
              <li>If items arrive damaged, contact support within 24 hours with evidence for review.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-stone-900">Support</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              For policy questions, contact us via WhatsApp or email and include your order reference.
            </p>
            <p className="text-sm">
              <Link href="/contact" className="text-amber-600 font-semibold hover:text-amber-700">
                Contact Support
              </Link>
            </p>
          </section>
        </div>
      </main>

    </div>
  );
}

