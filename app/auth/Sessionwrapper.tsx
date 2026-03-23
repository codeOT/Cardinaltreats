"use client";

import { SessionProvider } from "next-auth/react";
import { ProductsProvider } from "@/context/Productscontext";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }: { children: React.ReactNode }){
  return (
    <SessionProvider>
      <ProductsProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ProductsProvider>
    </SessionProvider>
  );
}