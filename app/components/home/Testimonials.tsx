 "use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TESTIMONIALS } from "@/data/products";
import { IcStar } from "@/app/components/ui/icons";

export function Testimonials(){
  const [popups, setPopups] = useState<
    Array<{
      id: string;
      name: string;
      location: string;
      flavour: string;
    }>
  >([]);

  const popupItems = useMemo(() => {
    // Use existing testimonial data as a lightweight "recent orders" feed.
    // (If you later want real orders, we can replace this with an API call.)
    return TESTIMONIALS.map((t) => ({ name: t.name, location: t.location, flavour: t.flavour }));
  }, []);

  useEffect(() => {
    const pickRandom = () => popupItems[Math.floor(Math.random() * popupItems.length)];
    const spawn = () => {
      if (!popupItems.length) return;
      const picked = pickRandom();
      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const name = picked.name;
      const location = picked.location;
      const flavour = picked.flavour;

      setPopups((prev) => [
        ...prev,
        { id, name, location, flavour },
      ]);

      // Remove after animation duration
      window.setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, 4200);
    };

    // Start with one popup and then rotate
    spawn();
    const interval = window.setInterval(spawn, 6500);
    return () => window.clearInterval(interval);
  }, [popupItems]);

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-500 mb-2">
            Customer Love
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-black text-stone-900">
            Real People. Real Reviews.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="group bg-stone-50 hover:bg-amber-50 rounded-3xl p-7 border border-stone-100 hover:border-amber-200 transition-all duration-300 cursor-default"
            >
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <IcStar key={j} />
                ))}
              </div>
              <p className="text-stone-600 text-sm leading-relaxed italic mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center font-black text-amber-800 text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-700 text-sm leading-tight">{t.name}</p>
                    <p className="text-stone-400 text-xs">{t.location}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                  {t.flavour}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating "recent order" popups */}
      <div className="fixed left-4 bottom-4 z-[140] pointer-events-none space-y-3">
        <AnimatePresence initial={false}>
          {popups.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              style={{
                maxWidth: 290,
                // small stagger so multiple toasts don't overlap visually
                marginTop: idx * 2,
              }}
            >
              <div className="pointer-events-none bg-white border border-stone-200 shadow-lg rounded-2xl px-4 py-3">
                <p className="text-[11px] text-amber-700 font-bold uppercase tracking-widest mb-1">
                  Recently ordered
                </p>
                <p className="text-sm font-semibold text-stone-900 leading-tight">
                  {p.name} from {p.location}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Ordered: <span className="font-semibold text-stone-700">{p.flavour}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}