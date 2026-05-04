"use client";

import { useState } from "react";

export default function BeADistributorPage() {
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const setField =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/distributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to submit form");
      setStatus("Thanks! Your distributor request has been received.");
      setForm({
        name: "",
        businessName: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        message: "",
      });
    } catch (err: any) {
      setStatus(err?.message || "Unable to submit right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 px-4 sm:px-6 lg:px-8 py-10 pt-28">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
        <p className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-500 mb-2">
          Partnership
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-stone-900 mb-2">
          Be a Distributor
        </h1>
        <p className="text-stone-500 text-sm mb-6">
          Fill this form and our team will contact you about wholesale/distributor pricing.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={form.name}
            onChange={setField("name")}
            placeholder="Full name"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-400"
          />
          <input
            value={form.businessName}
            onChange={setField("businessName")}
            placeholder="Business name"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-400"
          />
          <input
            type="email"
            value={form.email}
            onChange={setField("email")}
            placeholder="Email"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-400"
          />
          <input
            value={form.phone}
            onChange={setField("phone")}
            placeholder="Phone number"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-400"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              value={form.city}
              onChange={setField("city")}
              placeholder="City"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-400"
            />
            <input
              value={form.state}
              onChange={setField("state")}
              placeholder="State"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-400"
            />
          </div>
          <textarea
            value={form.message}
            onChange={setField("message")}
            placeholder="Tell us about your expected volume (optional)"
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-400 resize-none"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-stone-900 hover:bg-stone-700 disabled:bg-stone-300 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {saving ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        {status && <p className="mt-4 text-sm text-stone-600">{status}</p>}
      </div>
    </main>
  );
}
