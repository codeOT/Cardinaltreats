"use client";

import { useState } from "react";
import { useScrolled } from "@/hooks/useScrolled";
import { useCart } from "@/context/CartContext";
import { IcCart } from "@/app/components/ui/icons";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface NavbarProps {
  onCartOpen: () => void;
}

export function Navbar({ onCartOpen }: NavbarProps) {
  const scrolled = useScrolled(50);
  const { cartCount } = useCart();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string): void =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <header
      className={`fixed  top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity">
          <Image
            src="/images/ct.png"
            alt="Cardinal Treats"
            width={120}
            height={40}
            className="h-14 w-auto" 
          />
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {(["Shop", "Contact"] as const).map((l) => (
            <button
              key={l}
              onClick={() =>
                l === "Shop"
                  ? scrollTo("shop")
               : undefined
              }
              className={`relative text-sm font-medium transition-colors ${
                scrolled
                  ? "text-gray-600 hover:text-gray-900"
                  : "text-gray-900 hover:text-black"
              }`}
            >
              {l}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-200 ${
                scrolled ? "bg-gray-900" : "bg-white"
              } group-hover:w-full`} />
            </button>
          ))}
        </nav>

        {/* Auth + Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className={`md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
              scrolled ? "text-gray-800 hover:bg-gray-100" : "text-gray-900 hover:bg-white/30"
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>

          {status === "authenticated" ? (
            <>
              <Link
                href="/account"
                className={`hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  scrolled
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-gray-900 hover:text-black hover:bg-white/10"
                }`}
              >
                Hi, {session.user?.name || session.user?.email?.split("@")[0]}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={`hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  scrolled
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-gray-900 hover:text-black hover:bg-white/10"
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className={`hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  scrolled
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-gray-900 hover:text-black hover:bg-white/10"
                }`}
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className={`hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  scrolled
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                }`}
              >
                Sign up
              </Link>
            </>
          )}

          <button
            onClick={onCartOpen}
            className={`relative flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
              scrolled
                ? "bg-gray-900 text-white hover:bg-gray-800 shadow-md"
                : "bg-white text-gray-900 hover:bg-gray-100"
            }`}
          >
            <IcCart />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur px-4 py-3 space-y-2 shadow-sm">
          <button
            onClick={() => {
              scrollTo("shop");
              setMobileOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Shop
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Contact
          </button>

          {status === "authenticated" ? (
            <>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="block w-full px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
              >
                My Account
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/auth/signin"
                onClick={() => setMobileOpen(false)}
                className="text-center px-3 py-2 rounded-lg text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileOpen(false)}
                className="text-center px-3 py-2 rounded-lg text-sm font-semibold text-white bg-stone-900 hover:bg-stone-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}