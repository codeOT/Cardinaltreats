"use client";

import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { useState } from "react";
import React from "react";
import { usePathname } from "next/navigation";
import { useProducts } from "@/context/Productscontext";
import { ProductModal } from "@/app/components/product/ProductModal";
import { CartSidebar } from "@/app/components/cart/CartSidebar";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith("/admin") ?? false;

  const [cartOpen, setCartOpen] = useState(false);
  const [modal, setModal] = useState<Product | null>(null);
  const { products } = useProducts();
  const { addToCart } = useCart();

  const handleProductFooterClick = (id: number): void => {
    const p = products.find((p) => p.id === id);
    if (p) setModal(p);
  };

  const handleAddToCart = (product: Product, qty: number = 1): void => {
    addToCart(product, qty);
    setModal(null);
  };

  if (isAdminArea) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main>
        {children}
      </main>
      <Footer onProductClick={handleProductFooterClick} />

      {modal && (
        <ProductModal
          product={modal}
          onClose={() => setModal(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
    </>
  );
}