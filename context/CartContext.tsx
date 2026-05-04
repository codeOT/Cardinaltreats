"use client";

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from "react";
import type { CartItem, Product } from "@/types";

// ─── State & Actions ──────────────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; product: Product; qty: number; selectedGrams?: number }
  | { type: "REMOVE"; id: number }
  | { type: "UPDATE_QTY"; id: number; delta: number }
  | { type: "SET_WEIGHT"; id: number; grams: number }
  | { type: "CLEAR" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const isCarton =
        (action.product as any).packType === "carton" ||
        String((action.product as any).weight || "").toLowerCase().includes("pack");
      const inferredFromWeight = Number(
        String((action.product as any).weight || "").replace(/[^\d]/g, "")
      );
      const grams =
        isCarton
          ? undefined
          : action.selectedGrams ??
            ((action.product as any).selectedGrams as number | undefined) ??
            (inferredFromWeight === 50 || inferredFromWeight === 100 ? inferredFromWeight : 100);
      const custom50 = Number((action.product as any).price50);
      const custom100 = Number((action.product as any).price100);
      const hasCustom50 = Number.isFinite(custom50) && custom50 > 0;
      const hasCustom100 = Number.isFinite(custom100) && custom100 > 0;
      const weightNum = Number(String(action.product.weight || "").replace(/[^\d]/g, ""));
      const hasPrice50 = hasCustom50 || (weightNum === 50 && Number(action.product.price) > 0);
      const hasPrice100 = hasCustom100 || (weightNum === 100 && Number(action.product.price) > 0);
      const basePricePer100 =
        (action.product as any).basePricePer100 ??
        (hasCustom100 ? custom100 : hasPrice100 ? action.product.price : action.product.price);
      const unitPrice = isCarton
        ? Number(action.product.price)
        : grams === 50
          ? hasPrice50
            ? custom50
            : action.product.price
          : hasPrice100
            ? custom100
            : basePricePer100;

      const stock50 = (action.product as any).stockQty50;
      const stock100 = (action.product as any).stockQty100;
      const stockLegacy = (action.product as any).stockQty;
      const available = isCarton
        ? Number(stockLegacy ?? 0) > 0
        : grams === 50
          ? Number(stock50 ?? stockLegacy ?? 0) > 0
          : Number(stock100 ?? stockLegacy ?? 0) > 0;
      if (!available) {
        // Do not add out-of-stock grams option
        return state;
      }

      const existing = state.items.find((i) =>
        i.id === action.product.id &&
        ((i as any).packType === "carton"
          ? isCarton
          : (i.selectedGrams ?? 100) === grams)
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.product.id &&
            (((i as any).packType === "carton"
              ? isCarton
              : (i.selectedGrams ?? 100) === grams))
              ? { ...i, qty: i.qty + action.qty }
              : i
          ),
        };
      }
      const newItem: CartItem = {
        ...(action.product as any),
        qty: action.qty,
        selectedGrams: grams,
        basePricePer100,
        price: unitPrice,
        weight: isCarton ? action.product.weight : `${grams}g`,
      };
      return { items: [...state.items, newItem] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QTY":
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: Math.max(1, i.qty + action.delta) } : i
        ),
      };
    case "SET_WEIGHT":
      return {
        items: state.items.map((i) => {
          if (i.id !== action.id) return i;
          if ((i as any).packType === "carton" || String(i.weight || "").toLowerCase().includes("pack")) {
            return i;
          }
          const grams = action.grams;

          const stock50 = (i as any).stockQty50;
          const stock100 = (i as any).stockQty100;
          const stockLegacy = (i as any).stockQty;
          const available =
            grams === 50
              ? Number(stock50 ?? stockLegacy ?? 0) > 0
              : Number(stock100 ?? stockLegacy ?? 0) > 0;
          if (!available) return i;

          const custom50 = Number((i as any).price50);
          const custom100 = Number((i as any).price100);
          const hasCustom50 = Number.isFinite(custom50) && custom50 > 0;
          const hasCustom100 = Number.isFinite(custom100) && custom100 > 0;
          const weightNum = Number(String(i.weight || "").replace(/[^\d]/g, ""));
          const hasPrice50 = hasCustom50 || (weightNum === 50 && Number(i.price) > 0);
          const hasPrice100 = hasCustom100 || (weightNum === 100 && Number(i.price) > 0);
          const basePricePer100 =
            i.basePricePer100 ?? (hasCustom100 ? custom100 : i.price);
          const unitPrice =
            grams === 50
              ? hasPrice50
                ? custom50
                : i.price
              : hasPrice100
                ? custom100
                : basePricePer100;
          return {
            ...i,
            selectedGrams: grams,
            basePricePer100,
            price: unitPrice,
            weight: `${grams}g`,
          };
        }),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, qty?: number, selectedGrams?: number) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  setItemWeight: (id: number, grams: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate cart from localStorage once on mount
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? window.localStorage.getItem("ct_cart") : null;
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          // Basic shape check
          const items: CartItem[] = parsed.map((item) => {
            const isCarton =
              (item as any).packType === "carton" ||
              String(item.weight || "").toLowerCase().includes("pack");
            if (isCarton) {
              return {
                ...item,
                selectedGrams: undefined,
                basePricePer100: undefined,
                price: Number(item.price),
              };
            }
            const grams = item.selectedGrams ?? 100;
            const custom50 = Number((item as any).price50);
            const custom100 = Number((item as any).price100);
            const hasCustom50 = Number.isFinite(custom50) && custom50 > 0;
            const hasCustom100 = Number.isFinite(custom100) && custom100 > 0;
            const weightNum = Number(String(item.weight || "").replace(/[^\d]/g, ""));
            const hasPrice50 = hasCustom50 || (weightNum === 50 && Number(item.price) > 0);
            const hasPrice100 = hasCustom100 || (weightNum === 100 && Number(item.price) > 0);
            const basePricePer100 = item.basePricePer100 ?? (hasCustom100 ? custom100 : item.price);
            const unitPrice =
              grams === 50
                ? hasPrice50
                  ? custom50
                  : item.price
                : hasPrice100
                  ? custom100
                  : basePricePer100;
            return {
              ...item,
              selectedGrams: grams,
              basePricePer100,
              price: unitPrice,
              weight: `${grams}g`,
            };
          });
          dispatch({ type: "CLEAR" });
          items.forEach((item) => {
            dispatch({ type: "ADD", product: item, qty: item.qty ?? 1, selectedGrams: item.selectedGrams } as any);
          });
        }
      }
    } catch {
      // ignore bad cart data
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("ct_cart", JSON.stringify(state.items));
    } catch {
      // ignore storage errors
    }
  }, [state.items]);

  const addToCart = useCallback((product: Product, qty: number = 1, selectedGrams?: number) => {
    dispatch({ type: "ADD", product, qty, selectedGrams });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  const updateQty = useCallback((id: number, delta: number) => {
    dispatch({ type: "UPDATE_QTY", id, delta });
  }, []);

  const setItemWeight = useCallback((id: number, grams: number) => {
    dispatch({ type: "SET_WEIGHT", id, grams });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const cartCount = state.items.reduce((s, i) => s + i.qty, 0);
  const cartTotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items: state.items, cartCount, cartTotal, addToCart, removeFromCart, updateQty, setItemWeight, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}