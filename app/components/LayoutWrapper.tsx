"use client";

import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { useState } from "react";
import React from "react";
import { useProducts } from "@/context/Productscontext";
import { ProductModal } from "@/app/components/product/ProductModal";
import { CartSidebar } from "@/app/components/cart/CartSidebar";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
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