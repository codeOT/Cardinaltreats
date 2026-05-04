import { CashewSVG } from "@/app/components/product/CashewSVG";
import { IcPlus } from "@/app/components/ui/icons";
import { fmt } from "@/lib/utils";
import type { Product } from "@/types";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onOpen: (p: Product) => void;
  onAdd: (p: Product) => void;
}

function Ring({ cls = "" }: { cls?: string }){
  return (
    <div
      className={`rounded-full border-2 border-dashed border-amber-300/40 anim-spin pointer-events-none ${cls}`}
      style={{ position: "absolute" }}
    />
  );
}

export function ProductCard({ product: p, onOpen, onAdd }: ProductCardProps){
  const weightNum = Number(String(p.weight || "").replace(/[^\d]/g, ""));
  const isCarton =
    (p as any).packType === "carton" || String(p.weight || "").toLowerCase().includes("pack");
  const displayPrice =
    weightNum === 50
      ? Number((p as any).price50 ?? p.price)
      : weightNum === 100
        ? Number((p as any).price100 ?? p.price)
        : Number(p.price);

  const rawStock50 = (p as any).stockQty50;
  const rawStock100 = (p as any).stockQty100;
  const rawLegacyStock = (p as any).stockQty;
  const has50Field = rawStock50 != null;
  const has100Field = rawStock100 != null;
  const inStock50 = has50Field ? Number(rawStock50) > 0 : false;
  const inStock100 = has100Field ? Number(rawStock100) > 0 : false;
  const hasWeight50 = weightNum === 50;
  const hasWeight100 = weightNum === 100;
  const hasAnyStock =
    isCarton
      ? rawLegacyStock == null
        ? true
        : Number(rawLegacyStock) > 0
      : hasWeight50
      ? has50Field
        ? inStock50
        : rawLegacyStock == null
          ? true
          : Number(rawLegacyStock) > 0
      : hasWeight100
        ? has100Field
          ? inStock100
          : rawLegacyStock == null
            ? true
            : Number(rawLegacyStock) > 0
        : has50Field || has100Field
          ? inStock50 || inStock100
          : rawLegacyStock == null
            ? true
            : Number(rawLegacyStock) > 0;

  return (
    <motion.div
      className={`card-hover relative rounded-3xl overflow-hidden cursor-pointer border ${p.twBorder} ${p.twBg} flex flex-col`}
      onClick={() => {
        if (!hasAnyStock) return;
        onOpen(p);
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -6, scale: 1.01 }}
    >
      {/* Badge */}
      <div className="absolute top-3.5 left-3.5 z-10">
        <span className={`text-[10px] font-bold tracking-[.1em] uppercase px-3 py-1 rounded-full bg-white shadow-sm ${p.twText}`}>
          {p.badge}
        </span>
      </div>
     

      {/* Illustration or custom image */}
      <div className="relative h-48 flex items-center justify-center pt-8 overflow-hidden">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            loading="lazy"
            decoding="async"
            className="w-full h-[200px] object-contain absolute inset-0 "
          />
        ) : (
          <>
            <Ring cls="w-32 h-32 opacity-50" />
            <div className="anim-float relative z-10">
              <CashewSVG color={p.dotColor} size={100} />
            </div>
          </>
        )}
        <div className="absolute bottom-3 right-4 text-3xl leading-none z-10">{p.emoji}</div>
      </div>

      {/* Info */}
      <div className="px-5 pb-5 pt-3 flex-1 flex flex-col">
        <p className={`text-[10px] font-bold tracking-[.12em] uppercase mb-1 ${p.twText}`}>
          {p.subtitle}
        </p>
        <h3 className="font-display text-xl font-bold text-stone-800 mb-1">{p.name}</h3>
        <p className="text-stone-400 text-xs leading-relaxed mb-4 flex-1">{p.tagline}</p>
        <div className="flex items-center justify-between">
        <div>
       <div className="flex items-center gap-2 ">
             <p className="font-bold text-stone-800 text-lg leading-none">{fmt(displayPrice)}</p>
             {!hasAnyStock && (
        <div className="-mt-2">
          <span className="text-[7px] tracking-[.08em] uppercase px-1 py-1 rounded-full text-rose-600 ">
           Sold Out
          </span>
        </div>
      )}
       </div>

            <p className="text-stone-400 text-[10px] mt-0.5">{p.weight}</p>
          </div>
          <motion.button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (!hasAnyStock) return;
              onAdd(p);
            }}
            disabled={!hasAnyStock}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95 ${
              hasAnyStock ? "hover:scale-110" : "opacity-40 cursor-not-allowed"
            }`}
            style={{ background: p.dotColor }}
            whileTap={{ scale: 0.9 }}
          >
            <IcPlus />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}