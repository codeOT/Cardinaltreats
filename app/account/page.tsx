"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Order, DeliveryAddress } from "@/types";
import { fmt } from "@/lib/utils";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<(DeliveryAddress & { _id?: string })[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/signin?callbackUrl=/account`);
    }
  }, [status, router]);

  // If redirected back from Paystack with ?reference=..., confirm payment + send email.
  useEffect(() => {
    const ref = params.get("reference") || params.get("trxref") || "";
    if (!ref) return;
    const run = async () => {
      try {
        await fetch("/api/orders/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: ref }),
        });
      } catch {
        // ignore; user still has their order
      }
    };
    run();
  }, [params]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/orders/me");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
      setLoading(false);
    };

    const loadAddresses = async () => {
      try {
        const res = await fetch("/api/account/addresses");
        if (!res.ok) {
          setAddrError("Unable to load addresses");
          setAddrLoading(false);
          return;
        }
        const data = await res.json();
        setAddresses(data.addresses || []);
        setAddrLoading(false);
      } catch {
        setAddrError("Unable to load addresses");
        setAddrLoading(false);
      }
    };

    if (status === "authenticated") {
      load();
      loadAddresses();
    }
  }, [status]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-sm text-gray-400">Loading your account…</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-12">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Account
                </h1>
                <p className="text-gray-500">
                  Manage your delivery addresses and track orders
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>Signed in as</div>
                <div className="font-semibold text-gray-900">
                  {session.user?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Addresses Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Delivery Addresses
              </h2>
              <p className="text-sm text-gray-500">Save addresses for faster checkout</p>
            </div>

            {addrError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{addrError}</p>
              </div>
            )}

            {addresses.length === 0 && !addrLoading ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">No addresses added yet</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  + Add Address
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{addr.fullName}</h3>
                      {addr.isDefault && (
                        <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>
                        {addr.city}, {addr.state} {addr.country}
                      </p>
                      <p className="text-gray-500">{addr.phone}</p>
                    </div>
                  </div>
                ))}

                {/* Add Address Card */}
                <button
                  onClick={() => setShowAddressForm((v) => !v)}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-5 hover:border-gray-400 transition-colors flex items-center justify-center min-h-[180px]"
                >
                  <div className="text-center">
                    <div className="text-2xl text-gray-400 mb-2">+</div>
                    <p className="font-medium text-gray-900">Add Address</p>
                  </div>
                </button>
              </div>
            )}

            {/* Address Form */}
            {showAddressForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">New Address</h3>
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <form
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await fetch("/api/account/addresses", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fullName,
                          line1,
                          line2,
                          city,
                          state: stateName,
                          country,
                          phone,
                          isDefault: addresses.length === 0,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Failed");
                      setAddresses((prev) => [data.address, ...prev]);
                      setFullName("");
                      setLine1("");
                      setLine2("");
                      setCity("");
                      setStateName("");
                      setCountry("");
                      setPhone("");
                      setShowAddressForm(false);
                    } catch {
                      setAddrError("Unable to save address. Please try again.");
                    }
                  }}
                >
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      required
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      placeholder="Apartment, suite, etc."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Lagos"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Lagos"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Nigeria"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 (XXX) XXX-XXXX"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2.5 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* Orders Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Orders</h2>
              <p className="text-sm text-gray-500">Track your recent orders</p>
            </div>

            {orders.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={String(order._id)}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                  >
                    <div
                      onClick={() =>
                        setOpenOrderId((cur) =>
                          cur === String(order._id) ? null : String(order._id)
                        )
                      }
                      className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-mono text-gray-500">
                              {String(order._id).slice(-8).toUpperCase()}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                order.status === "processing"
                                  ? "bg-amber-100 text-amber-700"
                                  : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-700"
                                    : order.status === "delivered"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700"
                              }`}
                            >
                              {order.status === "processing"
                                ? "Processing"
                                : order.status === "shipped"
                                  ? "Shipped"
                                  : order.status === "delivered"
                                    ? "Delivered"
                                    : "Cancelled"}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-semibold text-gray-900">
                            {fmt(order.total)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {openOrderId === String(order._id) ? "▴" : "▾"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {openOrderId === String(order._id) && (
                      <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-5">
                        {/* Items */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Items</h4>
                          <div className="space-y-2">
                            {order.items.map((it) => (
                              <div
                                key={`${it.productId}-${it.grams ?? 100}`}
                                className="flex justify-between text-sm text-gray-600"
                              >
                                <span>
                                  {it.name}{" "}
                                  <span className="text-gray-500">
                                    {(it.grams ?? 100)}g ×{it.qty}
                                  </span>
                                </span>
                                <span className="font-medium text-gray-900">
                                  {fmt(it.price * it.qty)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Address */}
                        {order.deliveryAddress && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                              Delivery Address
                            </h4>
                            <div className="bg-white rounded p-3 text-sm text-gray-600 space-y-1">
                              <p className="font-medium text-gray-900">
                                {order.deliveryAddress.fullName}
                              </p>
                              <p>{order.deliveryAddress.line1}</p>
                              {order.deliveryAddress.line2 && (
                                <p>{order.deliveryAddress.line2}</p>
                              )}
                              <p>
                                {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                                {order.deliveryAddress.country}
                              </p>
                              <p className="text-gray-500">
                                {order.deliveryAddress.phone}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}