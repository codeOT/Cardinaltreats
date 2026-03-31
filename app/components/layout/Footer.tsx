import { PRODUCTS } from "@/data/products";
import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  onProductClick: (id: number) => void;
}

export function Footer({ onProductClick }: FooterProps) {
  const date = new Date();
  return (
    <footer className="bg-white border-t border-stone-100 px-6 py-14">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 pb-10 border-b border-stone-100">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/images/ct.png"
                alt="Cardinal Treats"
                width={200}
                height={90}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs mb-6">
              Premium handcrafted cashew snacks made with love in Nigeria.
              Extraordinary flavour for everyday moments.
            </p>
            <div className="flex gap-2">
              {/* {["IG", "TW", "FB", "LI"].map((s) => (
                <button
                  key={s}
                  className="w-9 h-9 rounded-full bg-stone-100 hover:bg-amber-100 hover:text-amber-600 text-stone-400 text-[10px] font-black flex items-center justify-center transition-colors"
                >
                  {s}
                </button>
              ))} */}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <p className="text-[10px] font-bold tracking-[.14em] uppercase text-stone-400 mb-4">
              Shop
            </p>
            <ul className="space-y-2.5">
              {PRODUCTS.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onProductClick(p.id)}
                    className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="text-[10px] font-bold tracking-[.14em] uppercase text-stone-400 mb-4">
              Company
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/contact" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/policies" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                  Refund & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8">
          <p className="text-xs text-stone-400">
            © {date.getFullYear()} Cardinal Treats. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
