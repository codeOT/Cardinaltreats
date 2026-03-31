export interface Product {
  id:         number;
  slug:       string;
  name:       string;
  subtitle:   string;
  price:      number;
  weight:     string;
  badge:      string;
  tagline:    string;
  dotColor:   string;
  emoji:      string;
  description: string;
  tags:       string[];
  twBg:       string;
  twText:     string;
  twBorder:   string;
  twAccentBg: string;
  imageUrl?:  string;
  
  stockQty?:  number;
 
  stockQty50?: number;
  
  stockQty100?: number;
}

export type ProductField = keyof Product;

export interface CartItem extends Product {
  qty: number;
 
  selectedGrams?: number;
  /** Base price for 100g used to recalculate when size changes. */
  basePricePer100?: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ShippingAddress {
  fullName: string;
  phone:    string;
  address:  string;
  city:     string;
  state:    string;
}

export interface OrderItem {
  productId: number;
  slug:      string;
  name:      string;
  price:     number;
  qty:       number;
  /** Pack size selected by customer (e.g. 50 or 100). */
  grams?:    number;
  imageUrl?: string;
}

export interface DeliveryAddress {
  _id?: string;
  userId?: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface Order {
  _id:             string;
  userId:          string;
  userEmail:       string | null;
  userName:        string | null;
  items:           OrderItem[];
  subtotal:        number;
  discount:        number;
  discountPercent: number;
  total:           number;
  couponCode?:     string;
  status:          OrderStatus;
  paystackReference: string;
  shippingAddress?:  ShippingAddress;
  deliveryAddress?:  DeliveryAddress;
  createdAt:       string;
}

// Coupon — matches your real DB schema
export interface Coupon {
  
  description?:    string;
  code:            string;
  discountPercent: number;   // e.g. 10 = 10% off
  active:          boolean;
  validFrom?:      string;
  validTo?:        string;
  maxUses?:        number;
  usedCount:       number;
}

export interface Testimonial {
  name:    string;
  location: string;
  text:    string;
  flavour: string;
  time:    string;
}

export interface StatItem {
  num:  string;
  unit: string;
  sub:  string;
}

export interface ValueProp {
  icon:  string;
  title: string;
  sub:   string;
}

export interface SessionUser {
  id:     string;
  name?:  string | null;
  email?: string | null;
  role?:  string;
}