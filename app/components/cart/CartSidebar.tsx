"use client";

import { useState } from "react";
import React from "react";
import { useCart } from "@/context/CartContext";
import { CashewSVG } from "@/app/components/product/CashewSVG";
import { IcX, IcPlus, IcMinus, IcChevron } from "@/app/components/ui/icons";
import { fmt } from "@/lib/utils";
import { FREE_DELIVERY_THRESHOLD } from "@/data/products";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CartSidebarProps {
  onClose: () => void;
}

export function CartSidebar({ onClose }: CartSidebarProps) {
  const { items, cartCount, cartTotal, updateQty, removeFromCart, setItemWeight } = useCart();
  const delProgress = Math.min(100, (cartTotal / FREE_DELIVERY_THRESHOLD) * 100);
  const { data: session } = useSession();
  const router = useRouter();

  const [soldOutMsg, setSoldOutMsg] = useState<Record<number, string | null>>({});
  const [couponInput, setCouponInput] = useState("");
  const [couponPercent, setCouponPercent] = useState(0);
  const [couponStatus, setCouponStatus] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Prevent body scroll when cart is open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const discountedTotal =
    couponPercent > 0 ? Math.max(0, cartTotal - Math.round((cartTotal * couponPercent) / 100)) : cartTotal;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponStatus(null);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
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
      setCouponStatus("Unable to validate coupon. Please try again.");
      setCouponPercent(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    if (!session) {
      onClose();
      router.push(`/auth/signin?callbackUrl=/checkout`);
      return;
    }
    router.push("/checkout");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 400,
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 401,
          width: "420px", maxWidth: "95vw",
          backgroundColor: "#ffffff",
          display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
          animation: "slideInR .32s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1.5px solid #f1f0ef",
            backgroundColor: "#ffffff",
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.25rem", fontWeight: 800, color: "#1c1917", margin: 0 }}>
              Your Cart
            </h2>
            <p style={{ fontSize: "0.72rem", color: "#a8a29e", marginTop: 2 }}>
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isCheckingOut}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#f5f5f4", border: "none", cursor: isCheckingOut ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              opacity: isCheckingOut ? 0.6 : 1,
            }}
          >
            <IcX />
          </button>
        </div>

        {/* Items */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: "0 24px", backgroundColor: "#ffffff" }}
          className="scrollbar-hide"
        >
          {items.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>🛒</div>
              <p style={{ fontWeight: 600, color: "#57534e", fontSize: "0.875rem" }}>
                Your cart is empty
              </p>
              <p style={{ color: "#a8a29e", fontSize: "0.75rem", marginTop: 4 }}>
                Add some delicious cashews!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-4 border-b border-stone-100 last:border-0"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.twBg} border ${item.twBorder}`}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <CashewSVG color={item.dotColor} size={36} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 text-sm truncate">{item.name}</p>
                  <p className="text-stone-400 text-xs">
                    {item.selectedGrams ?? 100}g
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      disabled={isCheckingOut}
                      className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IcMinus />
                    </button>
                    <span className="text-sm font-bold w-4 text-center text-stone-800">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      disabled={isCheckingOut}
                      className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IcPlus />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      disabled={isCheckingOut}
                      className="ml-auto text-xs text-stone-300 hover:text-rose-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                    <select
                      value={item.selectedGrams ?? 100}
                      disabled={isCheckingOut}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        const stock50 = (item as any).stockQty50 ?? (item as any).stockQty ?? 0;
                        const stock100 = (item as any).stockQty100 ?? (item as any).stockQty ?? 0;
                        const ok =
                          next === 50 ? Number(stock50) > 0 : Number(stock100) > 0;
                        if (!ok) {
                          setSoldOutMsg((m) => ({
                            ...m,
                            [item.id]: `${next}g is sold out for this item.`,
                          }));
                          return;
                        }
                        setSoldOutMsg((m) => ({ ...m, [item.id]: null }));
                        setItemWeight(item.id, next);
                      }}
                      className="ml-2 text-[11px] font-semibold bg-stone-100 text-stone-700 px-2 py-1 rounded-full border border-stone-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value={100}>
                        100g{Number((item as any).stockQty100 ?? (item as any).stockQty ?? 0) <= 0 ? " — Sold out" : ""}
                      </option>
                      <option value={50}>
                        50g{Number((item as any).stockQty50 ?? (item as any).stockQty ?? 0) <= 0 ? " — Sold out" : ""}
                      </option>
                    </select>
                  </div>
                  {soldOutMsg[item.id] && (
                    <p className="mt-1 text-[11px] text-rose-600">{soldOutMsg[item.id]}</p>
                  )}
                </div>
                <p className="font-bold text-stone-700 text-sm flex-shrink-0">
                  {fmt(item.price * item.qty)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1.5px solid #f1f0ef",
              backgroundColor: "#fafaf9",
              flexShrink: 0,
            }}
          >
            {/* Delivery progress */}
            <div
              style={{
                background: "#fff", borderRadius: 16, padding: "12px 14px",
                border: "1px solid #e7e5e4", marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#57534e" }}>
                  {cartTotal >= FREE_DELIVERY_THRESHOLD
                    ? "🎉 Free delivery unlocked!"
                    : "🚚 Free delivery progress"}
                </span>
                {cartTotal < FREE_DELIVERY_THRESHOLD && (
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#d97706" }}>
                    {fmt(FREE_DELIVERY_THRESHOLD - cartTotal)} left
                  </span>
                )}
              </div>
              <div style={{ height: 6, background: "#e7e5e4", borderRadius: 99, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%", background: "#f59e0b", borderRadius: 99,
                    width: `${delProgress}%`, transition: "width .6s ease",
                  }}
                />
              </div>
            </div>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: "0.875rem", color: "#78716c", fontWeight: 500 }}>Order Total</span>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: "1.6rem", fontWeight: 900, color: "#1c1917" }}>
                {couponPercent > 0 ? fmt(discountedTotal) : fmt(cartTotal)}
              </span>
            </div>

            {/* Coupon */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  disabled={isCheckingOut}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    border: "1px solid #e7e5e4",
                    padding: "8px 12px",
                    fontSize: 12,
                    outline: "none",
                    opacity: isCheckingOut ? 0.6 : 1,
                    cursor: isCheckingOut ? "not-allowed" : "auto",
                  }}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponInput.trim() || isCheckingOut}
                  style={{
                    borderRadius: 999,
                    border: "none",
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: applyingCoupon || !couponInput.trim() || isCheckingOut ? "not-allowed" : "pointer",
                    backgroundColor: "#1c1917",
                    color: "#fff",
                    opacity: applyingCoupon || !couponInput.trim() || isCheckingOut ? 0.6 : 1,
                  }}
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
              {couponStatus && (
                <p
                  style={{
                    fontSize: 11,
                    color: couponPercent > 0 ? "#15803d" : "#b91c1c",
                  }}
                >
                  {couponStatus}
                </p>
              )}
            </div>

            {/* Checkout */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              style={{
                width: "100%", background: "#1c1917", color: "#fff",
                border: "none", borderRadius: 16, padding: "14px 0",
                fontWeight: 700, fontSize: "0.875rem", cursor: isCheckingOut ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginBottom: 8, boxShadow: "0 4px 16px rgba(0,0,0,.18)",
                opacity: isCheckingOut ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {isCheckingOut ? "Redirecting..." : "Checkout"} {!isCheckingOut && <IcChevron />}
            </button>
            <button
              onClick={onClose}
              disabled={isCheckingOut}
              style={{
                width: "100%", background: "none", border: "none",
                color: "#a8a29e", fontSize: "0.75rem", cursor: isCheckingOut ? "not-allowed" : "pointer", padding: "6px 0",
                opacity: isCheckingOut ? 0.5 : 1,
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}