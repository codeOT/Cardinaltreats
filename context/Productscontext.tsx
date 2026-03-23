"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Product } from "@/types";

// ─── State & Actions ──────────────────────────────────────────────────────────
interface ProductsState {
  products: Product[];
  loading: boolean;
}

type ProductsAction =
  | { type: "SET"; products: Product[] }
  | { type: "UPDATE_PRODUCT"; id: number; patch: Partial<Product> }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "DELETE_PRODUCT"; id: number }
  | { type: "LOADING"; loading: boolean };

function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: action.loading };
    case "SET":
      return { ...state, products: action.products };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p
        ),
      };
    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.product] };
    case "DELETE_PRODUCT":
      return { ...state, products: state.products.filter((p) => p.id !== action.id) };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  updateProduct: (id: number, patch: Partial<Product>) => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  resetProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ProductsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(productsReducer, {
    products: [],
    loading: true,
  });

  const refreshProducts = useCallback(async () => {
    dispatch({ type: "LOADING", loading: true });
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = await res.json();
    dispatch({ type: "SET", products: data.products || [] });
    dispatch({ type: "LOADING", loading: false });
  }, []);

  useEffect(() => {
    refreshProducts().catch(() => dispatch({ type: "LOADING", loading: false }));
  }, [refreshProducts]);

  const updateProduct = useCallback(async (id: number, patch: Partial<Product>) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to update product");
    const data = await res.json();
    if (data.product) dispatch({ type: "UPDATE_PRODUCT", id, patch: data.product });
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to add product");
    const data = await res.json();
    if (data.product) dispatch({ type: "ADD_PRODUCT", product: data.product });
  }, []);

  const deleteProduct = useCallback(async (id: number) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete product");
    dispatch({ type: "DELETE_PRODUCT", id });
  }, []);

  const resetProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products/reset", { method: "POST" });
    if (!res.ok) throw new Error("Failed to reset products");
    await refreshProducts();
  }, [refreshProducts]);

  return (
    <ProductsContext.Provider
      value={{
        products: state.products,
        loading: state.loading,
        refreshProducts,
        updateProduct,
        addProduct,
        deleteProduct,
        resetProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside <ProductsProvider>");
  return ctx;
}