"use client";

import { useState } from "react";
import { CashewSVG } from "@/app/components/product/CashewSVG";
import { IcX, IcPlus, IcMinus, IcCart } from "@/app/components/ui/icons";
import { fmt } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product, qty: number) => void;
}

export function ProductModal({ product: p, onClose, onAddToCart }: ProductModalProps){
  const [qty, setQty] = useState(1);
  const custom50 = Number((p as any).price50);
  const custom100 = Number((p as any).price100);
  const hasCustom50 = Number.isFinite(custom50) && custom50 > 0;
  const hasCustom100 = Number.isFinite(custom100) && custom100 > 0;
  const basePricePer100 = hasCustom100 ? custom100 : p.price;
  const stock50 = (p as any).stockQty50 ?? (p as any).stockQty ?? 0;
  const stock100 = (p as any).stockQty100 ?? (p as any).stockQty ?? 0;
  const inStock50 = Number(stock50) > 0 && hasCustom50;
  const inStock100 = Number(stock100) > 0;
  const [grams, setGrams] = useState<50 | 100>(inStock100 ? 100 : 50);
  const [stockMsg, setStockMsg] = useState<string | null>(null);
  const unitPrice =
    grams === 50
      ? hasCustom50
        ? custom50
        : basePricePer100
      : basePricePer100;


  return (
    <div
      className="anim-fadeIn fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors z-10 shadow-sm"
        >
          <IcX />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Visual */}
          <div
            className={`${p.twBg} rounded-tl-3xl rounded-bl-3xl md:rounded-tr-none rounded-tr-3xl rounded-br-none flex flex-col items-center justify-center min-h-[260px] border-r ${p.twBorder} overflow-hidden relative`}
          >
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <div className="p-10 flex flex-col items-center">
                <div className="anim-float">
                  <CashewSVG color={p.dotColor} size={140} />
                </div>
                <div className="text-4xl mt-4">{p.emoji}</div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-8">
            <span
              className={`inline-block text-[9px] font-bold tracking-[.12em] uppercase px-3 py-1 rounded-full bg-white border ${p.twBorder} ${p.twText} mb-4 shadow-sm`}
            >
              {p.badge}
            </span>
            <h2 className="font-display text-2xl font-black text-stone-900 mb-0.5">{p.name}</h2>
            <p className={`text-sm font-semibold mb-4 ${p.twText}`}>{p.tagline}</p>
            <p className="text-stone-500 text-sm leading-relaxed mb-5">{p.description}</p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-6">
                <span className="text-sm font-semibold text-stone-700">Size</span>
                <select
                  value={grams}
                  onChange={(e) => {
                    const next = Number(e.target.value) as 50 | 100;
                    setStockMsg(null);
                    if (next === 50 && !inStock50) {
                      setStockMsg("50g is sold out for this item. Please choose 100g.");
                      return;
                    }
                    if (next === 100 && !inStock100) {
                      setStockMsg("100g is sold out for this item. Please choose 50g.");
                      return;
                    }
                    setGrams(next);
                  }}
                  className="text-xs font-semibold bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full border border-stone-200"
                >
                  <option value={100}>100g (default){!inStock100 ? " — Sold out" : ""}</option>
                  <option value={50}>50g{!inStock50 ? " — Unavailable" : ""}</option>
                </select>
              </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-semibold text-stone-700">Qty</span>
              <div className="flex items-center gap-3 bg-stone-100 rounded-full px-4 py-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-stone-200 transition-colors shadow-sm"
                >
                  <IcMinus />
                </button>
                <span className="font-black text-stone-800 w-4 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-stone-200 transition-colors shadow-sm"
                >
                  <IcPlus />
                </button>
              </div>
              
            </div>

            {stockMsg && (
              <p className="text-xs text-rose-600 -mt-3 mb-3">{stockMsg}</p>
            )}

            <p className="font-display text-3xl font-black text-stone-900 mb-4">
              {fmt(unitPrice * qty)}
            </p>

            <button
              onClick={() => {
                if ((grams === 100 && !inStock100) || (grams === 50 && !inStock50)) {
                  setStockMsg(`${grams}g is currently out of stock.`);
                  return;
                }
                const productWithSize: Product = {
                  ...p,
                  price: unitPrice,
                  price50: hasCustom50 ? custom50 : undefined,
                  price100: basePricePer100,
                  weight: `${grams}g`,
                };
                onAddToCart(productWithSize, qty);
              }}
              className="w-full bg-stone-900 hover:bg-stone-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md transition-all"
            >
              <IcCart /> Add to Cart — {fmt(unitPrice * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}