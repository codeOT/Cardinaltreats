"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useProducts } from "@/./context/Productscontext";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/app/components/ui/Toast";
import { CashewSVG } from "@/app/components/product/CashewSVG";
import { fmt } from "@/lib/utils";
import type { Product, Order, Coupon } from "@/types";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

type AdminTab = "overview" | "products" | "orders" | "coupons" | "team" | "settings";

const COLOUR_THEMES = [
  { label: "Amber",  dotColor: "#D97706", twBg: "bg-amber-50",  twText: "text-amber-700",  twBorder: "border-amber-200",  twAccentBg: "bg-amber-500"  },
  { label: "Green",  dotColor: "#16A34A", twBg: "bg-green-50",  twText: "text-green-700",  twBorder: "border-green-200",  twAccentBg: "bg-green-500"  },
  { label: "Blue",   dotColor: "#1D4ED8", twBg: "bg-blue-50",   twText: "text-blue-700",   twBorder: "border-blue-200",   twAccentBg: "bg-blue-500"   },
  { label: "Orange", dotColor: "#EA580C", twBg: "bg-orange-50", twText: "text-orange-700", twBorder: "border-orange-200", twAccentBg: "bg-orange-500" },
  { label: "Pink",   dotColor: "#BE185D", twBg: "bg-pink-50",   twText: "text-pink-700",   twBorder: "border-pink-200",   twAccentBg: "bg-pink-500"   },
  { label: "Purple", dotColor: "#7C3AED", twBg: "bg-violet-50", twText: "text-violet-700", twBorder: "border-violet-200", twAccentBg: "bg-violet-500" },
];


const IcEdit    = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcTrash   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcPlus    = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcUpload  = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IcImage   = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IcX       = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcCheck   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const IcReset   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9 9 0 00-9 9"/><polyline points="3 3 3 9 9 9"/></svg>;
const IcEye     = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcDownload = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

// Types
interface EditFormState {
  name: string;
  subtitle: string;
  price: string;
  weight: string;
  badge: string;
  tagline: string;
  description: string;
  emoji: string;
  tags: string;
  dotColor: string;
  twBg: string;
  twText: string;
  twBorder: string;
  twAccentBg: string;
  imageUrl: string;
  stockQty50: string;
  stockQty100: string;
}

const DEFAULT_NEW_PRODUCT: EditFormState = {
  name: "",
  subtitle: "",
  price: "",
  weight: "100g",
  badge: "New",
  tagline: "",
  description: "",
  emoji: "🥜",
  tags: "",
  dotColor: COLOUR_THEMES[0].dotColor,
  twBg: COLOUR_THEMES[0].twBg,
  twText: COLOUR_THEMES[0].twText,
  twBorder: COLOUR_THEMES[0].twBorder,
  twAccentBg: COLOUR_THEMES[0].twAccentBg,
  imageUrl: "",
  stockQty50: "100",
  stockQty100: "100",
};

function productToForm(p: Product): EditFormState {
  const s50 = (p as any).stockQty50 ?? (p as any).stockQty ?? 100;
  const s100 = (p as any).stockQty100 ?? (p as any).stockQty ?? 100;
  return {
    name: p.name,
    subtitle: p.subtitle,
    price: String(p.price),
    weight: p.weight,
    badge: p.badge,
    tagline: p.tagline,
    description: p.description,
    emoji: p.emoji,
    tags: p.tags.join(", "),
    dotColor: p.dotColor,
    twBg: p.twBg,
    twText: p.twText,
    twBorder: p.twBorder,
    twAccentBg: p.twAccentBg,
    imageUrl: p.imageUrl ?? "",
    stockQty50: String(s50),
    stockQty100: String(s100),
  };
}

// Sub-components 
function Label({ children }: { children: React.ReactNode }){
  return <label className="block text-xs font-semibold text-gray-700 mb-2">{children}</label>;
}

function Input({
  value, onChange, placeholder = "", type = "text", className = "",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}){
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${className}`}
    />
  );
}

function Textarea({
  value, onChange, placeholder = "", rows = 3,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}){
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
    />
  );
}

// ─── Image upload area ────────────────────────────────────────────────────────
function ImageUpload({
  imageUrl, dotColor, onImageChange,
}: {
  imageUrl: string; dotColor: string; onImageChange: (url: string) => void;
}){
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onImageChange(e.target.result as string);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <Label>Product Image</Label>

      {/* Preview */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }`}
        style={{ height: 180 }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center group">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
                <IcUpload /> Change Image
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onImageChange(""); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <IcX />
            </button>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <IcImage />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Drop image here or click</p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP</p>
            </div>
          </div>
        )}
      </div>

      {/* URL input */}
      <Input
        value={imageUrl}
        onChange={onImageChange}
        placeholder="Or paste an image URL…"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

function AdminProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}){
  const [confirmDelete, setConfirmDelete] = useState(false);
  const stock50 = (product as any).stockQty50 ?? (product as any).stockQty ?? null;
  const stock100 = (product as any).stockQty100 ?? (product as any).stockQty ?? null;
  const hasAnyStock =
    stock50 == null && stock100 == null
      ? Number((product as any).stockQty ?? 0) > 0
      : Number(stock50 ?? 0) > 0 || Number(stock100 ?? 0) > 0;

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors group bg-white">
      {/* Image / illustration */}
      <div className="relative h-40 flex items-center justify-center overflow-hidden bg-gray-50">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <CashewSVG color={product.dotColor} size={80} />
          </div>
        )}
        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="w-9 h-9 rounded-lg bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Edit product"
          >
            <IcEdit />
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-9 h-9 rounded-lg bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Delete product"
            >
              <IcTrash />
            </button>
          ) : (
            <div className="flex gap-1 bg-white rounded-lg px-2 py-1 shadow-md">
              <button
                onClick={() => { onDelete(); setConfirmDelete(false); }}
                className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white hover:bg-red-600"
              >
                <IcCheck />
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                <IcX />
              </button>
            </div>
          )}
        </div>
        {/* Badge */}
        <span className={`absolute top-2 left-2 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-white shadow-sm ${product.twText}`}>
          {product.badge}
        </span>
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
            <p className={`text-xs font-medium ${product.twText} truncate`}>{product.subtitle}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
            !hasAnyStock
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}>
            {!hasAnyStock ? "Out" : "In"}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.description}</p>
        <p className="text-sm font-semibold text-gray-900">{fmt(product.price)}</p>
      </div>
    </div>
  );
}

function ProductFormPanel({
  title,
  form,
  setForm,
  onSave,
  onCancel,
  saving,
}: {
  title: string;
  form: EditFormState;
  setForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}){
  const set = (key: keyof EditFormState) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const applyTheme = (theme: typeof COLOUR_THEMES[0]) => {
    setForm((f) => ({
      ...f,
      dotColor: theme.dotColor,
      twBg: theme.twBg,
      twText: theme.twText,
      twBorder: theme.twBorder,
      twAccentBg: theme.twAccentBg,
    }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors text-gray-600"
        >
          <IcX />
        </button>
      </div>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ maxHeight: "calc(100vh - 200px)" }}>

        {/* Image upload */}
        <ImageUpload
          imageUrl={form.imageUrl}
          dotColor={form.dotColor}
          onImageChange={set("imageUrl")}
        />

        {/* Colour theme */}
        <div>
          <Label>Color Theme</Label>
          <div className="flex flex-wrap gap-2">
            {COLOUR_THEMES.map((theme) => (
              <button
                key={theme.label}
                onClick={() => applyTheme(theme)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  form.dotColor === theme.dotColor
                    ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: theme.dotColor }}
                />
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Product Name</Label>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. Sea Salted" />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input value={form.subtitle} onChange={set("subtitle")} placeholder="e.g. Classic" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Price (₦)</Label>
            <Input value={form.price} onChange={set("price")} placeholder="4500" type="number" />
          </div>
          <div>
            <Label>Weight</Label>
            <Input value={form.weight} onChange={set("weight")} placeholder="250g" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Badge</Label>
            <Input value={form.badge} onChange={set("badge")} placeholder="e.g. Best Seller" />
          </div>
          <div>
            <Label>Emoji</Label>
            <Input value={form.emoji} onChange={set("emoji")} placeholder="🥜" />
          </div>
        </div>

        <div>
          <Label>Tagline</Label>
          <Input value={form.tagline} onChange={set("tagline")} placeholder="Short punchy line…" />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Full product description…"
            rows={4}
          />
        </div>

        <div>
          <Label>Tags</Label>
          <Input value={form.tags} onChange={set("tags")} placeholder="Gluten Free, High Protein, Natural" />
          <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Stock Qty (50g)</Label>
            <Input value={form.stockQty50} onChange={set("stockQty50")} placeholder="0" type="number" />
            <p className={`mt-1 text-xs font-semibold ${Number(form.stockQty50 || 0) > 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {Number(form.stockQty50 || 0) > 0 ? "50g: In stock" : "50g: Sold out"}
            </p>
          </div>
          <div>
            <Label>Stock Qty (100g)</Label>
            <Input value={form.stockQty100} onChange={set("stockQty100")} placeholder="0" type="number" />
            <p className={`mt-1 text-xs font-semibold ${Number(form.stockQty100 || 0) > 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {Number(form.stockQty100 || 0) > 0 ? "100g: In stock" : "100g: Sold out"}
            </p>
          </div>
        </div>
      </div>

      {/* Save / cancel footer */}
      <div className="flex gap-3 p-5 border-t border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || !form.name.trim() || !form.price}
          className="flex-1 px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <IcCheck />
          )}
          Save
        </button>
      </div>
    </div>
  );
}

function OrdersPanel({
  orders,
  ordersLoading,
  pagedOrders,
  ordersPage,
  setOrdersPage,
  ordersTotalPages,
  setOrders,
  showToast,
}: {
  orders: (Order & { _id: string; userEmail?: string | null; userName?: string | null })[];
  ordersLoading: boolean;
  pagedOrders: (Order & { _id: string; userEmail?: string | null; userName?: string | null })[];
  ordersPage: number;
  setOrdersPage: React.Dispatch<React.SetStateAction<number>>;
  ordersTotalPages: number;
  setOrders: React.Dispatch<
    React.SetStateAction<
      (Order & { _id: string; userEmail?: string | null; userName?: string | null })[]
    >
  >;
  showToast: (m: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-stone-900">Orders</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!orders.length) return;
              const header = ["Order ID", "Customer", "Email", "Status", "Total", "Date", "Items"];
              const rows = orders.map((o) => [
                o._id,
                o.userName || "",
                o.userEmail || "",
                o.status,
                String(o.total),
                new Date(o.createdAt).toLocaleDateString(),
                (o.items || [])
                  .map((it: { name?: string; grams?: number; qty?: number }) =>
                    `${it.name} ${it.grams ?? 100}g x${it.qty}`
                  )
                  .join(" | "),
              ]);
              const csv = [header, ...rows]
                .map((r) =>
                  r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
                )
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "orders.csv";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            disabled={ordersLoading || !orders.length}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold disabled:opacity-50"
          >
            <IcDownload /> CSV
          </button>
        </div>
      </div>
      {orders.length === 0 ? (
        <p className="text-stone-500 text-sm">No orders yet</p>
      ) : (
        <>
          <div className="space-y-2 max-h-[min(70vh,520px)] overflow-y-auto">
            {pagedOrders.map((order) => (
              <div
                key={order._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-stone-100 rounded-xl px-3 py-3 bg-stone-50/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-stone-900">{order.userName}</p>
                  <p className="text-xs text-stone-600">{order.userEmail}</p>
                  <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">
                    Items:{" "}
                    {(order.items || [])
                      .map((it: { name?: string; grams?: number; qty?: number }) =>
                        `${it.name} ${it.grams ?? 100}g x${it.qty}`
                      )
                      .join(" · ")}
                  </p>
                  {order.deliveryAddress && (
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Deliver to:{" "}
                      <span className="font-medium text-stone-900">
                        {order.deliveryAddress.fullName}
                      </span>
                      {", "}
                      {order.deliveryAddress.line1}
                      {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""}
                      {", "}
                      {order.deliveryAddress.city}, {order.deliveryAddress.state},{" "}
                      {order.deliveryAddress.country}
                      {" · "}
                      {order.deliveryAddress.phone}
                    </p>
                  )}
                  <p className="text-xs text-stone-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-stone-900">{fmt(order.total)}</span>
                  <select
                    value={order.status}
                    onChange={async (e) => {
                      const next = e.target.value as Order["status"];
                      const prev = order.status;
                      setOrders((os) =>
                        os.map((o) => (o._id === order._id ? { ...o, status: next } : o))
                      );
                      try {
                        const res = await fetch(`/api/admin/orders/${order._id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: next }),
                        });
                        if (!res.ok) throw new Error();
                        showToast("✅ Status updated");
                      } catch {
                        setOrders((os) =>
                          os.map((o) => (o._id === order._id ? { ...o, status: prev } : o))
                        );
                        showToast("❌ Failed");
                      }
                    }}
                    className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white text-stone-800"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          {ordersTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 text-sm">
              <button
                type="button"
                disabled={ordersPage <= 1}
                onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 disabled:opacity-40 font-medium"
              >
                Previous
              </button>
              <span className="text-stone-600">
                Page {ordersPage} / {ordersTotalPages}
              </span>
              <button
                type="button"
                disabled={ordersPage >= ordersTotalPages}
                onClick={() => setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 disabled:opacity-40 font-medium"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CouponsPanel({
  coupons,
  newCouponCode,
  setNewCouponCode,
  newCouponPercent,
  setNewCouponPercent,
  setCoupons,
  showToast,
}: {
  coupons: (Coupon & { _id: string })[];
  newCouponCode: string;
  setNewCouponCode: React.Dispatch<React.SetStateAction<string>>;
  newCouponPercent: string;
  setNewCouponPercent: React.Dispatch<React.SetStateAction<string>>;
  setCoupons: React.Dispatch<React.SetStateAction<(Coupon & { _id: string })[]>>;
  showToast: (m: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-stone-900 mb-4">Coupons</h2>
      <form
        className="flex flex-wrap items-end gap-2 mb-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newCouponCode || !newCouponPercent) return;
          try {
            const res = await fetch("/api/admin/coupons", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: newCouponCode,
                discountPercent: Number(newCouponPercent),
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            setCoupons((cs) => [...cs, data.coupon]);
            setNewCouponCode("");
            setNewCouponPercent("");
            showToast("✅ Coupon created");
          } catch {
            showToast("❌ Failed");
          }
        }}
      >
        <div className="flex-1 min-w-[120px]">
          <Label>Code</Label>
          <input
            value={newCouponCode}
            onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
            placeholder="SAVE10"
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-600/40"
          />
        </div>
        <div className="w-24">
          <Label>% Off</Label>
          <input
            type="number"
            min={1}
            max={100}
            value={newCouponPercent}
            onChange={(e) => setNewCouponPercent(e.target.value)}
            placeholder="10"
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-amber-600/40"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
        >
          Add
        </button>
      </form>
      {coupons.length === 0 ? (
        <p className="text-stone-500 text-sm">No coupons yet</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {coupons.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between gap-3 border border-stone-100 rounded-xl px-3 py-2.5"
            >
              <p className="text-sm font-semibold text-stone-900">
                {c.code} · {c.discountPercent}%
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const prev = c.active;
                    setCoupons((cs) =>
                      cs.map((x) => (x._id === c._id ? { ...x, active: !x.active } : x))
                    );
                    try {
                      const res = await fetch(`/api/admin/coupons/${c._id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ active: !prev }),
                      });
                      if (!res.ok) throw new Error();
                    } catch {
                      setCoupons((cs) =>
                        cs.map((x) => (x._id === c._id ? { ...x, active: prev } : x))
                      );
                    }
                  }}
                  className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                    c.active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  {c.active ? "Active" : "Inactive"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const prev = coupons;
                    setCoupons((cs) => cs.filter((x) => x._id !== c._id));
                    try {
                      const res = await fetch(`/api/admin/coupons/${c._id}`, {
                        method: "DELETE",
                      });
                      if (!res.ok) throw new Error();
                      showToast("🗑️ Deleted");
                    } catch {
                      setCoupons(prev);
                      showToast("❌ Failed");
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage(){
  const { data: session } = useSession();
  const isFull = session?.user?.staffAccess === "full";

  const { products, updateProduct, addProduct, deleteProduct, resetProducts } = useProducts();
  const { toast, showToast } = useToast();

  const [tab, setTab] = useState<AdminTab>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [teamEmail, setTeamEmail] = useState("");
  const [teamPassword, setTeamPassword] = useState("");
  const [teamRole, setTeamRole] = useState<"order_manager" | "admin">("order_manager");
  const [teamSaving, setTeamSaving] = useState(false);

  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.staffAccess !== "orders") return;
    setTab((prev) =>
      prev === "overview" || prev === "products" || prev === "coupons" || prev === "team"
        ? "orders"
        : prev
    );
  }, [session?.user?.staffAccess]);

  const [editingId, setEditingId]     = useState<number | null>(null);
  const [addingNew, setAddingNew]     = useState(false);
  const [form, setForm]               = useState<EditFormState>(DEFAULT_NEW_PRODUCT);
  const [saving, setSaving]           = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<
    (Order & { _id: string; userEmail?: string | null; userName?: string | null })[]
  >([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [coupons, setCoupons] = useState<(Coupon & { _id: string })[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponPercent, setNewCouponPercent] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEdit = (p: Product) => {
    setForm(productToForm(p));
    setEditingId(p.id);
    setAddingNew(false);
  };

  const openAdd = () => {
    setForm(DEFAULT_NEW_PRODUCT);
    setEditingId(null);
    setAddingNew(true);
  };

  const closePanel = () => {
    setEditingId(null);
    setAddingNew(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const stockQty50 = Number(form.stockQty50 || 0);
      const stockQty100 = Number(form.stockQty100 || 0);
      const stockQty = stockQty50 + stockQty100;

      const patch: Partial<Product> = {
        name: form.name.trim(),
        subtitle: form.subtitle.trim(),
        price: Number(form.price),
        weight: form.weight.trim(),
        badge: form.badge.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        emoji: form.emoji.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        dotColor: form.dotColor,
        twBg: form.twBg,
        twText: form.twText,
        twBorder: form.twBorder,
        twAccentBg: form.twAccentBg,
        imageUrl: form.imageUrl || undefined,
        stockQty,
        stockQty50,
        stockQty100,
      };

      if (addingNew) {
        const slug = patch.name!.toLowerCase().replace(/\s+/g, "-");
        await addProduct({
          slug,
          name: patch.name!,
          subtitle: patch.subtitle!,
          price: patch.price!,
          weight: patch.weight!,
          badge: patch.badge!,
          tagline: patch.tagline!,
          description: patch.description!,
          emoji: patch.emoji!,
          tags: patch.tags!,
          dotColor: patch.dotColor!,
          twBg: patch.twBg!,
          twText: patch.twText!,
          twBorder: patch.twBorder!,
          twAccentBg: patch.twAccentBg!,
          imageUrl: patch.imageUrl,
          stockQty: patch.stockQty ?? 0,
          stockQty50: (patch as any).stockQty50 ?? 0,
          stockQty100: (patch as any).stockQty100 ?? 0,
        });
        showToast(`✅ "${patch.name}" added!`);
      } else if (editingId !== null) {
        await updateProduct(editingId, patch);
        showToast(`✅ "${patch.name}" updated!`);
      }

      closePanel();
    } catch {
      showToast("❌ Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    try {
      await deleteProduct(p.id);
      showToast(`🗑️ "${p.name}" deleted.`);
      if (editingId === p.id) closePanel();
    } catch {
      showToast("❌ Failed to delete product.");
    }
  };

  const handleReset = async () => {
    try {
      await resetProducts();
      closePanel();
      setConfirmReset(false);
      showToast("🔄 Products reset to defaults.");
    } catch {
      showToast("❌ Failed to reset products.");
    }
  };

  const panelOpen = editingId !== null || addingNew;

  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PAGE_SIZE = 8;
  const ordersTotalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PAGE_SIZE));
  const pagedOrders = orders.slice(
    (ordersPage - 1) * ORDERS_PAGE_SIZE,
    ordersPage * ORDERS_PAGE_SIZE
  );

  useEffect(() => {
    const load = async () => {
      try {
        setOrdersLoading(true);
        const res = await fetch("/api/admin/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } finally {
        setOrdersLoading(false);
      }
      try {
        setCouponsLoading(true);
        const res = await fetch("/api/admin/coupons");
        if (res.ok) {
          const data = await res.json();
          setCoupons(data.coupons || []);
        }
      } finally {
        setCouponsLoading(false);
      }
    };
    load().catch(() => {});
  }, []);

  const goTab = (t: AdminTab) => {
    setTab(t);
    setMobileNavOpen(false);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName,
          email: teamEmail,
          password: teamPassword,
          role: teamRole,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed");
      showToast("✅ Staff account created — they can sign in at /admin/login");
      setTeamName("");
      setTeamEmail("");
      setTeamPassword("");
    } catch (err) {
      showToast(err instanceof Error ? `❌ ${err.message}` : "❌ Failed");
    } finally {
      setTeamSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdNew !== pwdConfirm) {
      showToast("❌ New passwords do not match");
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdCurrent,
          newPassword: pwdNew,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed");
      showToast("✅ Password updated");
      setPwdCurrent("");
      setPwdNew("");
      setPwdConfirm("");
    } catch (err) {
      showToast(err instanceof Error ? `❌ ${err.message}` : "❌ Failed");
    } finally {
      setPwdSaving(false);
    }
  };

  const staffLabel =
    session?.user?.staffAccess === "full"
      ? "Owner"
      : session?.user?.staffAccess === "orders"
        ? "Order staff"
        : "";

  const NavBtn = ({
    id,
    label,
    show = true,
  }: {
    id: AdminTab;
    label: string;
    show?: boolean;
  }) =>
    show ? (
      <button
        type="button"
        onClick={() => goTab(id)}
        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
          tab === id
            ? "bg-amber-500 text-stone-950 shadow-md"
            : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"
        }`}
      >
        {label}
      </button>
    ) : null;

  return (
    <div className="min-h-screen bg-stone-100 flex text-stone-900">
      <aside className="hidden lg:flex w-64 flex-col bg-[#0c0a09] border-r border-stone-800 shrink-0">
        <div className="p-5 border-b border-stone-800">
          <p className="text-amber-500 text-[10px] font-bold tracking-[0.2em] uppercase">
            Cardinal Treats
          </p>
          <p className="text-stone-100 font-bold text-lg mt-1">Staff portal</p>
          <p className="text-stone-500 text-xs mt-2 truncate">{session?.user?.email}</p>
          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-800 text-amber-400">
            {staffLabel}
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavBtn id="overview" label="Overview" show={isFull} />
          <NavBtn id="products" label="Products" show={isFull} />
          <NavBtn id="orders" label="Orders" />
          <NavBtn id="coupons" label="Coupons" show={isFull} />
          {isFull && (
            <Link
              href="/admin/inventory"
              className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-stone-400 hover:bg-stone-800 hover:text-stone-200"
            >
              Inventory report
            </Link>
          )}
          <NavBtn id="team" label="Team" show={isFull} />
          <NavBtn id="settings" label="Account" />
        </nav>
        <div className="p-3 border-t border-stone-800 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-stone-700 text-stone-300 text-xs font-semibold hover:bg-stone-800"
          >
            <IcEye /> View storefront
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full py-2.5 rounded-xl bg-stone-800 text-stone-200 text-xs font-bold hover:bg-stone-700"
          >
            Sign out
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-[#0c0a09] border-r border-stone-800 transform transition-transform lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-stone-800">
          <span className="font-bold text-stone-100">Menu</span>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="p-2 rounded-lg text-stone-400 hover:bg-stone-800"
          >
            <IcX />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavBtn id="overview" label="Overview" show={isFull} />
          <NavBtn id="products" label="Products" show={isFull} />
          <NavBtn id="orders" label="Orders" />
          <NavBtn id="coupons" label="Coupons" show={isFull} />
          {isFull && (
            <Link
              href="/admin/inventory"
              onClick={() => setMobileNavOpen(false)}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-stone-400 hover:bg-stone-800"
            >
              Inventory report
            </Link>
          )}
          <NavBtn id="team" label="Team" show={isFull} />
          <NavBtn id="settings" label="Account" />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 sm:h-16 flex items-center justify-between gap-3 px-4 sm:px-6 bg-white border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl border border-stone-200 text-stone-700"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                {tab === "overview" && "Overview"}
                {tab === "products" && "Products"}
                {tab === "orders" && "Orders"}
                {tab === "coupons" && "Coupons"}
                {tab === "team" && "Team"}
                {tab === "settings" && "Account"}
              </h1>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                {isFull ? "Full access" : "Orders & account only"}
              </p>
            </div>
          </div>
          {tab === "products" && isFull && (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="relative hidden md:block">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  className="pl-8 pr-3 py-2 rounded-xl border border-stone-200 text-sm w-44 lg:w-56"
                />
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <IcReset /> Reset
                </button>
              ) : (
                <div className="flex items-center gap-1 border border-red-200 rounded-xl px-2 py-1 bg-red-50">
                  <span className="text-xs text-red-700 font-semibold">Reset?</span>
                  <button type="button" onClick={handleReset} className="p-1 text-red-600">
                    <IcCheck />
                  </button>
                  <button type="button" onClick={() => setConfirmReset(false)} className="p-1 text-stone-400">
                    <IcX />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={openAdd}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
              >
                <IcPlus /> Add
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {tab === "overview" && isFull && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Products</p>
                  <p className="text-3xl font-black text-stone-900 mt-1">{products.length}</p>
                </div>
                <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Orders</p>
                  <p className="text-3xl font-black text-stone-900 mt-1">{orders.length}</p>
                </div>
                <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Coupons</p>
                  <p className="text-3xl font-black text-stone-900 mt-1">{coupons.length}</p>
                </div>
                <div className="sm:col-span-3 rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-950">
                  <p className="font-bold mb-1">Quick tips</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-900/90">
                    <li>Use <strong>Products</strong> to edit stock for 50g / 100g.</li>
                    <li>
                      Add an <strong>order staff</strong> account under Team — they only see Orders and Account.
                    </li>
                    <li>
                      Forgot your password? Use{" "}
                      <Link href="/auth/forgot-password" className="underline font-semibold">
                        forgot password
                      </Link>{" "}
                      (same flow as the main store).
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {tab === "products" && isFull && (
              <div
                className={`grid gap-6 transition-all ${panelOpen ? "lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_420px]" : "grid-cols-1"}`}
              >
                <div>
                  <p className="text-sm font-semibold text-stone-600 mb-4">
                    Catalog ({filteredProducts.length})
                  </p>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => openEdit(p)}
                        className={`cursor-pointer transition-all ${
                          editingId === p.id ? "ring-2 ring-amber-500 ring-offset-2 rounded-lg" : ""
                        }`}
                      >
                        <AdminProductCard
                          product={p}
                          onEdit={() => openEdit(p)}
                          onDelete={() => handleDelete(p)}
                        />
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="col-span-full text-center py-16 rounded-2xl border border-dashed border-stone-300 bg-white">
                        <p className="text-stone-600 font-medium">No products match your search</p>
                      </div>
                    )}
                    {!panelOpen && (
                      <button
                        type="button"
                        onClick={openAdd}
                        className="rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 hover:bg-amber-50/30 transition-all flex flex-col items-center justify-center gap-2 p-8 text-stone-500 min-h-[220px]"
                      >
                        <IcPlus />
                        <span className="text-sm font-semibold">Add product</span>
                      </button>
                    )}
                  </div>
                </div>
                {panelOpen && (
                  <div className="lg:sticky lg:top-4 lg:self-start">
                    <ProductFormPanel
                      title={addingNew ? "Add Product" : "Edit Product"}
                      form={form}
                      setForm={setForm}
                      onSave={handleSave}
                      onCancel={closePanel}
                      saving={saving}
                    />
                  </div>
                )}
              </div>
            )}

            {tab === "orders" && (
              <OrdersPanel
                orders={orders}
                ordersLoading={ordersLoading}
                pagedOrders={pagedOrders}
                ordersPage={ordersPage}
                setOrdersPage={setOrdersPage}
                ordersTotalPages={ordersTotalPages}
                setOrders={setOrders}
                showToast={showToast}
              />
            )}

            {tab === "coupons" && isFull && (
              <CouponsPanel
                coupons={coupons}
                newCouponCode={newCouponCode}
                setNewCouponCode={setNewCouponCode}
                newCouponPercent={newCouponPercent}
                setNewCouponPercent={setNewCouponPercent}
                setCoupons={setCoupons}
                showToast={showToast}
              />
            )}

            {tab === "team" && isFull && (
              <div className="max-w-lg rounded-2xl bg-white border border-stone-200 p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-stone-900">Add staff account</h2>
                <p className="text-sm text-stone-600">
                  Create a user who can sign in at <strong>/admin/login</strong>.{" "}
                  <strong>Order staff</strong> only sees orders and can update statuses.{" "}
                  <strong>Admin</strong> has full dashboard access.
                </p>
                <form onSubmit={handleCreateStaff} className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={teamName} onChange={setTeamName} placeholder="Full name" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={teamEmail} onChange={setTeamEmail} placeholder="staff@example.com" type="email" />
                  </div>
                  <div>
                    <Label>Temporary password</Label>
                    <Input
                      value={teamPassword}
                      onChange={setTeamPassword}
                      placeholder="Min 6 characters"
                      type="password"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <select
                      value={teamRole}
                      onChange={(e) => setTeamRole(e.target.value as "order_manager" | "admin")}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium"
                    >
                      <option value="order_manager">Order staff (orders only)</option>
                      <option value="admin">Admin (full access)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={teamSaving}
                    className="w-full py-3 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-800 disabled:opacity-50"
                  >
                    {teamSaving ? "Creating…" : "Create account"}
                  </button>
                </form>
              </div>
            )}

            {tab === "settings" && (
              <div className="max-w-lg space-y-6">
                <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-stone-900">Change password</h2>
                  <p className="text-sm text-stone-600">
                    For email &amp; password accounts only. Use the link below if you forgot your password.
                  </p>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label>Current password</Label>
                      <Input
                        value={pwdCurrent}
                        onChange={setPwdCurrent}
                        placeholder="••••••••"
                        type="password"
                      />
                    </div>
                    <div>
                      <Label>New password</Label>
                      <Input
                        value={pwdNew}
                        onChange={setPwdNew}
                        placeholder="Min 6 characters"
                        type="password"
                      />
                    </div>
                    <div>
                      <Label>Confirm new password</Label>
                      <Input
                        value={pwdConfirm}
                        onChange={setPwdConfirm}
                        placeholder="Repeat new password"
                        type="password"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={pwdSaving}
                      className="w-full py-3 rounded-xl bg-amber-600 text-stone-950 text-sm font-bold hover:bg-amber-500 disabled:opacity-50"
                    >
                      {pwdSaving ? "Updating…" : "Update password"}
                    </button>
                  </form>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700">
                  <p className="font-semibold text-stone-900 mb-2">Forgot password?</p>
                  <p className="mb-3">
                    Request a reset code by email — same process as customers.
                  </p>
                  <Link
                    href="/auth/forgot-password"
                    className="inline-flex items-center font-bold text-amber-700 hover:text-amber-600 underline"
                  >
                    Open forgot password →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}