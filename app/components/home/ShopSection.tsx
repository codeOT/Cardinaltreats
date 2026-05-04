"use client";

import { useMemo, useState } from "react";
import { useProducts } from "@/./context/Productscontext";
import { ProductCard } from "@/app/components/product/ProductCard";
import type { Product } from "@/types";

interface ShopSectionProps {
  onOpenModal: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}

export function ShopSection({ onOpenModal, onAddToCart }: ShopSectionProps) {
  const [mobilePack, setMobilePack] = useState<"pouches" | "cartons">("pouches");
  const { products, loading } = useProducts();

  const pouchProducts = useMemo(
    () => products.filter((p) => (p as any).packType !== "carton"),
    [products]
  );
  const cartonProducts = useMemo(
    () => products.filter((p) => (p as any).packType === "carton"),
    [products]
  );
  const cartons = cartonProducts;

  const renderGrid = (rows: Product[]) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {rows.map((p) => (
        <ProductCard
          key={`${p.slug}-${p.weight}`}
          product={p}
          onOpen={onOpenModal}
          onAdd={onAddToCart}
        />
      ))}
    </div>
  );

  return (
    <section id="shop" className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-500 mb-2">
              Our Collection
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-stone-900 leading-[.95]">
              Pick Your
              <br />
              Favourite.
            </h2>
          </div>
          <p className="text-stone-400 text-sm max-w-[260px] leading-relaxed">
             Now in pouches and cartons.
          </p>
        </div>

        <div className="mb-8 overflow-x-auto pb-2 md:hidden">
          <div className="flex items-center gap-2" style={{ scrollbarWidth: "none" }}>
            {[
              { id: "pouches", label: "Pouches" },
              { id: "cartons", label: "Cartons" },
            ].map((pack) => (
              <button
                key={pack.id}
                onClick={() => setMobilePack(pack.id as "pouches" | "cartons")}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  mobilePack === pack.id
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {pack.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-gray-100 animate-pulse h-72"
              />
            ))}
          </div>
        ) : pouchProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🤔</div>
            <p className="text-gray-700 font-medium mb-2">No products found</p>
            <p className="text-gray-500 text-sm">Please add products from admin</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="hidden md:block">
              <p className="text-xs font-bold tracking-[.12em] uppercase text-stone-500 mb-3">
                Pouches
              </p>
              {renderGrid(pouchProducts)}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold tracking-[.12em] uppercase text-stone-500 mb-3">
                Cartons
              </p>
              {cartons.length > 0 ? (
                renderGrid(cartons)
              ) : (
                <p className="text-sm text-stone-500">No carton products yet.</p>
              )}
            </div>

            <div className="md:hidden">
              {mobilePack === "pouches" ? (
                <>
                  <p className="text-xs font-bold tracking-[.12em] uppercase text-stone-500 mb-3">
                    Pouches
                  </p>
                  {renderGrid(pouchProducts)}
                </>
              ) : (
                <>
                  <p className="text-xs font-bold tracking-[.12em] uppercase text-stone-500 mb-3">
                    Cartons
                  </p>
                  {cartons.length > 0 ? (
                    renderGrid(cartons)
                  ) : (
                    <p className="text-sm text-stone-500">No carton products yet.</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
