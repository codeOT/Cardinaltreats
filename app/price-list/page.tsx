import { getCollection } from "@/lib/db";
import { fmt } from "@/lib/utils";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function PriceListPage() {
  const productsCol = await getCollection<Product>("products");
  const products = await productsCol
    .find({})
    .sort({ sortOrder: 1, name: 1 } as any)
    .toArray();

  return (
    <main className="min-h-screen bg-stone-50 px-4 sm:px-6 lg:px-8 py-10 pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-500 mb-2">
            Product Price List
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-stone-900">
            Products & Prices
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] px-4 py-3 bg-stone-100 border-b border-stone-200">
            <p className="text-xs font-bold tracking-[.08em] uppercase text-stone-500">Product</p>
            <p className="text-xs font-bold tracking-[.08em] uppercase text-stone-500">Price</p>
          </div>

          {products.length === 0 ? (
            <p className="px-4 py-6 text-sm text-stone-500">No products found.</p>
          ) : (
            products.map((p) => (
              <div
                key={`${p.id}-${p.slug}`}
                className="grid grid-cols-[1fr_auto] px-4 py-3 border-b border-stone-100 last:border-0"
              >
                <p className="text-sm font-medium text-stone-800">
                  {p.name} <span className="text-stone-400">({p.weight})</span>
                </p>
                <p className="text-sm font-bold text-stone-900">{fmt(Number(p.price || 0))}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
