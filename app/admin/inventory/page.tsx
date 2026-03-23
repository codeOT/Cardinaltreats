"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminInventoryPage() {
  const { data, error } = useSWR("/api/admin/inventory", fetcher);

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-sm text-rose-600">
          Unable to load inventory. Please try again.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-sm text-stone-500">Loading inventory…</p>
      </div>
    );
  }

  const { summary, coupons } = data;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-black text-stone-900">
            Inventory & Orders
          </h1>
          <p className="text-sm text-stone-500">
            High-level view of orders, revenue, and coupons.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Total orders" value={summary.totalOrders} />
          <Card
            title="Total revenue"
            value={
              new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                maximumFractionDigits: 0,
              }).format(summary.totalRevenue || 0)
            }
          />
          <Card title="Processing" value={summary.statusCounts.processing} />
          <Card title="Delivered" value={summary.statusCounts.delivered} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="text-sm font-semibold text-stone-800 mb-3">
              Orders by status
            </h2>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex justify-between">
                <span>Processing</span>
                <span className="font-semibold">
                  {summary.statusCounts.processing}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Shipped</span>
                <span className="font-semibold">
                  {summary.statusCounts.shipped}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Delivered</span>
                <span className="font-semibold">
                  {summary.statusCounts.delivered}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Cancelled</span>
                <span className="font-semibold">
                  {summary.statusCounts.cancelled}
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="text-sm font-semibold text-stone-800 mb-3">
              Coupons & discounts
            </h2>
            {coupons.length === 0 ? (
              <p className="text-sm text-stone-500">
                No coupons created yet. You can manage them directly in MongoDB
                for now.
              </p>
            ) : (
              <ul className="space-y-2 text-sm text-stone-600">
                {coupons.map((c: any) => (
                  <li
                    key={c._id}
                    className="flex items-center justify-between border border-stone-100 rounded-xl px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-stone-800">
                        {c.code} · {c.discountPercent}% off
                      </p>
                      {c.description && (
                        <p className="text-xs text-stone-400">
                          {c.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-stone-400">
                      {c.usedCount} used
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4">
      <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mb-1.5">
        {title}
      </p>
      <p className="text-lg font-bold text-stone-900">{value}</p>
    </div>
  );
}

