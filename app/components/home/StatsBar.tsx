import { STATS } from "@/data/products";

export function StatsBar(){
  return (
    <div className="bg-stone-50 border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid-cols-1 md:grid md:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.unit} className="text-center px-6 first:pl-0 last:pr-0 py-6">
              <p className="font-display text-4xl font-black text-stone-900 leading-none">
                {s.num} <span className="text-amber-500">{s.unit}</span>
              </p>
              <p className="text-stone-400 text-xs mt-1.5 font-medium">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}