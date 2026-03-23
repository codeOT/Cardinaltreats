"use client";

import { useEffect, useState } from "react";
import { IcArrow } from "@/app/components/ui/icons";
import type { Product } from "@/types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface HeroProps {
  onOpenModal: (p: Product) => void;
  onScrollToShop: () => void;
  onScrollToAbout: () => void;
}

export function Hero({ onOpenModal, onScrollToShop, onScrollToAbout }: HeroProps){
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const heroImages = [
    "/images/p.png",
    "/images/Coconut_Coated.png",
    "/images/Pepper_Spiced.png",
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, heroImages.length]);

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Full-width carousel */}
      <div className="relative w-full h-[500px] sm:h-[600px] lg:h-[700px]">
        {/* Image carousel */}
        <AnimatePresence mode="wait">
          {heroImages.map((image, idx) => (
          <motion.div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: idx === currentImageIndex ? 1 : 0, scale: idx === currentImageIndex ? 1 : 1.02 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={image}
              alt={`Hero cashew ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === 0}
            />
          </motion.div>
        ))}
        </AnimatePresence>

        {/* Content overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent flex flex-col justify-between p-6 sm:p-8 lg:p-12">
          {/* Top section */}
          <div />

          {/* Bottom section */}
          <motion.div
            className="space-y-6 max-w-2xl"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="">
              <motion.h1
                className="text-4xl  sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
              >
                Snacking, Reimagined
              </motion.h1>
              <motion.p
                className="text-gray-100 text-base sm:text-lg leading-relaxed"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Five bold flavours, one obsessive standard of quality. Slow-roasted cashews sourced from Nigerian farms.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-start gap-3 pt-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.button
                onClick={onScrollToShop}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-all duration-200 shadow-lg"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Shop Now <IcArrow />
              </motion.button>
             
            </motion.div>
          </motion.div>
        </div>

        {/* Carousel controls */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 z-10">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentImageIndex(idx);
                setIsAutoPlay(false);
                setTimeout(() => setIsAutoPlay(true), 6000);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentImageIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation arrows (optional) */}
        {/* <button
          onClick={() => {
            setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
            setIsAutoPlay(false);
            setTimeout(() => setIsAutoPlay(true), 6000);
          }}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/30 hover:bg-white/50 text-white transition-all"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
            setIsAutoPlay(false);
            setTimeout(() => setIsAutoPlay(true), 6000);
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/30 hover:bg-white/50 text-white transition-all"
          aria-label="Next image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button> */}

        {/* Image counter */}
        {/* <div className="absolute top-6 right-6 px-4 py-2 bg-black/50 text-white text-sm rounded-full z-10">
          {currentImageIndex + 1} / {heroImages.length}
        </div> */}
      </div>
    </section>
  );
}