"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { fmt } from "@/lib/utils";
import type { DeliveryAddress } from "@/types";
import Link from "next/link";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState(0);
  const [couponStatus, setCouponStatus] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [addresses, setAddresses] = useState<(DeliveryAddress & { _id?: string })[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [addrFullName, setAddrFullName] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrCountry, setAddrCountry] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // No longer force auth; guest checkout allowed

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("ct_coupon_code") : null;
    if (stored) {
      setCouponCode(stored);
      // We will re-validate when user pays
    }
  }, []);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setAddressesLoading(true);
        const res = await fetch("/api/account/addresses");
        if (!res.ok) return;
        const data = await res.json();
        const list: (DeliveryAddress & { _id?: string })[] = data.addresses || [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def?._id) {
          setSelectedAddressId(def._id);
        } else if (list.length === 0) {
          setSelectedAddressId("new");
        }
      } finally {
        setAddressesLoading(false);
      }
    };
    if (status === "authenticated") {
      loadAddresses().catch(() => setAddressesLoading(false));
    }
  }, [status]);

  const discountedTotal =
    couponPercent > 0 ? Math.max(0, cartTotal - Math.round((cartTotal * couponPercent) / 100)) : cartTotal;

  const selectedExistingAddress =
    selectedAddressId !== "new"
      ? addresses.find((a) => a._id === selectedAddressId)
      : undefined;

  const isAddressComplete =
    selectedAddressId === "new" || addresses.length === 0
      ? Boolean(
          addrFullName.trim() &&
            addrLine1.trim() &&
            addrCity.trim() &&
            addrState.trim() &&
            addrCountry.trim() &&
            addrPhone.trim()
        )
      : Boolean(
          selectedExistingAddress &&
            selectedExistingAddress.fullName &&
            selectedExistingAddress.line1 &&
            selectedExistingAddress.city &&
            selectedExistingAddress.state &&
            selectedExistingAddress.country &&
            selectedExistingAddress.phone
        );

  const isGuestEmailComplete = session
    ? true
    : Boolean(guestEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim()));

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!session && !guestEmail) {
        setError("Please enter your email so we can send your order details.");
        setLoading(false);
        return;
      }

      // Client-side stock precheck (server will also validate)
      try {
        const pres = await fetch("/api/products", { cache: "no-store" });
        const pdata = await pres.json().catch(() => null);
        const list = (pdata?.products || []) as any[];
        const pmap = new Map<number, any>(list.map((p) => [Number(p.id), p]));
        for (const it of items as any[]) {
          const pid = Number(it.id);
          const grams = Number(it.selectedGrams ?? 100);
          const qty = Number(it.qty ?? 0);
          const p = pmap.get(pid);
          if (!p) continue;
          const available =
            grams === 50
              ? Number(p.stockQty50 ?? p.stockQty ?? 0)
              : Number(p.stockQty100 ?? p.stockQty ?? 0);
          if (available <= 0) {
            setError(`${p.name} (${grams}g) is sold out.`);
            setLoading(false);
            return;
          }
          if (available < qty) {
            setError(`${p.name} (${grams}g) has only ${available} left.`);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore client precheck failures; server will still enforce stock
      }

      let deliveryAddress: Partial<DeliveryAddress> | undefined;
      if (selectedAddressId === "new") {
        deliveryAddress = {
          fullName: addrFullName,
          line1: addrLine1,
          line2: addrLine2 || undefined,
          city: addrCity,
          state: addrState,
          country: addrCountry,
          phone: addrPhone,
        };
      } else {
        const existing = addresses.find((a) => a._id === selectedAddressId);
        if (existing) {
          const { _id, userId, createdAt, ...rest } = existing as any;
          deliveryAddress = rest;
        }
      }

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.id,
            name: i.name,
            price: i.price,
            qty: i.qty,
            grams: (i as any).selectedGrams ?? 100,
          })),
          couponCode: couponCode || undefined,
          deliveryAddress,
          guestEmail: !session ? guestEmail : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to start payment");
        setLoading(false);
        return;
      }
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("ct_last_order_reference", String(data.reference || ""));
        } catch {
          // ignore
        }
      }
      window.location.href = data.authorizationUrl;
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 mt-16">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg border border-stone-100 p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-stone-900">
              Checkout
            </h1>
            <p className="text-sm text-stone-500">
              You&apos;re almost there. Confirm your order and pay securely with
              Paystack.
            </p>
          </div>
          {session ? (
            <div className="text-right text-xs text-stone-400">
              Signed in as
              <br />
              <span className="font-semibold text-stone-700">
                {session.user?.email}
              </span>
            </div>
          ) : (
            <div className="text-right text-xs text-stone-400">
              <span className="font-semibold text-stone-700">Guest checkout</span>
              <p className="text-[11px] text-stone-400">
                We&apos;ll email your order receipt.
              </p>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-stone-500">
            Your cart is empty. Please add items before checking out.
          </p>
        ) : (
          <>
            <div className="border border-stone-100 rounded-2xl divide-y divide-stone-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {(item as any).selectedGrams ?? 100}g · {item.qty} × {fmt(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-stone-800">
                    {fmt(item.price * item.qty)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Subtotal</span>
                <span className="font-display text-xl font-bold text-stone-900">
                  {fmt(cartTotal)}
                </span>
              </div>
              {couponPercent > 0 && (
                <div className="flex items-center justify-between text-sm text-emerald-700">
                  <span>Coupon ({couponPercent}% off)</span>
                  <span>-{fmt(cartTotal - discountedTotal)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                <span className="text-sm text-stone-500">Total</span>
                <span className="font-display text-2xl font-black text-stone-900">
                  {fmt(discountedTotal)}
                </span>
              </div>
            </div>

            {/* Delivery address */}
            <div className="space-y-3 border border-stone-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-800">
                  Delivery address
                </span>
                {addressesLoading && (
                  <span className="text-[11px] text-stone-400">
                    Loading saved addresses…
                  </span>
                )}
              </div>

              {addresses.length > 0 && (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className="flex items-start gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id || "")}
                      />
                      <div>
                        <p className="font-semibold text-stone-800">
                          {addr.fullName}{" "}
                          {addr.isDefault && (
                            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-stone-500">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city},{" "}
                          {addr.state}, {addr.country}
                        </p>
                        <p className="text-xs text-stone-400">
                          {addr.phone}
                        </p>
                      </div>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedAddressId("new")}
                    className="text-xs text-amber-700 font-semibold hover:underline"
                  >
                    + Use a different address
                  </button>
                </div>
              )}

              {(selectedAddressId === "new" || addresses.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      Full name
                    </label>
                    <input
                      value={addrFullName}
                      onChange={(e) => setAddrFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                      placeholder="Who will receive the order?"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      Address line 1
                    </label>
                    <input
                      value={addrLine1}
                      onChange={(e) => setAddrLine1(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                      placeholder="Street, building, etc."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      Address line 2 (optional)
                    </label>
                    <input
                      value={addrLine2}
                      onChange={(e) => setAddrLine2(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      City
                    </label>
                    <input
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      State
                    </label>
                    <input
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      Country
                    </label>
                    <input
                      value={addrCountry}
                      onChange={(e) => setAddrCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      Phone number
                    </label>
                    <input
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {!session && (
              <div className="space-y-2 border border-stone-100 rounded-2xl p-4">
                <p className="text-sm font-semibold text-stone-800">
                  Email for order receipt
                </p>
                <p className="text-xs text-stone-500">
                  We&apos;ll send your payment confirmation and order details here.
                </p>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                />
                <button
                  type="button"
                  disabled={applyingCoupon || !couponCode.trim()}
                  onClick={async () => {
                    setApplyingCoupon(true);
                    setCouponStatus(null);
                    try {
                      const res = await fetch("/api/coupons/apply", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: couponCode }),
                      });
                      const data = await res.json();
                      if (!res.ok || !data.valid) {
                        setCouponPercent(0);
                        setCouponStatus(data.error || "Invalid coupon");
                        localStorage.removeItem("ct_coupon_code");
                      } else {
                        setCouponPercent(data.discountPercent);
                        setCouponStatus(`Coupon applied: ${data.discountPercent}% off`);
                        localStorage.setItem("ct_coupon_code", data.code);
                      }
                    } catch {
                      setCouponPercent(0);
                      setCouponStatus("Unable to validate coupon. Please try again.");
                    } finally {
                      setApplyingCoupon(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold disabled:bg-stone-300"
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
              {couponStatus && (
                <p
                  className={`text-xs ${
                    couponPercent > 0 ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {couponStatus}
                </p>
              )}
            </div>

            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <label className="flex items-start gap-2 text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I understand that orders are confirmed once payment is successful.
                Payments are generally non-refundable after processing.
                I have read the{" "}
                <Link href="/policies" target="_blank" className="text-amber-700 font-semibold underline">
                  Refund & Delivery Policy
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" target="_blank" className="text-amber-700 font-semibold underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              onClick={handlePay}
              disabled={
                loading ||
                items.length === 0 ||
                !acceptedTerms ||
                !isAddressComplete ||
                !isGuestEmailComplete
              }
              className="w-full px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-700 disabled:bg-stone-300 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Pay
            </button>
          </>
        )}
      </div>
    </div>
  );
}

