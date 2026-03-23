import { CashewSVG } from "@/app/components/product/CashewSVG";
import { IcArrow } from "@/app/components/ui/icons";
import { VALUE_PROPS } from "@/data/products";
import Image from "next/image";

export function AboutSection(){
  return (
    <section id="about" className="bg-stone-50 py-24 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Visual */}
        <div className="relative">
          <div className="relative bg-amber-100 rounded-[2.5rem] aspect-square max-w-[500px] mx-auto flex items-center justify-center overflow-hidden border border-amber-200">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border-2 border-dashed border-amber-300/50 anim-spin" />
            </div>
            <div className="anim-float relative z-0">
              {/* <CashewSVG color="#D97706" size={170} /> */}
              <Image src="/images/ngc.png" alt="Cashew" width={900} height={600} />
            </div>
            <div className="absolute bottom-8 left-6 bg-white rounded-2xl px-4 py-3 shadow-lg border border-stone-100">
              <p className="font-bold text-stone-800 text-sm">Grade A Cashews</p>
              <p className="text-stone-400 text-xs mt-0.5">Farm to pack in 48hrs</p>
            </div>
            <div className="absolute top-7 right-5 bg-white rounded-2xl px-4 py-3 shadow-lg border border-stone-100">
              <p className="font-bold text-green-600 text-sm">100% Natural</p>
              <p className="text-stone-400 text-xs mt-0.5">Zero preservatives</p>
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="text-[10px] font-bold tracking-[.15em] uppercase text-amber-500 mb-3">
            Our Story
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-black text-stone-900 leading-[.95] mb-7">
            Rooted in<br />
            <span className="text-amber-500">Nigerian</span> Tradition.
          </h2>
          <p className="text-stone-500 leading-relaxed mb-4 text-[.95rem]">
            Cardinal Treats was born from a simple belief: Nigeria deserves world-class artisanal snacks.
            We source only the finest cashews from verified local farmers and roast them in small batches
            guaranteeing peak freshness in every pack.
          </p>
          <p className="text-stone-500 leading-relaxed mb-10 text-[.95rem]">
            No artificial preservatives. No corners cut. Just honest, delicious cashews crafted with
            care, pride, and an obsessive attention to flavour.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {VALUE_PROPS.map((vp) => (
              <div
                key={vp.title}
                className="bg-white rounded-2xl p-4 border border-stone-100 hover:border-amber-200 hover:bg-amber-50/40 transition-all"
              >
                <span className="text-2xl mb-2 block">{vp.icon}</span>
                <p className="font-bold text-stone-700 text-sm">{vp.title}</p>
                <p className="text-stone-400 text-xs mt-0.5">{vp.sub}</p>
              </div>
            ))}
          </div>

          <button className="bg-stone-900 hover:bg-stone-700 text-white font-bold px-8 py-4 rounded-full flex items-center gap-2 w-fit text-sm shadow-md transition-all">
            Learn More <IcArrow />
          </button>
        </div>
      </div>
    </section>
  );
}