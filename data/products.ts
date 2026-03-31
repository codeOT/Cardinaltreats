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
 
];

const TESTIMONIAL_TEXTS = [
  "Fresh, crunchy and perfectly roasted. This has become my go-to snack.",
  "Delivery was quick and the taste is premium. Definitely ordering again.",
  "The flavour balance is amazing. You can taste the quality immediately.",
  "I bought one pack and ended up buying three more the same week.",
  "Clean ingredients, great texture, and very satisfying portion size.",
  "These are easily the best cashews I have had in a long time.",
];

const TESTIMONIAL_FIRST_NAMES = [
  "Amara","Chidi","Fatima","Tunde","Zainab","Emeka","Ada","Bola","Kelechi","Aisha",
  "David","Ife","Uche","Seyi","Mariam","Ibrahim","Chinwe","Tope","Blessing","Ruth",
  "Olu","Nneka","Yusuf","Ngozi","Sola","Halima","Chuka","Funke","Kemi","Abdul",
  "Efe","Zainab","Chinedu","Amina","Tayo","Hadiza","Chukwuemeka","Sade","Okechukwu",
  "Nkechi","Ijeoma","Bamidele","Rasheed","Chisom","Khadija","Emmanuel","Oluwaseun",
  "Chika","Halima","Chukwu","Sade","Okechukwu","Nkechi","Ijeoma","Bamidele","Rasheed",
  "Chisom","Khadija","Emmanuel","Oluwaseun","Chika","Halima","Chukwu","Sade","Okechukwu",
  
];
 
const TESTIMONIAL_LAST_INITIALS = ["A.","B.","C.","D.","E.","F.","G.","H.","I.","J.","K.","L.","M.","N.","O.","P.","Q.","R.","S.","T.", "U.","V.","W.","X.","Y.","Z."];
const TESTIMONIAL_LOCATIONS = [
  "Lagos", "Abuja", "Kano", "Port Harcourt", "Ibadan", "Enugu", "Kaduna", "Ilorin", "Jos", "Benin", "Owerri", 
  "Abeokuta", "Calabar", "Maiduguri", "Sokoto", "Uyo", "Yola", "Zaria", "Asaba", "Gombe", "Makurdi", "Minna", 
  "Damaturu", "Jalingo", "Katsina", "Lafia", "Lokoja", "Osogbo", "Portharcourt", "Sapele", "Warri", "Yenagoa",
  "Zungeru", "Akwanga", "Bida", "Gusau", "Kano", "Mubi", "Nnewi", "Oshogbo", "Sokoto", "Umuahia", "Yola",];

const TESTIMONIAL_FLAVOURS = ["Salted", "Unsalted", "Pepper Spiced", "Caramel Glazed"];

const TESTIMONIAL_TIMES = [
  "just now", "2 mins ago", "5 mins ago", "12 mins ago", "25 mins ago",
  "40 mins ago", "1 hour ago", "2 hours ago", "3 hours ago", "5 hours ago",
  "yesterday", "2 days ago", "3 days ago", "last week", "2 weeks ago", "last month", 
  "2 months ago", "4 mins ago", "10 mins ago", "20 mins ago", "30 mins ago", "45 mins ago", 
  "1.5 hours ago", "4 hours ago", "6 hours ago",
];

export const TESTIMONIALS: Testimonial[] = Array.from({ length: 500 }, (_, i) => {
  const first = TESTIMONIAL_FIRST_NAMES[i % TESTIMONIAL_FIRST_NAMES.length];
  const last = TESTIMONIAL_LAST_INITIALS[(i * 7) % TESTIMONIAL_LAST_INITIALS.length];
  return {
    name: `${first} ${last}`,
    location: TESTIMONIAL_LOCATIONS[(i * 3) % TESTIMONIAL_LOCATIONS.length],
    flavour: TESTIMONIAL_FLAVOURS[(i * 5) % TESTIMONIAL_FLAVOURS.length],
    text: TESTIMONIAL_TEXTS[(i * 11) % TESTIMONIAL_TEXTS.length],
    time: TESTIMONIAL_TIMES[(i * 13) % TESTIMONIAL_TIMES.length],
  };
});

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