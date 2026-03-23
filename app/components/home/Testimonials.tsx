import { TESTIMONIALS } from "@/data/products";
import { IcStar } from "@/app/components/ui/icons";

export function Testimonials(){
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
    </section>
  );
}