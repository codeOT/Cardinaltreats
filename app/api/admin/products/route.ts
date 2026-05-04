import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireFullAdmin } from "@/lib/admin";
import type { Product } from "@/types";

export async function POST(req: Request) {
  const { ok } = await requireFullAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const packType =
    String(body?.packType || "").trim().toLowerCase() === "carton" ? "carton" : "pouch";
  const rawWeight = String(body?.weight || "100g").trim();
  const weight =
    rawWeight === "50g" ? "50g" : "100g";
  const p50 = body?.price50 != null ? Number(body.price50) : Number.NaN;
  const p100 = body?.price100 != null ? Number(body.price100) : Number.NaN;
  const selectedPrice =
    weight === "50g" ? p50 : p100;
  const selectedStock =
    packType === "carton"
      ? weight === "50g"
        ? Number(body?.stockQty ?? body?.stockQty50 ?? 0)
        : Number(body?.stockQty ?? body?.stockQty100 ?? 0)
      : weight === "50g"
        ? Number(body?.stockQty50 ?? 0)
        : Number(body?.stockQty100 ?? 0);
  if (!body?.name || !Number.isFinite(selectedPrice) || selectedPrice <= 0) {
    return NextResponse.json(
      { error: `Missing fields: name and valid ${packType === "carton" ? `carton ${weight}` : weight} price are required` },
      { status: 400 }
    );
  }

  const productsCol = await getCollection<Product>("products");
  const last = await productsCol.find({}).sort({ id: -1 }).limit(1).toArray();
  const nextId = last[0]?.id ? last[0].id + 1 : 1;
  const lastBySort = await productsCol.find({}).sort({ sortOrder: -1, id: -1 }).limit(1).toArray();
  const nextSortOrder = Number(lastBySort[0]?.sortOrder ?? 0) + 1;

  const name = String(body.name).trim();
  const slug = body.slug
    ? String(body.slug)
    : name.toLowerCase().trim().replace(/\s+/g, "-");

  const doc: Product = {
    id: nextId,
    sortOrder: nextSortOrder,
    packType,
    slug,
    name,
    subtitle: String(body.subtitle || ""),
    price: selectedPrice,
    weight,
    badge: String(body.badge || "New"),
    tagline: String(body.tagline || ""),
    dotColor: String(body.dotColor || "#D97706"),
    emoji: String(body.emoji || "🥜"),
    description: String(body.description || ""),
    tags: Array.isArray(body.tags) ? body.tags : String(body.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
    twBg: String(body.twBg || "bg-amber-50"),
    twText: String(body.twText || "text-amber-700"),
    twBorder: String(body.twBorder || "border-amber-200"),
    twAccentBg: String(body.twAccentBg || "bg-amber-500"),
    imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
    price50:
      weight === "50g" && Number.isFinite(p50) && p50 > 0 ? p50 : undefined,
    price100:
      Number.isFinite(p100) && p100 > 0 ? p100 : undefined,
    stockQty50: packType === "pouch" && weight === "50g" ? Math.max(0, selectedStock) : 0,
    stockQty100: packType === "pouch" && weight === "100g" ? Math.max(0, selectedStock) : 0,
    // Cartons use legacy stockQty as their inventory bucket.
    stockQty: packType === "carton" ? Math.max(0, selectedStock) : 0,
  };

  await productsCol.insertOne(doc as any);
  return NextResponse.json({ product: doc }, { status: 201 });
}

