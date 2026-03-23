import type { Product, Testimonial, StatItem, ValueProp } from "@/types";

export const PRODUCTS: Product[] = [
  {
    id: 1, slug: "salted",
    name: "Salted", subtitle: "The Classic",
    price: 4500, weight: "250g", badge: "Best Seller",
    tagline: "Simple. Perfect. Timeless.",
    dotColor: "#D97706", emoji: "🧂",
    twBg: "bg-amber-50", twText: "text-amber-700", twBorder: "border-amber-200", twAccentBg: "bg-amber-500",
    description: "Premium Grade-A cashews slow-roasted and finished with hand-harvested Atlantic sea salt. Clean, satisfying, and completely addictive.",
    tags: ["Gluten Free", "High Protein", "Natural"],
  },
  {
    id: 2, slug: "unsalted",
    name: "Unsalted", subtitle: "The Pure One",
    price: 4200, weight: "250g", badge: "Health Pick",
    tagline: "Nothing added. Nothing removed.",
    dotColor: "#16A34A", emoji: "🌿",
    twBg: "bg-green-50", twText: "text-green-700", twBorder: "border-green-200", twAccentBg: "bg-green-500",
    description: "Raw, buttery cashews as nature intended. Zero additives, zero compromise, just the full, creamy flavour of premium Nigerian cashews.",
    tags: ["Vegan", "Raw", "Gluten Free"],
  },
  {
    id: 3, slug: "Pepper",
    name: " Pepper", subtitle: "The Bold One",
    price: 4800, weight: "250g", badge: "Fan Fav",
    tagline: "For those who like it interesting.",
    dotColor: "#44403C", emoji: "🌶️",
    twBg: "bg-stone-100", twText: "text-stone-700", twBorder: "border-stone-300", twAccentBg: "bg-stone-700",
    description: "Coarsely cracked black pepper over perfectly roasted cashews. A snack with character warm, punchy, and completely irresistible.",
    tags: ["Bold", "Spicy", "Protein Rich"],
  },
  {
    id: 4, slug: "caramel",
    name: "Caramel", subtitle: "The Indulgent",
    price: 5200, weight: "250g", badge: "Premium",
    tagline: "Treat yourself. You deserve it.",
    dotColor: "#EA580C", emoji: "🍯",
    twBg: "bg-orange-50", twText: "text-orange-700", twBorder: "border-orange-200", twAccentBg: "bg-orange-500",
    description: "Hand-crafted golden caramel drizzled over slow-roasted cashews. The ultimate balance of sweet, salty, and utterly indulgent.",
    tags: ["Indulgent", "Artisanal", "Sweet"],
  },
  {
    id: 5, slug: "cinnamon",
    name: "Cinnamon", subtitle: "The New One",
    price: 5000, weight: "250g", badge: "New",
    tagline: "Cool snack.",
    dotColor: "#BE185D", emoji: "✨",
    twBg: "bg-pink-50", twText: "text-pink-700", twBorder: "border-pink-200", twAccentBg: "bg-pink-500",
    description: "Ceylon cinnamon: the finest in the world dusted over warm-roasted cashews. Aromatic, warming, and totally unique.",
    tags: ["Aromatic", "Warming", "Unique"],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  { name: "Amara O.", location: "Lagos", flavour: "Caramel ", text: "I've tried every 'premium' cashew brand in Lagos. Nothing comes close. The caramel ones are on another level entirely." },
  { name: "Chidi N.", location: "Abuja", flavour: "Pepper", text: "Ordered the Black Pepper on a whim. Now I'm on my fourth pack this month. They should come with a warning label." },
  { name: "Fatima A.", location: "Kano", flavour: "Unsalted", text: "Finally found a healthy snack my whole family agrees on. The natural ones are a weekly staple in our house now." },
];

export const STATS: StatItem[] = [
  { num: "5", unit: "Flavours", sub: "And counting" },
  { num: "100%", unit: "Natural", sub: "No additives" },
  { num: "48hr", unit: "Delivery", sub: "Nationwide" },
];

export const VALUE_PROPS: ValueProp[] = [
  { icon: "🌱", title: "Farm Sourced", sub: "Verified Nigerian farms" },
  { icon: "🔥", title: "Small Batch", sub: "Roasted fresh daily" },
  { icon: "✅", title: "No Additives", sub: "Clean ingredients only" },
  { icon: "📦", title: "Fresh Packed", sub: "Sealed for peak flavour" },
];

export const FILTERS = ["All", "Savoury", "Sweet", "Spicy", "Natural"];

export const FILTER_MAP: Record<string, number[]> = {
  All: [1, 2, 3, 4, 5],
  Savoury: [1],
  Sweet: [4, 5],
  Spicy: [3],
  Natural: [2],
};

export const FREE_DELIVERY_THRESHOLD = 15000;