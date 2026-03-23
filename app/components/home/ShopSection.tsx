"use client";

import { useState } from "react";
import { FILTERS, FILTER_MAP } from "@/data/products";
import { useProducts } from "@/./context/Productscontext";
import { ProductCard } from "@/app/components/product/ProductCard";
import type { Product } from "@/types";

interface ShopSectionProps {
  onOpenModal: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}

export function ShopSection({ onOpenModal, onAddToCart }: ShopSectionProps){
  const [activeFilter, setActiveFilter] = useState("All");
  const { products, loading } = useProducts();

  const isInStock = (p: Product) => {
    const s50 = (p as any).stockQty50;
    const s100 = (p as any).stockQty100;
    const sLegacy = (p as any).stockQty;
    // If no stock fields exist, assume in stock (backward compatible).
    if (s50 == null && s100 == null && sLegacy == null) return true;
    const a = Number(s50 ?? 0);
    const b = Number(s100 ?? 0);
    const c = Number(sLegacy ?? 0);
    return a > 0 || b > 0 || c > 0;
  };

  const filtered =
    activeFilter === "All"
      ? products
      : products.filter((p) => FILTER_MAP[activeFilter]?.includes(p.id));

  const visible = filtered.filter(isInStock);

  return (
    <section id="shop" className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-500 mb-2">
              Our Collection
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-stone-900 leading-[.95]">
              Pick Your<br />Favourite.
            </h2>
          </div>
          <p className="text-stone-400 text-sm max-w-[260px] leading-relaxed">
            {visible.length} distinct profile{visible.length !== 1 ? "s" : ""}. One obsessive standard. Mix and match freely.
          </p>
        </div>



        {/* Filter pills */}
        <div className="mb-10 overflow-x-auto pb-2">
          <div className="flex items-center gap-2" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === f
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-gray-100 animate-pulse h-72"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🤔</div>
            <p className="text-gray-700 font-medium mb-2">No products found</p>
            <p className="text-gray-500 text-sm">Try a different filter</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpen={onOpenModal}
                onAdd={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}