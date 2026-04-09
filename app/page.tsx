"use client";

import { useState } from "react";
import { Hero } from "@/app/components/home/Home";
import { StatsBar } from "@/app/components/home/StatsBar";
import { ShopSection } from "@/app/components/home/ShopSection";
import { DeliveryBanner } from "@/app/components/home/DeliveryBanner";
import { AboutSection } from "@/app/components/home/AboutSection";
import { Testimonials } from "@/app/components/home/Testimonials";
import { Newsletter } from "@/app/components/home/Newsletter";
import { ProductModal } from "@/app/components/product/ProductModal";
import { CartSidebar } from "@/app/components/cart/CartSidebar";
import { Toast } from "@/app/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/./context/Productscontext";
import { useToast } from "@/hooks/useToast";
import type { Product } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [modal, setModal] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { toast, showToast } = useToast();

  const scrollTo = (id: string): void =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleAddToCart = (product: Product, qty: number = 1): void => {
    addToCart(product, qty);
    showToast(`${product.emoji} ${product.name} added to cart!`);
    setModal(null);
  };

  const whatsappNumber = "+2349040244449";
  const whatsappMessage = "Hi! I need support with my order on Cardinal Treats.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleProductFooterClick = (id: number): void => {
    const p = products.find((p) => p.id === id);
    if (p) setModal(p);
  };

  return (
    <>
      <Hero
        onScrollToShop={() => scrollTo("shop")}
        onScrollToAbout={() => scrollTo("about")}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <StatsBar />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5 }}
      >
        <ShopSection
          onOpenModal={setModal}
          onAddToCart={(p) => handleAddToCart(p, 1)}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <DeliveryBanner onShopClick={() => scrollTo("shop")} />
      </motion.div>

      {/* <AboutSection /> */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <Testimonials />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <Newsletter onSubscribe={showToast} />
      </motion.div>

      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal}
            onClose={() => setModal(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
      </AnimatePresence>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-[120] bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl w-14 h-14 flex items-center justify-center transition-all hover:scale-105"
        aria-label="Chat with support on WhatsApp"
        title="Chat with support"
      >
        <Image
          src="/images/whatsapp.png"
          alt="WhatsApp Support"
          width={28}
          height={28}
          className="w-7 h-7"
        />
      </a>

      {toast && <Toast message={toast} />}
    </>
  );
}